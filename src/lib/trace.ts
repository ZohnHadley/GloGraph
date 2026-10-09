export type TraceDirection = 'downstream' | 'upstream';

/** A directed edge — only what reachability needs. */
export interface TraceEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface TraceNode {
  id: string;
  hop: number;
}

/**
 * Trace result. Shape is intentionally identical to the Rust core
 * (`src-tauri/src/core/trace.rs`) and the HTTP/Tauri response, so the UI
 * consumes one uniform shape regardless of where the trace was computed.
 */
export interface TraceResult {
  seedId: string;
  direction: TraceDirection;
  /** Reachable nodes including the seed (hop 0), sorted by hop then id. */
  nodes: TraceNode[];
  /** Ids of the edges that participate in the cascade, sorted. */
  edgeIds: string[];
  /** Reached node count, excluding the seed. */
  reachedCount: number;
  /** Greatest hop distance reached (0 if the seed has no links this direction). */
  maxHop: number;
}

/**
 * Breadth-first reachability from `seedId` along directed edges — what a node
 * reaches (`downstream`, source→target) or what reaches it (`upstream`,
 * target→source).
 *
 * **This is the JS mirror of the authoritative Rust engine.** In the desktop app
 * the canvas overlay calls the Rust `trace` command; this function exists so the
 * browser-only web demo (which has no Rust backend) can serve the same overlay.
 * Both are pinned to `tests/fixtures/trace_cases.json` so they cannot drift.
 *
 * Deliberately pure topology: no weights, probabilities, or prediction — GloGraph
 * maps relationships, it doesn't simulate them. Cycles terminate via the visited
 * set; each node carries its shortest hop. Output is deterministic.
 */
export function computeTrace(
  seedId: string,
  edges: TraceEdge[],
  direction: TraceDirection,
): TraceResult {
  // Build adjacency in the direction we're walking.
  const adj = new Map<string, { to: string; edgeId: string }[]>();
  for (const e of edges) {
    const from = direction === 'downstream' ? e.sourceId : e.targetId;
    const to = direction === 'downstream' ? e.targetId : e.sourceId;
    let list = adj.get(from);
    if (!list) { list = []; adj.set(from, list); }
    list.push({ to, edgeId: e.id });
  }

  const hops = new Map<string, number>([[seedId, 0]]);
  const edgeIdSet = new Set<string>();
  let maxHop = 0;
  const queue: string[] = [seedId];
  while (queue.length) {
    const cur = queue.shift()!;
    const curHop = hops.get(cur)!;
    for (const { to, edgeId } of adj.get(cur) ?? []) {
      // Every edge leaving a reachable node is part of the cascade — including
      // back-edges that close a loop (their target is already visited).
      edgeIdSet.add(edgeId);
      if (!hops.has(to)) {
        const h = curHop + 1;
        hops.set(to, h);
        if (h > maxHop) maxHop = h;
        queue.push(to);
      }
    }
  }

  const nodes: TraceNode[] = [...hops.entries()]
    .map(([id, hop]) => ({ id, hop }))
    .sort((a, b) => a.hop - b.hop || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const edgeIds = [...edgeIdSet].sort();
  return { seedId, direction, nodes, edgeIds, reachedCount: nodes.length - 1, maxHop };
}
