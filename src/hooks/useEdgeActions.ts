import type { Dispatch, SetStateAction } from 'react';
import type { UpdateEdgeInput, WaypointPoint, EdgeParamDef, PanelState } from '../types';
import { useGraph } from './useGraph';
import type { HistoryEntry } from './useHistory';

interface EdgeActionsDeps {
  graph: ReturnType<typeof useGraph>;
  history: { push: (entry: HistoryEntry) => void };
  /** A view-only Live Share guest can't mutate — connect/save are no-ops. */
  readOnly: boolean;
  /** Active preset's edge params — seed a new edge's default param values. */
  activeEdgeParamDefs: EdgeParamDef[];
  setPanel: Dispatch<SetStateAction<PanelState>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | undefined>>;
  setSelectedRegionId: Dispatch<SetStateAction<string | undefined>>;
}

/**
 * Edge create/edit/delete handlers, extracted from AppInner. Faithful move — same
 * graph CRUD, single undo/redo `history.push`, and panel/selection updates as before.
 * Reorganization for file size, not behaviour: deps are injected (matching
 * useRegionActions / useClipboard), so the handlers stay wired to AppInner's state.
 */
export function useEdgeActions({
  graph,
  history,
  readOnly,
  activeEdgeParamDefs,
  setPanel,
  setSelectedNodeId,
  setSelectedEdgeId,
  setSelectedRegionId,
}: EdgeActionsDeps) {
  async function handleConnect(
    sourceId: string,
    targetId: string,
    sourceHandle?: string | null,
    targetHandle?: string | null
  ) {
    if (readOnly) return;
    const paramValues = activeEdgeParamDefs.map(def => ({
      paramDefId: def.id,
      value: def.defaultValue ?? null,
      isEnabled: def.defaultValue != null,
    }));
    const edge = await graph.addEdge({
      sourceId,
      targetId,
      sourceHandle: sourceHandle ?? null,
      targetHandle: targetHandle ?? null,
      paramValues,
    });
    setPanel({ kind: 'editEdge', edge });
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(undefined);
    setSelectedRegionId(undefined);
    history.push({
      undo: () => graph.deleteEdge(edge.id),
      redo: () => graph.restoreEdge(edge),
    });
  }

  async function handleDeleteEdge(id: string) {
    const snapshot = graph.edges.find(e => e.id === id)!;
    await graph.deleteEdge(id);
    setPanel({ kind: 'none' });
    setSelectedEdgeId(undefined);
    history.push({
      undo: () => graph.restoreEdge(snapshot),
      redo: () => graph.deleteEdge(id),
    });
  }

  async function handleFlipEdge(edgeId: string) {
    const edge = graph.edges.find(e => e.id === edgeId);
    if (!edge) return;
    await graph.reconnectEdge(edgeId, edge.targetId, edge.sourceId, edge.targetHandle, edge.sourceHandle);
    setPanel(p => {
      if (p.kind !== 'editEdge' || p.edge.id !== edgeId) return p;
      return {
        kind: 'editEdge',
        edge: { ...p.edge, sourceId: edge.targetId, targetId: edge.sourceId, sourceHandle: edge.targetHandle ?? null, targetHandle: edge.sourceHandle ?? null },
      };
    });
    history.push({
      undo: () => graph.reconnectEdge(edgeId, edge.sourceId, edge.targetId, edge.sourceHandle, edge.targetHandle),
      redo: () => graph.reconnectEdge(edgeId, edge.targetId, edge.sourceId, edge.targetHandle, edge.sourceHandle),
    });
  }

  async function handleEdgeReconnect(
    id: string,
    sourceId: string,
    targetId: string,
    sourceHandle?: string | null,
    targetHandle?: string | null
  ) {
    const old = graph.edges.find(e => e.id === id);
    await graph.reconnectEdge(id, sourceId, targetId, sourceHandle, targetHandle);
    if (old) {
      history.push({
        undo: () => graph.reconnectEdge(id, old.sourceId, old.targetId, old.sourceHandle, old.targetHandle),
        redo: () => graph.reconnectEdge(id, sourceId, targetId, sourceHandle, targetHandle),
      });
    }
  }

  async function handleSaveEdge(input: UpdateEdgeInput) {
    if (readOnly) return;
    const before = graph.edges.find(e => e.id === input.id);
    const updated = await graph.updateEdge(input);
    setPanel({ kind: 'editEdge', edge: updated });
    if (before) {
      const undoInput: UpdateEdgeInput = {
        id: before.id,
        paramValues: before.paramValues.map(pv => ({
          paramDefId: pv.paramDefId,
          value: pv.value,
          isEnabled: pv.isEnabled,
        })),
        label: before.label,
        color: before.color ?? null,
      };
      history.push({
        undo: async () => {
          const r = await graph.updateEdge(undoInput);
          setPanel(p => p.kind === 'editEdge' && p.edge.id === r.id ? { kind: 'editEdge', edge: r } : p);
        },
        redo: async () => {
          const r = await graph.updateEdge(input);
          setPanel(p => p.kind === 'editEdge' && p.edge.id === r.id ? { kind: 'editEdge', edge: r } : p);
        },
      });
    }
  }

  async function handleEdgeLabelChange(id: string, label: string | null) {
    const before = graph.edges.find(e => e.id === id);
    if (!before) return;
    const input: UpdateEdgeInput = {
      id,
      paramValues: before.paramValues.map(pv => ({ paramDefId: pv.paramDefId, value: pv.value, isEnabled: pv.isEnabled })),
      label,
      color: before.color ?? null,
    };
    const oldLabel = before.label ?? null;
    await graph.updateEdge(input);
    history.push({
      undo: async () => { await graph.updateEdge({ ...input, label: oldLabel }); },
      redo: async () => { await graph.updateEdge(input); },
    });
  }

  async function handleEdgeWaypointsChange(id: string, waypoints: WaypointPoint[] | null) {
    const oldWaypoints = graph.edges.find(e => e.id === id)?.waypoints ?? null;
    await graph.updateEdgeWaypoints(id, waypoints);
    history.push({
      undo: async () => { await graph.updateEdgeWaypoints(id, oldWaypoints); },
      redo: async () => { await graph.updateEdgeWaypoints(id, waypoints); },
    });
  }

  return {
    handleConnect,
    handleDeleteEdge,
    handleFlipEdge,
    handleEdgeReconnect,
    handleSaveEdge,
    handleEdgeLabelChange,
    handleEdgeWaypointsChange,
  };
}
