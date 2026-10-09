import type { Dispatch, SetStateAction } from 'react';
import { computeLayout } from '../lib/layout';
import { NODE_W, NODE_H, isNodeInRegion } from '../lib/regionMembership';
import type { GloEdge, EdgeParamDef } from '../types';
import { useGraph } from './useGraph';
import type { HistoryEntry } from './useHistory';

const NODE_HALF_W = NODE_W / 2;
const NODE_HALF_H = NODE_H / 2;

interface GraphArrangeDeps {
  graph: ReturnType<typeof useGraph>;
  history: { push: (entry: HistoryEntry) => void };
  /** A view-only Live Share guest can't mutate — auto-wire is a no-op. */
  readOnly: boolean;
  /** Active preset's edge params — seed each auto-wired edge's defaults. */
  activeEdgeParamDefs: EdgeParamDef[];
  /** Click-ordered multi-selection (preferred wiring order). */
  orderedSelectionRef: { current: string[] };
  /** RF drag-selection (fallback, sorted by drag direction). */
  rfSelectionRef: { current: { nodeIds: string[]; edgeIds: string[] } };
  /** Last drag-select vector — orients fallback wiring order. */
  dragVectorRef: { current: { dx: number; dy: number } | null };
  lockedRegionIds: Set<string>;
  setFitViewTrigger: Dispatch<SetStateAction<number>>;
}

/**
 * Graph-wide arrange operations, extracted from AppInner: Auto-Wire (connect the
 * selected nodes in order) and Auto-Layout (dagre + fit-view). Faithful move — same
 * logic, single undo/redo `history.push`. Deps are injected, matching the other
 * extracted action-hooks.
 */
export function useGraphArrange({
  graph,
  history,
  readOnly,
  activeEdgeParamDefs,
  orderedSelectionRef,
  rfSelectionRef,
  dragVectorRef,
  lockedRegionIds,
  setFitViewTrigger,
}: GraphArrangeDeps) {
  async function handleAutoWire() {
    if (readOnly) return;
    const regionIdSet = new Set(graph.regions.map(r => r.id));

    // Prefer click-ordered selection; fall back to RF drag-selection sorted by drag direction.
    let ids = orderedSelectionRef.current.filter(id => !regionIdSet.has(id) && graph.nodes.find(n => n.id === id));
    if (ids.length < 2) {
      const rfIds = rfSelectionRef.current.nodeIds.filter(id => !regionIdSet.has(id));
      const v = dragVectorRef.current;
      ids = rfIds.slice().sort((a, b) => {
        const na = graph.nodes.find(n => n.id === a)!;
        const nb = graph.nodes.find(n => n.id === b)!;
        if (v && (Math.abs(v.dx) > 4 || Math.abs(v.dy) > 4)) {
          const projA = (na.x + NODE_HALF_W) * v.dx + (na.y + NODE_HALF_H) * v.dy;
          const projB = (nb.x + NODE_HALF_W) * v.dx + (nb.y + NODE_HALF_H) * v.dy;
          return projA - projB;
        }
        return na.x !== nb.x ? na.x - nb.x : na.y - nb.y;
      });
    }
    if (ids.length < 2) return;

    const createdEdges: GloEdge[] = [];
    for (let i = 0; i < ids.length - 1; i++) {
      const paramValues = activeEdgeParamDefs.map(def => ({
        paramDefId: def.id,
        value: def.defaultValue ?? null,
        isEnabled: def.defaultValue != null,
      }));
      // Handles omitted → the backend connects from the closest sides (one source
      // of truth: src-tauri/src/core/handles.rs, the same rule the HTTP API uses).
      const edge = await graph.addEdge({ sourceId: ids[i], targetId: ids[i + 1], sourceHandle: null, targetHandle: null, paramValues });
      createdEdges.push(edge);
    }
    history.push({
      undo: async () => { for (const e of createdEdges) await graph.deleteEdge(e.id); },
      redo: async () => { for (const e of createdEdges) await graph.restoreEdge(e); },
    });
  }

  async function handleAutoLayout(direction: 'TB' | 'LR') {
    if (!graph.nodes.length) return;
    const oldPositions = graph.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
    const computed = await computeLayout(graph.nodes, graph.edges, direction);
    // Nodes inside a locked region keep their current position — a lock means the
    // arrangement is intentional, so auto-layout must not tear the group apart
    // (previously layout ignored membership and members drifted out of regions).
    const lockedRegions = graph.regions.filter(r => lockedRegionIds.has(r.id));
    const positions = lockedRegions.length
      ? computed.map(p => {
          const n = graph.nodes.find(nn => nn.id === p.id)!;
          // Locked-region members keep their exact position so the group isn't torn apart.
          if (lockedRegions.some(r => isNodeInRegion(n, r))) return { id: p.id, x: n.x, y: n.y };
          // A non-member that dagre placed on top of a locked region is nudged just
          // below it, so auto-layout never drops a loose node inside a locked group.
          const over = lockedRegions.find(r => isNodeInRegion({ x: p.x, y: p.y }, r));
          return over ? { id: p.id, x: p.x, y: over.y + over.height + 24 } : p;
        })
      : computed;
    await graph.updatePositions(positions);
    setFitViewTrigger(t => t + 1);
    history.push({
      undo: async () => { await graph.updatePositions(oldPositions); setFitViewTrigger(t => t + 1); },
      redo: async () => { await graph.updatePositions(positions); setFitViewTrigger(t => t + 1); },
    });
  }

  return { handleAutoWire, handleAutoLayout };
}
