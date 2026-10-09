import type { Dispatch, SetStateAction } from 'react';
import type {
  GloNode,
  CreateNodeInput,
  UpdateNodeInput,
  NodeKind,
  NodePosition,
  AddMediaInput,
  NodeMedia,
  AddLinkInput,
  EdgeParamDef,
  PanelState,
} from '../types';
import { useGraph } from './useGraph';
import type { HistoryEntry } from './useHistory';

interface NodeActionsDeps {
  graph: ReturnType<typeof useGraph>;
  history: { push: (entry: HistoryEntry) => void };
  /** A view-only Live Share guest can't mutate — create/save/delete are no-ops. */
  readOnly: boolean;
  /** Active preset's edge params — quick-connect seeds the new edge's defaults. */
  activeEdgeParamDefs: EdgeParamDef[];
  quickConnectSourceId: string | null;
  setQuickConnectSourceId: Dispatch<SetStateAction<string | null>>;
  setPanel: Dispatch<SetStateAction<PanelState>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedRegionId: Dispatch<SetStateAction<string | undefined>>;
  setScrollToPos: Dispatch<SetStateAction<{ x: number; y: number } | null>>;
}

function nodeToUpdateInput(n: GloNode): UpdateNodeInput {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    eventDate: n.eventDate,
    x: n.x,
    y: n.y,
    color: n.color,
    confidence: n.confidence,
    impactMagnitude: n.impactMagnitude,
    paramValues: n.paramValues.map(pv => ({
      paramDefId: pv.paramDefId,
      value: pv.value,
      isEnabled: pv.isEnabled,
      showOnCard: pv.showOnCard,
    })),
    tags: n.tags,
  };
}

/**
 * Node create/edit/delete/move handlers + the per-node media/link mutations,
 * extracted from AppInner. Faithful move — same graph CRUD, single undo/redo
 * `history.push`, and panel/selection updates as before. Reorganization for file
 * size, not behaviour: deps are injected (matching useRegionActions / useEdgeActions).
 *
 * The create-flow *UI* orchestration (the create-type picker, viewport-centre
 * helpers, `handleCreateItemAtCenter`) stays in AppInner and calls `handleCreateItem`
 * returned here.
 */
export function useNodeActions({
  graph,
  history,
  readOnly,
  activeEdgeParamDefs,
  quickConnectSourceId,
  setQuickConnectSourceId,
  setPanel,
  setSelectedNodeId,
  setSelectedEdgeId,
  setSelectedRegionId,
  setScrollToPos,
}: NodeActionsDeps) {
  // Graph items (note/image/video/audio) are node variants. Unlike a plain node
  // (which is created on Save), an item is created immediately and opened in the
  // edit panel — a media item needs a real node to attach its file to, and the
  // panel auto-surfaces the right field (note body / media picker). Undoable.
  async function handleCreateItem(kind: NodeKind, pos: { x: number; y: number }) {
    const created = await graph.addNode({ title: '', x: pos.x, y: pos.y, paramValues: [], kind });
    setPanel({ kind: 'editNode', node: created });
    setSelectedNodeId(created.id);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
    setScrollToPos({ x: created.x, y: created.y });
    history.push({
      undo: () => graph.deleteNode(created.id),
      redo: () => graph.restoreNode(created),
    });
  }

  // Inline note editing: a note item is edited directly on its card (committed
  // on blur), no detail panel needed. Undoable, like other node edits.
  function handleInlineNoteChange(id: string, text: string) {
    const n = graph.nodes.find(x => x.id === id);
    if (!n) return;
    const next = text.length ? text : null;
    if ((n.description ?? '') === (next ?? '')) return;
    const base = nodeToUpdateInput(n);
    const prev = n.description ?? null;
    void graph.updateNode({ ...base, description: next });
    history.push({
      undo: async () => { await graph.updateNode({ ...base, description: prev }); },
      redo: async () => { await graph.updateNode({ ...base, description: next }); },
    });
  }

  // Toggle whether a note renders its body as markdown (vs raw plain text).
  // Persisted + undoable; a cosmetic per-note display choice.
  function handleToggleRenderMarkdown(id: string) {
    const n = graph.nodes.find(x => x.id === id);
    if (!n) return;
    const next = !(n.renderMarkdown !== false);
    void graph.setNodeRenderMarkdown(id, next);
    history.push({
      undo: async () => { await graph.setNodeRenderMarkdown(id, !next); },
      redo: async () => { await graph.setNodeRenderMarkdown(id, next); },
    });
  }

  // Toggle whether a file node shows its thumbnail / first-page preview (vs just
  // a file-type icon). Persisted + undoable; a cosmetic per-file display choice.
  function handleToggleShowThumbnail(id: string) {
    const n = graph.nodes.find(x => x.id === id);
    if (!n) return;
    const next = !(n.showThumbnail !== false);
    void graph.setNodeShowThumbnail(id, next);
    history.push({
      undo: async () => { await graph.setNodeShowThumbnail(id, !next); },
      redo: async () => { await graph.setNodeShowThumbnail(id, next); },
    });
  }

  // Resizing a stretchable item (image/video/note) persists both its new size
  // and position (NodeResizer can move x/y when dragging top/left). Undoable.
  function handleNodeResize(id: string, x: number, y: number, width: number, height: number) {
    const n = graph.nodes.find(m => m.id === id);
    if (!n) return;
    const before = { x: n.x, y: n.y, w: n.width ?? null, h: n.height ?? null };
    void graph.setNodeSize(id, width, height);
    void graph.updatePositions([{ id, x, y }]);
    history.push({
      undo: async () => { await graph.setNodeSize(id, before.w, before.h); await graph.updatePositions([{ id, x: before.x, y: before.y }]); },
      redo: async () => { await graph.setNodeSize(id, width, height); await graph.updatePositions([{ id, x, y }]); },
    });
  }

  // ── Media / link mutations (undoable) ──────────────────────────────
  // These commit to the DB immediately (not on node Save), so each wraps the
  // graph mutation in a history entry. On restore the original src/url is
  // re-inserted as-is — a missing file just renders the media error placeholder.
  async function handleAddMedia(input: AddMediaInput): Promise<NodeMedia> {
    if (readOnly) throw new Error('View only — editing is disabled.');
    let media = await graph.addMedia(input);
    history.push({
      undo: async () => { await graph.removeMedia(media.id, input.nodeId); },
      redo: async () => { media = await graph.addMedia(input); },
    });
    return media;
  }

  function handleRemoveMedia(id: string, nodeId: string) {
    if (readOnly) return;
    const snap = graph.nodes.find(n => n.id === nodeId)?.media.find(m => m.id === id);
    graph.removeMedia(id, nodeId);
    if (!snap) return;
    let current = snap;
    history.push({
      undo: async () => {
        current = await graph.addMedia({
          nodeId, label: current.label, src: current.src,
          srcType: current.srcType, mediaType: current.mediaType,
          showOnCard: current.showOnCard,
        });
      },
      redo: async () => { await graph.removeMedia(current.id, nodeId); },
    });
  }

  function handleReorderMedia(nodeId: string, mediaId: string, direction: 'up' | 'down') {
    if (readOnly) return;
    graph.reorderMedia(nodeId, mediaId, direction);
    const reverse = direction === 'up' ? 'down' : 'up';
    history.push({
      undo: async () => { await graph.reorderMedia(nodeId, mediaId, reverse); },
      redo: async () => { await graph.reorderMedia(nodeId, mediaId, direction); },
    });
  }

  async function handleAddLink(input: AddLinkInput): Promise<void> {
    if (readOnly) return;
    let link = await graph.addLink(input);
    history.push({
      undo: async () => { await graph.removeLink(link.id, input.nodeId); },
      redo: async () => { link = await graph.addLink(input); },
    });
  }

  function handleRemoveLink(linkId: string, nodeId: string) {
    if (readOnly) return;
    const snap = graph.nodes.find(n => n.id === nodeId)?.links.find(l => l.id === linkId);
    graph.removeLink(linkId, nodeId);
    if (!snap) return;
    let current = snap;
    history.push({
      undo: async () => {
        current = await graph.addLink({ nodeId, url: current.url, label: current.label ?? null });
      },
      redo: async () => { await graph.removeLink(current.id, nodeId); },
    });
  }

  async function handleNodeBringToFront(id: string) {
    const node = graph.nodes.find(n => n.id === id);
    if (!node) return;
    const others = graph.nodes.filter(n => n.id !== id);
    const maxOther = others.length ? Math.max(...others.map(n => n.zOrder ?? 0)) : -Infinity;
    if ((node.zOrder ?? 0) > maxOther) return; // already frontmost
    const before = node.zOrder ?? 0;
    const after = (others.length ? maxOther : 0) + 1;
    await graph.setNodeZOrder(id, after);
    history.push({
      undo: async () => { await graph.setNodeZOrder(id, before); },
      redo: async () => { await graph.setNodeZOrder(id, after); },
    });
  }

  async function handleNodeSendToBack(id: string) {
    const node = graph.nodes.find(n => n.id === id);
    if (!node) return;
    const others = graph.nodes.filter(n => n.id !== id);
    const minOther = others.length ? Math.min(...others.map(n => n.zOrder ?? 0)) : Infinity;
    if ((node.zOrder ?? 0) < minOther) return; // already backmost
    const before = node.zOrder ?? 0;
    const after = (others.length ? minOther : 0) - 1;
    await graph.setNodeZOrder(id, after);
    history.push({
      undo: async () => { await graph.setNodeZOrder(id, before); },
      redo: async () => { await graph.setNodeZOrder(id, after); },
    });
  }

  async function handleSaveNode(input: CreateNodeInput | UpdateNodeInput): Promise<void> {
    if (readOnly) return;
    if ('id' in input) {
      const before = graph.nodes.find(n => n.id === input.id)!;
      const updated = await graph.updateNode(input);
      setPanel({ kind: 'editNode', node: updated });
      const undoInput = nodeToUpdateInput(before);
      history.push({
        undo: async () => { const r = await graph.updateNode(undoInput); setPanel(p => p.kind === 'editNode' && p.node.id === r.id ? { kind: 'editNode', node: r } : p); },
        redo: async () => { const r = await graph.updateNode(input as UpdateNodeInput); setPanel(p => p.kind === 'editNode' && p.node.id === r.id ? { kind: 'editNode', node: r } : p); },
      });
    } else {
      const created = await graph.addNode(input);
      setPanel({ kind: 'editNode', node: created });
      setSelectedNodeId(created.id);
      setScrollToPos({ x: created.x, y: created.y });
      history.push({
        undo: () => graph.deleteNode(created.id),
        redo: () => graph.restoreNode(created),
      });
    }
  }

  async function handleDeleteNode(id: string) {
    if (readOnly) return;
    const snapshot = graph.nodes.find(n => n.id === id)!;
    const connectedEdges = graph.edges.filter(e => e.sourceId === id || e.targetId === id);
    await graph.deleteNode(id);
    setPanel({ kind: 'none' });
    setSelectedNodeId(undefined);
    history.push({
      undo: async () => {
        await graph.restoreNode(snapshot);
        await Promise.all(connectedEdges.map(e => graph.restoreEdge(e)));
      },
      redo: () => graph.deleteNode(id),
    });
  }

  async function handleDeleteMultiple(nodeIds: string[], edgeIds: string[]) {
    if (readOnly) return;
    const nodeIdSet = new Set(nodeIds);
    const standaloneEdgeIds = edgeIds.filter(id => {
      const edge = graph.edges.find(e => e.id === id);
      return edge && !nodeIdSet.has(edge.sourceId) && !nodeIdSet.has(edge.targetId);
    });
    const nodeSnapshots = nodeIds.map(id => graph.nodes.find(n => n.id === id)!).filter(Boolean);
    const standaloneEdgeSnapshots = standaloneEdgeIds.map(id => graph.edges.find(e => e.id === id)!).filter(Boolean);
    const cascadeEdgeSnapshots = graph.edges.filter(e => nodeIdSet.has(e.sourceId) || nodeIdSet.has(e.targetId));
    await Promise.all([
      ...standaloneEdgeIds.map(id => graph.deleteEdge(id)),
      ...nodeIds.map(id => graph.deleteNode(id)),
    ]);
    setPanel({ kind: 'none' });
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    history.push({
      undo: async () => {
        await Promise.all(nodeSnapshots.map(n => graph.restoreNode(n)));
        await Promise.all([...standaloneEdgeSnapshots, ...cascadeEdgeSnapshots].map(e => graph.restoreEdge(e)));
      },
      redo: async () => {
        await Promise.all([
          ...standaloneEdgeIds.map(id => graph.deleteEdge(id)),
          ...nodeIds.map(id => graph.deleteNode(id)),
        ]);
      },
    });
  }

  async function handleNodeMove(positions: NodePosition[], frontIds: string[] = []) {
    const oldPositions = positions.map(p => {
      const n = graph.nodes.find(n => n.id === p.id);
      return n ? { id: n.id, x: n.x, y: n.y } : p;
    });

    // Dragging a node also brings it to the front **permanently** (persisted
    // zOrder), so the new stacking survives clicking off / reload — folded into the
    // same undo step as the move. Only nodes not already frontmost are bumped (no
    // churn); region drags pass no ids. Relative order among co-dragged nodes is kept.
    const others = graph.nodes.filter(n => !frontIds.includes(n.id));
    const maxOther = others.length ? Math.max(...others.map(n => n.zOrder ?? 0)) : 0;
    const toBump = graph.nodes
      .filter(n => frontIds.includes(n.id) && (n.zOrder ?? 0) <= maxOther)
      .sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0));
    const oldZ = toBump.map(n => ({ id: n.id, z: n.zOrder ?? 0 }));
    const newZ = toBump.map((n, i) => ({ id: n.id, z: maxOther + 1 + i }));

    await graph.updatePositions(positions);
    for (const { id, z } of newZ) await graph.setNodeZOrder(id, z);

    history.push({
      undo: async () => {
        await graph.updatePositions(oldPositions);
        for (const { id, z } of oldZ) await graph.setNodeZOrder(id, z);
      },
      redo: async () => {
        await graph.updatePositions(positions);
        for (const { id, z } of newZ) await graph.setNodeZOrder(id, z);
      },
    });
  }

  async function handleQuickConnect(title: string) {
    const source = graph.nodes.find(n => n.id === quickConnectSourceId);
    if (!source) { setQuickConnectSourceId(null); return; }
    setQuickConnectSourceId(null);
    const newNode = await graph.addNode({
      title,
      description: null,
      eventDate: null,
      x: source.x + 260,
      y: source.y,
      color: null,
      confidence: null,
      impactMagnitude: null,
      paramValues: [],
    });
    const edge = await graph.addEdge({
      sourceId: source.id,
      targetId: newNode.id,
      sourceHandle: null,
      targetHandle: null,
      paramValues: activeEdgeParamDefs.map(def => ({
        paramDefId: def.id,
        value: def.defaultValue ?? null,
        isEnabled: def.defaultValue != null,
      })),
    });
    setPanel({ kind: 'editNode', node: newNode });
    setSelectedNodeId(newNode.id);
    setScrollToPos({ x: newNode.x, y: newNode.y });
    history.push({
      undo: async () => {
        await graph.deleteEdge(edge.id);
        await graph.deleteNode(newNode.id);
        setPanel({ kind: 'editNode', node: source });
        setSelectedNodeId(source.id);
      },
      redo: async () => {
        await graph.restoreNode(newNode);
        await graph.restoreEdge(edge);
      },
    });
  }

  return {
    handleCreateItem,
    handleInlineNoteChange,
    handleToggleRenderMarkdown,
    handleToggleShowThumbnail,
    handleNodeResize,
    handleAddMedia,
    handleRemoveMedia,
    handleReorderMedia,
    handleAddLink,
    handleRemoveLink,
    handleNodeBringToFront,
    handleNodeSendToBack,
    handleSaveNode,
    handleDeleteNode,
    handleDeleteMultiple,
    handleNodeMove,
    handleQuickConnect,
  };
}
