import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { mergeById } from '../lib/spectateSync';
import { bumpMediaCacheBust } from '../lib/mediaCacheBust';
import type {
  AddLinkInput,
  AddMediaInput,
  CreateEdgeInput,
  CreateNodeInput,
  CreateRegionInput,
  GloEdge,
  GloNode,
  GloRegion,
  NodePosition,
  UpdateEdgeInput,
  UpdateEdgeWaypointsInput,
  UpdateNodeInput,
  UpdateRegionInput,
  WaypointPoint,
} from '../types';

// The slice of `api` the graph hook needs. The local Tauri `api` (a superset)
// satisfies it structurally, and a Live Share guest passes `createRemoteApi(...)`
// so the very same hook drives the base editor against a remote host.
export type GraphApi = Pick<typeof api,
  | 'getAllNodes' | 'getAllEdges' | 'getAllRegions'
  | 'createNode' | 'updateNode' | 'restoreNode' | 'deleteNode' | 'updateNodePositions'
  | 'addNodeLink' | 'deleteNodeLink'
  | 'addNodeMedia' | 'updateNodeMedia' | 'updateNodeMediaShowOnCard' | 'updateNodeMediaSortOrder' | 'deleteNodeMedia'
  | 'createEdge' | 'updateEdge' | 'updateEdgeWaypoints' | 'restoreEdge' | 'reconnectEdge' | 'deleteEdge'
  | 'createRegion' | 'updateRegion' | 'restoreRegion' | 'deleteRegion' | 'setRegionZOrder'
  | 'setNodeZOrder' | 'setNodeSize' | 'setNodeRenderMarkdown' | 'setNodeShowThumbnail'
>;

export function useGraph(graphApi: GraphApi = api, optimistic = false) {
  const [nodes, setNodesRaw] = useState<GloNode[]>([]);
  const [edges, setEdgesRaw] = useState<GloEdge[]>([]);
  const [regions, setRegionsRaw] = useState<GloRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // `mutationSeq` increments on every content mutation. The initial load and
  // `reload()` use the *raw* setters and do NOT bump it, so loading/opening a
  // project (or an external HTTP-API reload) never marks the tab dirty — only an
  // actual user edit does. App watches `mutationSeq` to flag the tab dirty.
  const [mutationSeq, setMutationSeq] = useState(0);
  const setNodes = useCallback<typeof setNodesRaw>(a => { setMutationSeq(s => s + 1); setNodesRaw(a); }, []);
  const setEdges = useCallback<typeof setEdgesRaw>(a => { setMutationSeq(s => s + 1); setEdgesRaw(a); }, []);
  const setRegions = useCallback<typeof setRegionsRaw>(a => { setMutationSeq(s => s + 1); setRegionsRaw(a); }, []);

  // Optimistic mode (Live Share guest, `optimistic=true`): apply edits to local
  // state BEFORE the host round-trip and protect the touched ids for ~1.5s so a
  // reload mid-flight doesn't snap them back to the host's not-yet-updated state;
  // on a write error we resync via reload() (the host is authoritative). The host
  // runs with `optimistic=false`, so its mutation paths below are byte-identical to
  // before (every `if (optimistic)` branch is dead, every `try` just awaits + applies).
  // `reload` is defined later in the hook, so rollback routes through `reloadRef`.
  const protectedRef = useRef<Map<string, number>>(new Map());
  const reloadRef = useRef<() => Promise<void>>(async () => {});
  const protect = useCallback((ids: string[]) => {
    if (!optimistic) return;
    const until = Date.now() + 1500;
    for (const id of ids) protectedRef.current.set(id, until);
  }, [optimistic]);

  useEffect(() => {
    Promise.all([graphApi.getAllNodes(), graphApi.getAllEdges(), graphApi.getAllRegions()])
      .then(([n, e, r]) => {
        setNodesRaw(n);
        setEdgesRaw(e);
        setRegionsRaw(r);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load graph data:', err);
        setLoadError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, []);

  const addNode = useCallback(async (input: CreateNodeInput) => {
    const node = await graphApi.createNode(input);
    setNodes(prev => [...prev, node]);
    return node;
  }, []);

  const updateNode = useCallback(async (input: UpdateNodeInput) => {
    if (optimistic) {
      setNodes(prev => prev.map(n => n.id === input.id ? {
        ...n, title: input.title, description: input.description ?? null, eventDate: input.eventDate ?? null,
        x: input.x, y: input.y, color: input.color ?? null,
        confidence: input.confidence ?? null, impactMagnitude: input.impactMagnitude ?? null,
        tags: input.tags ?? n.tags,
        paramValues: input.paramValues.map((pv, i) => ({
          id: `opt-${input.id}-${i}`, nodeId: input.id, paramDefId: pv.paramDefId,
          value: pv.value ?? null, isEnabled: pv.isEnabled, showOnCard: pv.showOnCard,
        })),
      } : n));
      protect([input.id]);
    }
    try {
      const node = await graphApi.updateNode(input);
      setNodes(prev => prev.map(n => (n.id === node.id ? node : n)));
      return node;
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const restoreNode = useCallback(async (node: GloNode) => {
    const restored = await graphApi.restoreNode(node);
    setNodes(prev => prev.some(n => n.id === restored.id) ? prev.map(n => n.id === restored.id ? restored : n) : [...prev, restored]);
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    const apply = () => {
      setNodes(prev => prev.filter(n => n.id !== id));
      setEdges(prev => prev.filter(e => e.sourceId !== id && e.targetId !== id));
    };
    if (optimistic) { apply(); protect([id]); }
    try {
      await graphApi.deleteNode(id);
      if (!optimistic) apply();
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const updatePositions = useCallback(async (positions: NodePosition[]) => {
    const apply = () => setNodes(prev =>
      prev.map(n => {
        const pos = positions.find(p => p.id === n.id);
        return pos ? { ...n, x: pos.x, y: pos.y } : n;
      })
    );
    if (optimistic) { apply(); protect(positions.map(p => p.id)); }
    try {
      await graphApi.updateNodePositions(positions);
      if (!optimistic) apply();
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const addLink = useCallback(async (input: AddLinkInput) => {
    const link = await graphApi.addNodeLink(input);
    setNodes(prev =>
      prev.map(n =>
        n.id === input.nodeId ? { ...n, links: [...n.links, link] } : n
      )
    );
    return link;
  }, []);

  const removeLink = useCallback(async (linkId: string, nodeId: string) => {
    await graphApi.deleteNodeLink(linkId);
    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId ? { ...n, links: n.links.filter(l => l.id !== linkId) } : n
      )
    );
  }, []);

  const addMedia = useCallback(async (input: AddMediaInput) => {
    const media = await graphApi.addNodeMedia(input);
    bumpMediaCacheBust(media.id);
    setNodes(prev =>
      prev.map(n =>
        n.id === input.nodeId ? { ...n, media: [...n.media, media] } : n
      )
    );
    return media;
  }, []);

  const updateMedia = useCallback(async (mediaId: string, nodeId: string, label: string | null, src: string, srcType: string) => {
    const media = await graphApi.updateNodeMedia(mediaId, label, src, srcType);
    // Bump the cache-bust token (kept outside node state so it survives a later
    // node "Save"/refetch) so the card refetches instead of showing a cached image.
    bumpMediaCacheBust(mediaId);
    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId
          ? { ...n, media: n.media.map(m => m.id === mediaId ? media : m) }
          : n
      )
    );
    return media;
  }, []);

  const updateMediaShowOnCard = useCallback(async (mediaId: string, nodeId: string, showOnCard: boolean) => {
    await graphApi.updateNodeMediaShowOnCard(mediaId, showOnCard);
    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId
          ? { ...n, media: n.media.map(m => m.id === mediaId ? { ...m, showOnCard } : m) }
          : n
      )
    );
  }, []);

  const reorderMedia = useCallback(async (nodeId: string, mediaId: string, direction: 'up' | 'down') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const ordered = [...node.media].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = ordered.findIndex(m => m.id === mediaId);
    if (idx < 0) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= ordered.length) return;
    [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];
    // Reindex contiguously (media sort_order may be sparse after deletions) and
    // persist only the rows whose order actually changed.
    const reindexed = ordered.map((m, i) => ({ ...m, sortOrder: i }));
    const changed = reindexed.filter(r => node.media.find(m => m.id === r.id)?.sortOrder !== r.sortOrder);
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, media: reindexed } : n));
    await Promise.all(changed.map(m => graphApi.updateNodeMediaSortOrder(m.id, m.sortOrder)));
  }, [nodes]);

  const removeMedia = useCallback(async (mediaId: string, nodeId: string) => {
    await graphApi.deleteNodeMedia(mediaId);
    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId ? { ...n, media: n.media.filter(m => m.id !== mediaId) } : n
      )
    );
  }, []);

  const addEdge = useCallback(async (input: CreateEdgeInput) => {
    const edge = await graphApi.createEdge(input);
    setEdges(prev => [...prev, edge]);
    return edge;
  }, []);

  const updateEdge = useCallback(async (input: UpdateEdgeInput) => {
    const edge = await graphApi.updateEdge(input);
    setEdges(prev => prev.map(e => (e.id === edge.id ? edge : e)));
    return edge;
  }, []);

  const updateEdgeWaypoints = useCallback(async (id: string, waypoints: WaypointPoint[] | null) => {
    const input: UpdateEdgeWaypointsInput = { id, waypoints };
    const edge = await graphApi.updateEdgeWaypoints(input);
    setEdges(prev => prev.map(e => (e.id === edge.id ? edge : e)));
    return edge;
  }, []);

  const restoreEdge = useCallback(async (edge: GloEdge) => {
    const restored = await graphApi.restoreEdge(edge);
    setEdges(prev => prev.some(e => e.id === restored.id) ? prev.map(e => e.id === restored.id ? restored : e) : [...prev, restored]);
  }, []);

  const reconnectEdge = useCallback(async (id: string, sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) => {
    if (optimistic) {
      setEdges(prev => prev.map(e => e.id === id ? { ...e, sourceId, targetId, sourceHandle: sourceHandle ?? null, targetHandle: targetHandle ?? null } : e));
      protect([id]);
    }
    try {
      const edge = await graphApi.reconnectEdge(id, sourceId, targetId, sourceHandle, targetHandle);
      setEdges(prev => prev.map(e => (e.id === edge.id ? edge : e)));
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const deleteEdge = useCallback(async (id: string) => {
    const apply = () => setEdges(prev => prev.filter(e => e.id !== id));
    if (optimistic) { apply(); protect([id]); }
    try {
      await graphApi.deleteEdge(id);
      if (!optimistic) apply();
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const addRegion = useCallback(async (input: CreateRegionInput) => {
    const region = await graphApi.createRegion(input);
    setRegions(prev => [...prev, region]);
    return region;
  }, []);

  const updateRegion = useCallback(async (input: UpdateRegionInput) => {
    if (optimistic) {
      setRegions(prev => prev.map(r => r.id === input.id ? {
        ...r, title: input.title, x: input.x, y: input.y, width: input.width, height: input.height, color: input.color ?? null,
      } : r));
      protect([input.id]);
    }
    try {
      const region = await graphApi.updateRegion(input);
      setRegions(prev => prev.map(r => (r.id === region.id ? region : r)));
      return region;
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const restoreRegion = useCallback(async (region: GloRegion) => {
    const restored = await graphApi.restoreRegion(region);
    setRegions(prev =>
      prev.some(r => r.id === restored.id)
        ? prev.map(r => r.id === restored.id ? restored : r)
        : [...prev, restored]
    );
  }, []);

  const deleteRegion = useCallback(async (id: string) => {
    const apply = () => setRegions(prev => prev.filter(r => r.id !== id));
    if (optimistic) { apply(); protect([id]); }
    try {
      await graphApi.deleteRegion(id);
      if (!optimistic) apply();
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const setRegionZOrder = useCallback(async (id: string, zOrder: number) => {
    if (optimistic) { setRegions(prev => prev.map(r => r.id === id ? { ...r, zOrder } : r)); protect([id]); }
    try {
      const region = await graphApi.setRegionZOrder(id, zOrder);
      setRegions(prev => prev.map(r => (r.id === region.id ? region : r)));
      return region;
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const setNodeZOrder = useCallback(async (id: string, zOrder: number) => {
    if (optimistic) { setNodes(prev => prev.map(n => n.id === id ? { ...n, zOrder } : n)); protect([id]); }
    try {
      const node = await graphApi.setNodeZOrder(id, zOrder);
      setNodes(prev => prev.map(n => (n.id === node.id ? node : n)));
      return node;
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  const setNodeSize = useCallback(async (id: string, width: number | null, height: number | null) => {
    if (optimistic) { setNodes(prev => prev.map(n => n.id === id ? { ...n, width, height } : n)); protect([id]); }
    try {
      const node = await graphApi.setNodeSize(id, width, height);
      setNodes(prev => prev.map(n => (n.id === node.id ? node : n)));
      return node;
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [optimistic, protect]);

  // Note markdown styling toggle. Cosmetic display state, so apply locally at
  // once (snappy in solo + Live Share) and persist; on error in optimistic mode
  // reload to snap back. The backend returns void, so there's no node to merge.
  const setNodeRenderMarkdown = useCallback(async (id: string, renderMarkdown: boolean) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, renderMarkdown } : n)));
    if (optimistic) protect([id]);
    try {
      await graphApi.setNodeRenderMarkdown(id, renderMarkdown);
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [graphApi, optimistic, protect]);

  const setNodeShowThumbnail = useCallback(async (id: string, showThumbnail: boolean) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, showThumbnail } : n)));
    if (optimistic) protect([id]);
    try {
      await graphApi.setNodeShowThumbnail(id, showThumbnail);
    } catch (err) {
      if (optimistic) await reloadRef.current();
      throw err;
    }
  }, [graphApi, optimistic, protect]);

  const reload = useCallback(async () => {
    const [n, e, r] = await Promise.all([graphApi.getAllNodes(), graphApi.getAllEdges(), graphApi.getAllRegions()]);
    // Merge by id so unchanged entities keep their reference (no full re-render /
    // flicker) — matters most for a Live Share guest reloading on every host edit.
    // In optimistic mode, protect in-flight local edits (touched < ~1.5s ago) from
    // snap-back; expired ids are pruned. Host mode passes no set (server wins all).
    let prot: Set<string> | undefined;
    if (optimistic) {
      const now = Date.now();
      prot = new Set();
      for (const [id, until] of protectedRef.current) {
        if (until > now) prot.add(id); else protectedRef.current.delete(id);
      }
    }
    setNodesRaw(prev => mergeById(prev, n, prot));
    setEdgesRaw(prev => mergeById(prev, e, prot));
    setRegionsRaw(prev => mergeById(prev, r, prot));
  }, [graphApi, optimistic]);
  // Keep the rollback ref current (mutations defined above call reloadRef.current()).
  reloadRef.current = reload;

  return {
    nodes,
    edges,
    regions,
    loading,
    loadError,
    mutationSeq,
    addNode,
    updateNode,
    deleteNode,
    updatePositions,
    addLink,
    removeLink,
    addMedia,
    updateMedia,
    updateMediaShowOnCard,
    reorderMedia,
    removeMedia,
    addEdge,
    updateEdge,
    updateEdgeWaypoints,
    reconnectEdge,
    restoreEdge,
    restoreNode,
    deleteEdge,
    addRegion,
    updateRegion,
    restoreRegion,
    deleteRegion,
    setRegionZOrder,
    setNodeZOrder,
    setNodeSize,
    setNodeRenderMarkdown,
    setNodeShowThumbnail,
    reload,
  };
}
