import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import type { AddMediaInput, CreateNodeInput, GloNode, GloRegion, NodeKind, NodeMedia } from '../types';
import { IS_DEMO } from '../lib/env';
import { NODE_W, NODE_H } from '../lib/regionMembership';
import { mediaKindForPath, baseNameOf, urlFromDataTransfer } from '../lib/dropMedia';

const HALF_W = NODE_W / 2;
const HALF_H = NODE_H / 2;

/**
 * Drag-and-drop of media onto the canvas. Two sources:
 *  - **Files** arrive via Tauri's native drag-drop (`onDragDropEvent`), which is
 *    what gives us absolute paths; we store them as `srcType:'file'`. In a Live
 *    Share session a guest's path is local to the guest — but routing through
 *    `addMedia`/`attachMedia` means the `remoteApi` seam reads the bytes and
 *    uploads them to the host automatically (no special casing here).
 *  - **URLs** (e.g. an image dragged from a browser) arrive via HTML5 drop; if the
 *    URL's extension names a media type we store it as `srcType:'url'`.
 *
 * Drop target decides create-vs-attach: onto a regular node → attach the media to
 * it; onto a region or empty canvas → create a new image/video/audio item (centred
 * on the drop inside a region so it lands within / is captured by it).
 */
export interface MediaDropDeps {
  /** Off for view-only guests (and any other read-only context). */
  enabled: boolean;
  screenToFlowRef: MutableRefObject<((p: { x: number; y: number }) => { x: number; y: number }) | null>;
  nodes: GloNode[];
  regions: GloRegion[];
  addNode: (input: CreateNodeInput) => Promise<GloNode>;
  /** Raw add (used inside a combined create+media history entry). */
  addMedia: (input: AddMediaInput) => Promise<NodeMedia>;
  /** Undoable attach (App's handleAddMedia) — used when dropping onto a node. */
  attachMedia: (input: AddMediaInput) => Promise<NodeMedia>;
  deleteNode: (id: string) => Promise<void>;
  restoreNode: (n: GloNode) => Promise<void>;
  pushHistory: (e: { undo: () => Promise<void>; redo: () => Promise<void> }) => void;
  toast: (msg: string, ok: boolean) => void;
}

type DropTarget = { kind: 'node'; id: string } | { kind: 'region' } | { kind: 'pane' };

export function useMediaDrop(deps: MediaDropDeps): { dropActive: boolean } {
  const ref = useRef(deps);
  ref.current = deps;
  const [dropActive, setDropActive] = useState(false);

  // All handlers read `ref.current` so the listeners below can mount once ([] deps)
  // and still see live state. (Build is tsc-only; no exhaustive-deps lint to satisfy.)
  useEffect(() => {
    function isOverCanvas(x: number, y: number): boolean {
      return !!document.elementFromPoint(x, y)?.closest('.react-flow');
    }

    function resolveTarget(x: number, y: number): DropTarget {
      const nodeEl = document.elementFromPoint(x, y)?.closest('.react-flow__node') as HTMLElement | null;
      const id = nodeEl?.dataset.id;
      if (id) {
        if (ref.current.nodes.some(n => n.id === id)) return { kind: 'node', id };
        if (ref.current.regions.some(r => r.id === id)) return { kind: 'region' };
      }
      return { kind: 'pane' };
    }

    async function createItem(
      nodeKind: NodeKind, mediaType: string, flow: { x: number; y: number }, inRegion: boolean,
      label: string, src: string, srcType: 'file' | 'url', offset: number,
    ): Promise<void> {
      const d = ref.current;
      // Inside a region, centre the node on the drop so its centre lands in the
      // region (auto-captured when locked, via live geometry). On the pane, the
      // top-left sits at the drop point. Multiple items fan out so they don't stack.
      const baseX = (inRegion ? flow.x - HALF_W : flow.x) + offset * 28;
      const baseY = (inRegion ? flow.y - HALF_H : flow.y) + offset * 28;
      // A file node takes the filename as its (editable) title; media items stay
      // untitled (their filename is the display fallback).
      const title = nodeKind === 'file' ? (label || baseNameOf(src)) : '';
      const created = await d.addNode({ title, x: baseX, y: baseY, paramValues: [], kind: nodeKind });
      const media = await d.addMedia({ nodeId: created.id, label, src, srcType, mediaType, showOnCard: true });
      d.pushHistory({
        undo: () => d.deleteNode(created.id),
        redo: () => d.restoreNode({ ...created, media: [media] }),
      });
    }

    async function handleFilesDrop(paths: string[], x: number, y: number): Promise<void> {
      const d = ref.current;
      if (!d.enabled || !isOverCanvas(x, y)) return;
      const project = d.screenToFlowRef.current;
      if (!project) return;
      const target = resolveTarget(x, y);
      const flow = project({ x, y });
      let created = 0;
      for (const path of paths) {
        const kind = mediaKindForPath(path); // image/video/audio, or null for any other file
        try {
          if (kind && target.kind === 'node') {
            // A recognised media file dropped onto a node attaches to it.
            await d.attachMedia({ nodeId: target.id, label: baseNameOf(path), src: path, srcType: 'file', mediaType: kind, showOnCard: true });
          } else if (kind) {
            await createItem(kind, kind, flow, target.kind === 'region', baseNameOf(path), path, 'file', created);
          } else {
            // Anything else → a file node (always created, even over a node).
            await createItem('file', 'file', flow, target.kind === 'region', baseNameOf(path), path, 'file', created);
          }
          created++;
        } catch {
          d.toast('Could not add dropped file', false);
        }
      }
    }

    async function handleUrlDrop(url: string, x: number, y: number): Promise<void> {
      const d = ref.current;
      if (!d.enabled) return;
      const project = d.screenToFlowRef.current;
      if (!project) return;
      const kind = mediaKindForPath(url); // recognised media URL, or null → file node
      const target = resolveTarget(x, y);
      try {
        if (kind && target.kind === 'node') {
          await d.attachMedia({ nodeId: target.id, label: '', src: url, srcType: 'url', mediaType: kind, showOnCard: true });
        } else if (kind) {
          await createItem(kind, kind, project({ x, y }), target.kind === 'region', '', url, 'url', 0);
        } else {
          await createItem('file', 'file', project({ x, y }), target.kind === 'region', baseNameOf(url), url, 'url', 0);
        }
      } catch {
        d.toast('Could not add dropped file', false);
      }
    }

    // ── Tauri native file drop (gives absolute paths) ──
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    if (!IS_DEMO) {
      getCurrentWebview().onDragDropEvent(evt => {
        const p = evt.payload;
        if (p.type === 'enter' || p.type === 'over') {
          if (ref.current.enabled) setDropActive(true);
        } else if (p.type === 'leave') {
          setDropActive(false);
        } else if (p.type === 'drop') {
          setDropActive(false);
          const dpr = window.devicePixelRatio || 1;
          void handleFilesDrop(p.paths, p.position.x / dpr, p.position.y / dpr);
        }
      }).then(fn => { if (cancelled) fn(); else unlisten = fn; }).catch(() => { /* not in Tauri */ });
    }

    // ── HTML5 URL drop (browser-style link/image drags) ──
    function onDragOver(e: DragEvent) {
      const dt = e.dataTransfer;
      if (!dt || dt.types.includes('Files')) return; // files are handled natively above
      if (!(dt.types.includes('text/uri-list') || dt.types.includes('text/plain'))) return;
      if (!ref.current.enabled || !isOverCanvas(e.clientX, e.clientY)) return;
      e.preventDefault(); // required for `drop` to fire
      setDropActive(true);
    }
    function onDrop(e: DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) return; // native handler owns files
      const url = urlFromDataTransfer(e.dataTransfer);
      if (!url || !isOverCanvas(e.clientX, e.clientY)) return;
      e.preventDefault();
      setDropActive(false);
      void handleUrlDrop(url, e.clientX, e.clientY);
    }
    const clearActive = () => setDropActive(false);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragleave', clearActive);
    document.addEventListener('dragend', clearActive);

    return () => {
      cancelled = true;
      unlisten?.();
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragleave', clearActive);
      document.removeEventListener('dragend', clearActive);
    };
  }, []);

  return { dropActive };
}
