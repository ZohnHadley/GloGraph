import type {
  AddLinkInput, AddMediaInput, CreateEdgeInput, CreateNodeInput, CreateRegionInput,
  GloEdge, GloNode, GloRegion, GraphExport, NodeLink, NodeMedia, NodePosition,
  UpdateEdgeInput, UpdateNodeInput, UpdateRegionInput,
} from '../types';
import { api } from './api';

/**
 * A drop-in replacement for the local Tauri `api`, backed by a Live Share host's
 * session server over HTTP. Injecting this into `useGraph` lets a guest run the
 * **real base editor** (same handlers, undo, rendering) against a remote project —
 * no parallel spectate view to drift out of sync.
 *
 * Most edits round-trip to the host (incl. media-file uploads and undo-of-delete via
 * the /restore routes). A few operations still aren't expressible over the session
 * API (e.g. edge waypoints) and reject clearly; the base editor's error handling
 * leaves the local state to be corrected by the next reload.
 */
export function createRemoteApi(base: string, token: string) {
  const auth = { Authorization: `Bearer ${token}` };
  const json = { 'Content-Type': 'application/json', ...auth };
  const nope = (what: string) => Promise.reject(new Error(`${what} isn't available in a shared session.`));

  async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      method, headers: body === undefined ? auth : json,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}`);
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  // Coalesce the 3 getAll* calls (and reload's) into one /api/graph fetch.
  let cache: { at: number; p: Promise<GraphExport> } | null = null;
  function graph(): Promise<GraphExport> {
    const now = Date.now();
    if (!cache || now - cache.at > 50) cache = { at: now, p: send<GraphExport>('GET', '/api/graph') };
    return cache.p;
  }
  const enc = encodeURIComponent;

  const extOf = (p: string): string => { const m = /\.([a-z0-9]+)$/i.exec(p); return m ? m[1] : ''; };
  // Read a local file the guest picked and upload its bytes to the host (the host
  // stores it and returns the media row). Used for both add-file and replace-file.
  async function uploadFileTo(localPath: string, urlPath: string): Promise<NodeMedia> {
    const bytes = await api.readLocalFile(localPath);
    const res = await fetch(`${base}${urlPath}`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/octet-stream' },
      body: new Uint8Array(bytes),
    });
    if (!res.ok) throw new Error(`media upload → HTTP ${res.status}`);
    return res.json() as Promise<NodeMedia>;
  }

  return {
    // ── reads ──
    getAllNodes: () => graph().then(g => g.nodes),
    getAllEdges: () => graph().then(g => g.edges),
    getAllRegions: () => graph().then(g => g.regions),

    // ── nodes ──
    createNode: (input: CreateNodeInput) => send<GloNode>('POST', '/api/nodes', input),
    updateNode: (input: UpdateNodeInput) => send<GloNode>('PATCH', `/api/nodes/${enc(input.id)}`, input),
    deleteNode: (id: string) => send<void>('DELETE', `/api/nodes/${enc(id)}`),
    updateNodePositions: (positions: NodePosition[]) =>
      send<void>('PATCH', '/api/nodes/batch-positions', positions.map(p => ({ id: p.id, x: p.x, y: p.y }))),
    setNodePinned: (id: string, pinned: boolean) => send<void>('PATCH', `/api/nodes/${enc(id)}`, { isPinned: pinned }),
    setNodeExpandPinned: (id: string, expandPinned: boolean) => send<void>('PATCH', `/api/nodes/${enc(id)}`, { isExpandPinned: expandPinned }),
    setNodeZOrder: (id: string, zOrder: number) => send<GloNode>('PATCH', `/api/nodes/${enc(id)}`, { zOrder }),
    setNodeSize: (id: string, width: number | null, height: number | null) => send<GloNode>('PATCH', `/api/nodes/${enc(id)}`, { width, height }),
    setNodeRenderMarkdown: (id: string, renderMarkdown: boolean) => send<void>('PATCH', `/api/nodes/${enc(id)}`, { renderMarkdown }),
    setNodeShowThumbnail: (id: string, showThumbnail: boolean) => send<void>('PATCH', `/api/nodes/${enc(id)}`, { showThumbnail }),
    restoreNode: (node: GloNode) => send<GloNode>('POST', '/api/nodes/restore', node),

    // ── node links ──
    addNodeLink: (input: AddLinkInput) => send<NodeLink>('POST', `/api/nodes/${enc(input.nodeId)}/links`, { url: input.url, label: input.label ?? null }),
    deleteNodeLink: (id: string) => send<void>('DELETE', `/api/links/${enc(id)}`),

    // ── node media ── (URL media works directly; a local file is uploaded to the
    // host, which stores it and streams it back to all guests)
    addNodeMedia: (input: AddMediaInput): Promise<NodeMedia> => {
      if (input.srcType === 'file') {
        const q = new URLSearchParams({
          label: input.label ?? '', mediaType: input.mediaType,
          showOnCard: String(input.showOnCard ?? true), ext: extOf(input.src),
        });
        return uploadFileTo(input.src, `/api/nodes/${enc(input.nodeId)}/media/file?${q.toString()}`);
      }
      return send<NodeMedia>('POST', `/api/nodes/${enc(input.nodeId)}/media`, {
        label: input.label ?? '', src: input.src, srcType: 'url',
        mediaType: input.mediaType, showOnCard: input.showOnCard ?? true,
      });
    },
    updateNodeMedia: async (id: string, label: string | null, src: string, srcType: string): Promise<NodeMedia> => {
      if (srcType === 'file') {
        await uploadFileTo(src, `/api/media/${enc(id)}/file?ext=${enc(extOf(src))}`); // replaces the source (keeps id)
        return send<NodeMedia>('PATCH', `/api/media/${enc(id)}`, { label });
      }
      return send<NodeMedia>('PATCH', `/api/media/${enc(id)}`, { label, src, srcType: 'url' });
    },
    updateNodeMediaShowOnCard: (id: string, showOnCard: boolean): Promise<void> =>
      send<void>('PATCH', `/api/media/${enc(id)}`, { showOnCard }),
    updateNodeMediaSortOrder: (id: string, sortOrder: number): Promise<void> =>
      send<void>('PATCH', `/api/media/${enc(id)}`, { sortOrder }),
    deleteNodeMedia: (id: string): Promise<void> => send<void>('DELETE', `/api/media/${enc(id)}`),

    // ── edges ──
    createEdge: (input: CreateEdgeInput) => send<GloEdge>('POST', '/api/edges', input),
    updateEdge: (input: UpdateEdgeInput) => send<GloEdge>('PATCH', `/api/edges/${enc(input.id)}`, input),
    reconnectEdge: (id: string, sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) =>
      send<GloEdge>('PATCH', `/api/edges/${enc(id)}`, { sourceId, targetId, sourceHandle: sourceHandle ?? null, targetHandle: targetHandle ?? null }),
    deleteEdge: (id: string) => send<void>('DELETE', `/api/edges/${enc(id)}`),
    updateEdgeWaypoints: () => nope('Edge waypoints'),
    restoreEdge: (edge: GloEdge) => send<GloEdge>('POST', '/api/edges/restore', edge),

    // ── regions ──
    createRegion: (input: CreateRegionInput) => send<GloRegion>('POST', '/api/regions', input),
    updateRegion: (input: UpdateRegionInput) => send<GloRegion>('PATCH', `/api/regions/${enc(input.id)}`, input),
    deleteRegion: (id: string) => send<void>('DELETE', `/api/regions/${enc(id)}`),
    setRegionZOrder: (id: string, zOrder: number) => send<GloRegion>('PATCH', `/api/regions/${enc(id)}`, { zOrder }),
    setRegionLocked: (id: string, locked: boolean) => send<GloRegion>('PATCH', `/api/regions/${enc(id)}`, { isLocked: locked }),
    setRegionMinimized: (id: string, minimized: boolean) => send<GloRegion>('PATCH', `/api/regions/${enc(id)}`, { isMinimized: minimized }),
    restoreRegion: (region: GloRegion) => send<GloRegion>('POST', '/api/regions/restore', region),
  };
}

export type RemoteApi = ReturnType<typeof createRemoteApi>;
