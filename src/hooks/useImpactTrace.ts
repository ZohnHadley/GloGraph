import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { GloNode, GloEdge } from '../types';
import type { TraceDirection, TraceResult } from '../lib/trace';

/**
 * Ephemeral impact-trace overlay: the seed node, direction, and computed
 * reachability result, plus the logic that keeps them consistent. Extracted from
 * AppInner so the overlay is one self-contained concern.
 *
 * - Re-runs the authoritative `trace` command when the seed, direction, or edges
 *   change (the web demo shims it with the same JS engine); a stale async result
 *   is discarded via the `cancelled` guard.
 * - Clears itself if the seed node disappears (deleted, or graph reloaded from the
 *   API) — otherwise the overlay would dim everything against a node that's gone.
 *
 * Not persisted — also cleared on Escape and tab switch by the caller. `onStart`
 * lets the caller drop a competing overlay (the Select-Connected highlight) when a
 * trace begins, since a trace is its own focus mode.
 */
export function useImpactTrace(nodes: GloNode[], edges: GloEdge[], onStart?: () => void) {
  const [traceSeedId, setTraceSeedId] = useState<string | null>(null);
  const [traceDirection, setTraceDirection] = useState<TraceDirection>('downstream');
  const [trace, setTrace] = useState<TraceResult | null>(null);

  useEffect(() => {
    if (!traceSeedId) { setTrace(null); return; }
    let cancelled = false;
    api.trace(traceSeedId, traceDirection)
      .then(r => { if (!cancelled) setTrace(r); })
      .catch(() => { if (!cancelled) setTrace(null); });
    return () => { cancelled = true; };
  }, [traceSeedId, traceDirection, edges]);

  const traceNodeIds = useMemo(
    () => new Set(trace ? trace.nodes.map(n => n.id) : []),
    [trace]
  );
  const traceEdgeIds = useMemo(() => new Set(trace?.edgeIds ?? []), [trace]);

  const handleTrace = useCallback((nodeId: string, direction: TraceDirection) => {
    setTraceDirection(direction);
    setTraceSeedId(nodeId);
    onStart?.();
  }, [onStart]);

  const clearTrace = useCallback(() => setTraceSeedId(null), []);

  useEffect(() => {
    if (traceSeedId && !nodes.some(n => n.id === traceSeedId)) {
      setTraceSeedId(null);
    }
  }, [nodes, traceSeedId]);

  return {
    traceSeedId,
    traceDirection,
    trace,
    traceNodeIds,
    traceEdgeIds,
    handleTrace,
    clearTrace,
    setTraceDirection,
  };
}
