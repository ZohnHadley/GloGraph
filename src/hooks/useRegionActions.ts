import type { Dispatch, SetStateAction } from 'react';
import { NodeObject, RegionObject } from '../lib/graphObject';
import { NODE_W, NODE_H } from '../lib/regionMembership';
import type { GloRegion, CreateRegionInput, UpdateRegionInput, PanelState } from '../types';
import { useGraph } from './useGraph';
import type { HistoryEntry } from './useHistory';

interface RegionActionsDeps {
  graph: ReturnType<typeof useGraph>;
  history: { push: (entry: HistoryEntry) => void };
  /** A view-only Live Share guest can't mutate — create/save/delete are no-ops. */
  readOnly: boolean;
  selectedNodeId: string | undefined;
  rfSelectionRef: { current: { nodeIds: string[]; edgeIds: string[] } };
  setPanel: Dispatch<SetStateAction<PanelState>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedRegionId: Dispatch<SetStateAction<string | undefined>>;
  setScrollToPos: Dispatch<SetStateAction<{ x: number; y: number } | null>>;
  setMinimizedRegionIds: Dispatch<SetStateAction<Set<string>>>;
  setLockedRegionIds: Dispatch<SetStateAction<Set<string>>>;
}

function regionToUpdateInput(r: GloRegion): UpdateRegionInput {
  return { id: r.id, title: r.title, x: r.x, y: r.y, width: r.width, height: r.height, color: r.color };
}

/**
 * Region create/edit/delete/arrange handlers, extracted from AppInner. Each is a
 * faithful move — same graph CRUD + single undo/redo `history.push` + panel/selection
 * updates as before. Reorganization for file size, not a behaviour change: the deps
 * (graph, history, the selection/panel setters) are injected, the same way
 * `useClipboard` takes them, so the handlers stay wired to AppInner's state.
 */
export function useRegionActions({
  graph,
  history,
  readOnly,
  selectedNodeId,
  rfSelectionRef,
  setPanel,
  setSelectedNodeId,
  setSelectedEdgeId,
  setSelectedRegionId,
  setScrollToPos,
  setMinimizedRegionIds,
  setLockedRegionIds,
}: RegionActionsDeps) {
  async function handleRegionMove(id: string, x: number, y: number) {
    const region = graph.regions.find(r => r.id === id);
    if (!region) return;
    if (region.x === x && region.y === y) return;
    const before = regionToUpdateInput(region);
    const after: UpdateRegionInput = { ...before, x, y };
    await graph.updateRegion(after);
    history.push({
      undo: async () => { await graph.updateRegion(before); },
      redo: async () => { await graph.updateRegion(after); },
    });
  }

  async function handleRegionResize(id: string, x: number, y: number, w: number, h: number) {
    const region = graph.regions.find(r => r.id === id);
    if (!region) return;
    if (region.x === x && region.y === y && region.width === w && region.height === h) return;
    const before = regionToUpdateInput(region);
    const after: UpdateRegionInput = { ...before, x, y, width: w, height: h };
    await graph.updateRegion(after);
    history.push({
      undo: async () => { await graph.updateRegion(before); },
      redo: async () => { await graph.updateRegion(after); },
    });
  }

  async function handleRegionBringToFront(id: string) {
    const region = graph.regions.find(r => r.id === id);
    if (!region) return;
    const others = graph.regions.filter(r => r.id !== id);
    const maxOther = others.length ? Math.max(...others.map(r => r.zOrder)) : -Infinity;
    if (region.zOrder > maxOther) return; // already frontmost
    const before = region.zOrder;
    const after = (others.length ? maxOther : 0) + 1;
    await graph.setRegionZOrder(id, after);
    history.push({
      undo: async () => { await graph.setRegionZOrder(id, before); },
      redo: async () => { await graph.setRegionZOrder(id, after); },
    });
  }

  async function handleRegionSendToBack(id: string) {
    const region = graph.regions.find(r => r.id === id);
    if (!region) return;
    const others = graph.regions.filter(r => r.id !== id);
    const minOther = others.length ? Math.min(...others.map(r => r.zOrder)) : Infinity;
    if (region.zOrder < minOther) return; // already backmost
    const before = region.zOrder;
    const after = (others.length ? minOther : 0) - 1;
    await graph.setRegionZOrder(id, after);
    history.push({
      undo: async () => { await graph.setRegionZOrder(id, before); },
      redo: async () => { await graph.setRegionZOrder(id, after); },
    });
  }

  async function handleSaveRegion(input: CreateRegionInput | UpdateRegionInput): Promise<void> {
    if (readOnly) return;
    if ('id' in input) {
      const before = graph.regions.find(r => r.id === input.id);
      // Use live position/size in case the region was moved/resized after the panel was opened
      const live = before ?? null;
      const safeInput = live
        ? { ...input, x: live.x, y: live.y, width: live.width, height: live.height }
        : input;
      const updated = await graph.updateRegion(safeInput);
      setPanel({ kind: 'editRegion', region: updated });
      if (before) {
        const undoInput = regionToUpdateInput(before);
        history.push({
          undo: async () => {
            const r = await graph.updateRegion(undoInput);
            setPanel(p => p.kind === 'editRegion' && p.region.id === r.id ? { kind: 'editRegion', region: r } : p);
          },
          redo: async () => {
            const r = await graph.updateRegion(safeInput as UpdateRegionInput);
            setPanel(p => p.kind === 'editRegion' && p.region.id === r.id ? { kind: 'editRegion', region: r } : p);
          },
        });
      }
    } else {
      const created = await graph.addRegion(input);
      setPanel({ kind: 'editRegion', region: created });
      setSelectedRegionId(created.id);
      setScrollToPos({ x: created.x + created.width / 2, y: created.y + created.height / 2 });
      history.push({
        undo: async () => { await graph.deleteRegion(created.id); setPanel({ kind: 'none' }); setSelectedRegionId(undefined); },
        redo: async () => {
          await graph.restoreRegion(created);
          setPanel({ kind: 'editRegion', region: created });
          setSelectedRegionId(created.id);
        },
      });
    }
  }

  async function handleDeleteRegion(id: string) {
    if (readOnly) return;
    const snapshot = graph.regions.find(r => r.id === id);
    await graph.deleteRegion(id);
    setMinimizedRegionIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLockedRegionIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPanel({ kind: 'none' });
    setSelectedRegionId(undefined);
    if (snapshot) {
      history.push({
        undo: async () => {
          await graph.restoreRegion(snapshot);
          setPanel({ kind: 'editRegion', region: snapshot });
          setSelectedRegionId(snapshot.id);
        },
        redo: () => graph.deleteRegion(id),
      });
    }
  }

  async function handleWrapSelectionInRegion() {
    const rfSel = rfSelectionRef.current;
    const nodeIds = rfSel.nodeIds.length ? rfSel.nodeIds : selectedNodeId ? [selectedNodeId] : [];
    if (!nodeIds.length) return;
    const selectedNodes = graph.nodes.filter(n => nodeIds.includes(n.id));
    if (!selectedNodes.length) return;
    const PADDING = 24, HEADER_H = 28;
    const minX = Math.min(...selectedNodes.map(n => n.x)) - PADDING;
    const minY = Math.min(...selectedNodes.map(n => n.y)) - PADDING - HEADER_H;
    const maxX = Math.max(...selectedNodes.map(n => n.x + NODE_W)) + PADDING;
    const maxY = Math.max(...selectedNodes.map(n => n.y + NODE_H)) + PADDING;
    const created = await graph.addRegion({
      title: '',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      color: null,
    });
    setPanel({ kind: 'editRegion', region: created });
    setSelectedRegionId(created.id);
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    history.push({
      undo: async () => { await graph.deleteRegion(created.id); setPanel({ kind: 'none' }); setSelectedRegionId(undefined); },
      redo: async () => {
        await graph.restoreRegion(created);
        setPanel({ kind: 'editRegion', region: created });
        setSelectedRegionId(created.id);
      },
    });
  }

  async function handleRegionAutoFit(id: string) {
    const region = graph.regions.find(r => r.id === id);
    if (!region) return;
    const PADDING = 24, HEADER_H = 28;
    const regionEl = new RegionObject(region);
    const members = graph.nodes.filter(n => regionEl.contains(new NodeObject(n)));
    if (!members.length) return;
    const minX = Math.min(...members.map(n => n.x)) - PADDING;
    const minY = Math.min(...members.map(n => n.y)) - PADDING - HEADER_H;
    const maxX = Math.max(...members.map(n => n.x + NODE_W)) + PADDING;
    const maxY = Math.max(...members.map(n => n.y + NODE_H)) + PADDING;
    const before = { id: region.id, title: region.title, x: region.x, y: region.y, width: region.width, height: region.height, color: region.color };
    const updated = await graph.updateRegion({
      id: region.id, title: region.title,
      x: minX, y: minY,
      width: maxX - minX, height: maxY - minY,
      color: region.color,
    });
    setPanel(p => p.kind === 'editRegion' && p.region.id === id ? { kind: 'editRegion', region: updated } : p);
    history.push({
      undo: async () => {
        const r = await graph.updateRegion(before);
        setPanel(p => p.kind === 'editRegion' && p.region.id === id ? { kind: 'editRegion', region: r } : p);
      },
      redo: async () => {
        const r = await graph.updateRegion({ id: region.id, title: region.title, x: minX, y: minY, width: maxX - minX, height: maxY - minY, color: region.color });
        setPanel(p => p.kind === 'editRegion' && p.region.id === id ? { kind: 'editRegion', region: r } : p);
      },
    });
  }

  return {
    handleRegionMove,
    handleRegionResize,
    handleRegionBringToFront,
    handleRegionSendToBack,
    handleSaveRegion,
    handleDeleteRegion,
    handleWrapSelectionInRegion,
    handleRegionAutoFit,
  };
}
