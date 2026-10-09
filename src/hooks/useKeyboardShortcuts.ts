import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Viewport } from '@xyflow/react';
import { partitionIds } from '../lib/graphObject';
import type { GloNode, GloEdge, GloRegion } from '../types';
import type { CanvasBookmark } from '../components/BookmarkBar';

/** Copy/duplicate payload — the current selection resolved to portable data. */
export interface ClipboardPayload {
  nodes: GloNode[];
  edges: GloEdge[];
  regions: GloRegion[];
  pinnedNodeIds: Set<string>;
  pinnedExpandIds: Set<string>;
  lockedRegionIds: Set<string>;
  minimizedRegionIds: Set<string>;
}

/**
 * Latest app state + actions the global keydown handler reads. Held in a ref and
 * refreshed every render by AppInner, so the keyboard effect can stay stable
 * (`[]` deps) while always seeing current values.
 */
export interface KeyboardShortcutState {
  selectedNodeId: string | undefined;
  selectedEdgeId: string | undefined;
  selectedRegionId: string | undefined;
  nodes: GloNode[];
  edges: GloEdge[];
  regions: GloRegion[];
  openCreatePicker: () => void;
  handleDeleteMultiple: (nodeIds: string[], edgeIds: string[]) => Promise<void>;
  handleDeleteRegion: (id: string) => Promise<void>;
  handlePaste: (clip: { nodes: GloNode[]; edges: GloEdge[]; regions: GloRegion[]; pinnedNodeIds?: Set<string>; pinnedExpandIds?: Set<string>; lockedRegionIds?: Set<string>; minimizedRegionIds?: Set<string> }) => Promise<void>;
  pinnedNodeIds: Set<string>;
  pinnedExpandIds: Set<string>;
  lockedRegionIds: Set<string>;
  minimizedRegionIds: Set<string>;
  triggerSave: () => void;
  openSaveAs: () => void;
  openNewTab: () => void;
  closeActiveTab: () => void;
  openProject: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  cycleRoutingMode: () => void;
  openQuickFind: () => void;
  autoWire: () => Promise<void>;
  toggleExpand: () => void;
  /** View-only guest: swallow mutating shortcuts (read/nav/filter/trace still work). */
  readOnly?: boolean;
}

/**
 * Everything the global keyboard handler touches. All members are stable across
 * renders (refs, `useState` setters, hoisted callbacks), so the handler can be
 * registered once. The canonical shortcut list mirrors `SHORTCUTS` in
 * GraphSettings.tsx and UX_SPEC §14 — keep the three in sync.
 */
export interface KeyboardShortcutDeps {
  keyStateRef: { current: KeyboardShortcutState };
  rfSelectionRef: { current: { nodeIds: string[]; edgeIds: string[] } };
  orderedSelectionRef: { current: string[] };
  clipboardRef: { current: ClipboardPayload | null };
  viewportRef: { current: Viewport };
  bookmarksRef: { current: CanvasBookmark[] };
  saveBookmarksRef: { current: (next: CanvasBookmark[]) => void };
  setPanel: (panel: { kind: 'none' }) => void;
  setSelectedNodeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedRegionId: Dispatch<SetStateAction<string | undefined>>;
  setSearchFocusTrigger: Dispatch<SetStateAction<number>>;
  setSelectAllTrigger: Dispatch<SetStateAction<number>>;
  setSelectRegionTrigger: Dispatch<SetStateAction<number>>;
  setZoomToSelectionTrigger: Dispatch<SetStateAction<number>>;
  setFocusMode: Dispatch<SetStateAction<boolean>>;
  setQuickConnectSourceId: Dispatch<SetStateAction<string | null>>;
  clearTrace: () => void;
  buildClipboardPayload: () => ClipboardPayload | null;
}

/**
 * Register the app-wide keyboard shortcuts. A single document `keydown` listener,
 * mounted once; per-render state is read through the refs in `deps`. Bare-letter
 * shortcuts are suppressed while typing in a field (`isEditingText`), and Ctrl+A
 * defers to the browser inside text fields.
 */
export function useKeyboardShortcuts(deps: KeyboardShortcutDeps): void {
  useEffect(() => {
    const {
      keyStateRef, rfSelectionRef, orderedSelectionRef, clipboardRef,
      viewportRef, bookmarksRef, saveBookmarksRef,
      setPanel, setSelectedNodeId, setSelectedEdgeId, setSelectedRegionId,
      setSearchFocusTrigger, setSelectAllTrigger, setSelectRegionTrigger,
      setZoomToSelectionTrigger, setFocusMode, setQuickConnectSourceId,
      clearTrace, buildClipboardPayload,
    } = deps;

    function isEditingText() {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag ?? '');
    }

    function onKey(e: KeyboardEvent) {
      const {
        selectedNodeId,
        selectedEdgeId,
        selectedRegionId,
        nodes,
        edges,
        regions,
        openCreatePicker,
        handleDeleteMultiple,
        handleDeleteRegion,
        handlePaste,
      } = keyStateRef.current;

      // View-only guest: swallow mutating shortcuts (create/delete/paste/duplicate/
      // auto-wire/undo-redo/bookmark/routing/quick-connect). Read, navigation,
      // filter, expand and trace shortcuts still work; typing in a field is never
      // blocked.
      if (keyStateRef.current.readOnly) {
        const k = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const mutates =
          (ctrl && ['z', 'y', 'Z', 'b', 'v', 'd'].includes(k)) ||
          (!ctrl && !e.altKey && ['n', 'r', 'w'].includes(k)) ||
          k === 'Delete' || k === 'Backspace' ||
          (k === 'Tab' && !ctrl && !e.shiftKey);
        if (mutates) {
          if (isEditingText()) return; // let the focused field handle typing/backspace
          if (k === 'Delete' || k === 'Backspace' || k === 'Tab') e.preventDefault();
          return;
        }
      }

      if (e.key === 'Escape') {
        setPanel({ kind: 'none' });
        setSelectedNodeId(undefined);
        setSelectedEdgeId(undefined);
        setSelectedRegionId(undefined);
        clearTrace();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchFocusTrigger(t => t + 1);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        keyStateRef.current.openNewTab?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        keyStateRef.current.closeActiveTab?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        keyStateRef.current.openSaveAs?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        keyStateRef.current.triggerSave?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        keyStateRef.current.openProject?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        keyStateRef.current.undo?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        keyStateRef.current.redo?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        // In a text field, let the browser select the field's text rather than
        // hijacking Ctrl+A to select every graph element.
        if (isEditingText()) return;
        e.preventDefault();
        const { selectedRegionId } = keyStateRef.current;
        if (selectedRegionId) {
          setSelectRegionTrigger(t => t + 1);
        } else {
          setSelectAllTrigger(t => t + 1);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setZoomToSelectionTrigger(t => t + 1);
        return;
      }

      if (isEditingText()) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        const vp = viewportRef.current;
        const cur = bookmarksRef.current;
        const name = `View ${cur.length + 1}`;
        const bm: CanvasBookmark = { id: crypto.randomUUID(), name, ...vp };
        saveBookmarksRef.current([...cur, bm]);
        return;
      }

      if (e.key === '\\') {
        e.preventDefault();
        setFocusMode(f => !f);
        return;
      }

      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        openCreatePicker?.();
        return;
      }

      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        keyStateRef.current.cycleRoutingMode?.();
        return;
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        keyStateRef.current.openQuickFind?.();
        return;
      }

      if (e.key === 'w' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const rfSel = rfSelectionRef.current;
        const hasMulti = orderedSelectionRef.current.length >= 2 || rfSel.nodeIds.length >= 2;
        if (hasMulti) { e.preventDefault(); keyStateRef.current.autoWire?.(); }
        return;
      }

      if (e.key === 'e' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Expand/collapse: all nodes, or just the selection if any nodes are selected.
        e.preventDefault();
        keyStateRef.current.toggleExpand?.();
        return;
      }

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const { selectedNodeId } = keyStateRef.current;
        const rfSel = rfSelectionRef.current;
        const hasSelection = selectedNodeId || rfSel.nodeIds.length > 0;
        if (hasSelection) { e.preventDefault(); setZoomToSelectionTrigger(t => t + 1); }
        return;
      }

      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const { selectedNodeId } = keyStateRef.current;
        if (selectedNodeId) {
          e.preventDefault();
          setQuickConnectSourceId(selectedNodeId);
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const rfSel = rfSelectionRef.current;
        const allSelectedIds = rfSel.nodeIds.length
          ? rfSel.nodeIds
          : [
              ...(selectedNodeId ? [selectedNodeId] : []),
              ...(selectedRegionId ? [selectedRegionId] : []),
            ];
        const explicitEdgeIds = rfSel.edgeIds.length
          ? rfSel.edgeIds
          : selectedEdgeId ? [selectedEdgeId] : [];

        const { nodeIds, regionIds } = partitionIds({ nodes, edges, regions }, allSelectedIds);

        if (nodeIds.length || explicitEdgeIds.length) handleDeleteMultiple?.(nodeIds, explicitEdgeIds);
        for (const id of regionIds) handleDeleteRegion?.(id);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        const payload = buildClipboardPayload();
        if (payload) clipboardRef.current = payload;
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const clip = clipboardRef.current;
        if (clip && (clip.nodes.length || clip.regions.length)) handlePaste?.(clip);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const payload = buildClipboardPayload();
        if (payload) handlePaste?.(payload);
        return;
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}
