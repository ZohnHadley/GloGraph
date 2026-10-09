/* ============================================================================
   In-browser runtime for the GloGraph web demo.

   The real React app talks to a Rust/SQLite backend through a single `invoke()`
   seam (see src/lib/api.ts). For the web demo we alias the Tauri modules to the
   shims in ./shims, and this file provides the `invoke` dispatch + an event bus,
   backed by an in-memory store seeded from the bundled demo files.

   Hard limitations (vs the desktop app):
   - Nothing is persisted — refresh resets everything (no localStorage, no disk).
   - Save / CSV / PNG "export to disk" become browser downloads.
   - "Open Project" uses a file picker; the embedded HTTP API does not exist.
   Everything else (add/move/connect/edit nodes, regions, undo, tabs, settings)
   runs against the in-memory store, so it behaves like the real app in-session.
   ========================================================================== */
import { DEMOS, DEMO_BY_PATH, RECENTS, PRESET_LIBRARY } from './graphs';
import { computeTrace } from '../lib/trace';
import { closestHandles } from '../lib/handles';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(16).slice(2) + Date.now().toString(16));
const now = () => new Date().toISOString();
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/* ── Event bus (powers @tauri-apps/api/event `listen`) ───────────────────── */
type Handler = (e: { payload: any }) => void;
const handlers: Record<string, Set<Handler>> = {};
export function on(name: string, cb: Handler): () => void {
  (handlers[name] ||= new Set()).add(cb);
  return () => handlers[name]?.delete(cb);
}
function emit(name: string, payload: any) {
  handlers[name]?.forEach((cb) => { try { cb({ payload }); } catch { /* ignore */ } });
}

/* ── Store model ─────────────────────────────────────────────────────────── */
interface Store {
  name: string;
  settings: any;                 // GraphSettings
  nodes: any[];
  edges: any[];
  regions: any[];
  app: Map<string, string>;      // app_settings
}
interface TabMeta { id: string; name: string; savePath: string | null; order: number; isActive: boolean; dirty: boolean; }

const stores: Record<string, Store> = {};
// Clean-baseline content fingerprint per tab (the demo mirror of the desktop
// backend's TabEntry.saved_fingerprint). dirty = fingerprint(store) !== baseline.
const baselines: Record<string, string> = {};
let tabs: TabMeta[] = [];
let activeId: string | null = null;
let demoDisplayName = ''; // session-only identity for the demo (no Rust backend)
let order = 0;
// Files the user opened via the picker, keyed by an "upload://" pseudo-path.
const uploads: Record<string, any> = {};

// ── Demo limits ───────────────────────────────────────────────────────────
// Cap how many graph objects (nodes + regions) a visitor can create across all
// tabs, how many project tabs they can open, and reset the whole demo after 30
// minutes. `everCreated` lets undo/redo (restore_*) keep the count correct
// without seeded objects ever counting against the cap.
const DEMO_OBJECT_LIMIT = 255;
const DEMO_TAB_LIMIT = 6;
const DEMO_DURATION_MS = 30 * 60 * 1000;
const OBJECT_LIMIT_MSG = `Demo limit reached — you can create up to ${DEMO_OBJECT_LIMIT} graph objects here. Delete one, or wait for the timer to reset.`;
const TAB_LIMIT_MSG = `Demo limit reached — you can open up to ${DEMO_TAB_LIMIT} project tabs here. Close one to open another.`;
const createdIds = new Set<string>();
const everCreated = new Set<string>();
function objectsCount(): number { return createdIds.size; }
function noteCreated(id: string) { everCreated.add(id); createdIds.add(id); updateObjectsBadge(); }
function noteDeleted(id: string) { if (createdIds.delete(id)) updateObjectsBadge(); }
function noteRestored(id: string) { if (everCreated.has(id)) { createdIds.add(id); updateObjectsBadge(); } }
function atObjectLimit(): boolean { return createdIds.size >= DEMO_OBJECT_LIMIT; }
function atTabLimit(): boolean { return tabs.length >= DEMO_TAB_LIMIT; }
function limitError(): Error {
  flashObjectsBadge();
  showLimitBanner();
  // Still thrown so the create is actually blocked; the inline banner above is
  // what the visitor sees (no toast). The message is short in case any caller
  // surfaces it.
  return new Error(`Demo object limit reached (${DEMO_OBJECT_LIMIT}).`);
}

function settingsFromExport(exp: any): any {
  const s = exp.settings || { presetName: 'Untitled', paramDefs: [], edgeParamDefs: [] };
  const presetId = uid();
  return {
    activePresetId: presetId,
    presets: [{ id: presetId, name: s.presetName || 'Untitled', isBuiltin: false, createdAt: now() }],
    paramDefs: clone(s.paramDefs || []),
    edgeParamDefs: clone(s.edgeParamDefs || []),
  };
}
function storeFromExport(name: string, exp: any): Store {
  const app = new Map<string, string>();
  if (exp.bookmarks) app.set('canvas_bookmarks', exp.bookmarks);
  if (exp.graphNotes) app.set('graph_notes', exp.graphNotes);
  app.set('edge_routing_mode', 'waypoints');
  app.set('snap_to_grid', 'false');
  app.set('api_enabled', 'false');
  return {
    name,
    settings: settingsFromExport(exp),
    nodes: clone(exp.nodes || []),
    edges: clone(exp.edges || []),
    regions: clone(exp.regions || []),
    app,
  };
}
function blankStore(name: string, presetId: string): Store {
  const lib = PRESET_LIBRARY[presetId];
  return storeFromExport(name, { settings: lib || { presetName: 'Blank', paramDefs: [], edgeParamDefs: [] }, nodes: [], edges: [], regions: [] });
}
function tabMetas(): TabMeta[] { return tabs.map((t) => ({ ...t, isActive: t.id === activeId })); }
function A(): Store {
  if (activeId && stores[activeId]) return stores[activeId];
  // Defensive fallback so reads never throw if called without an active tab.
  return { name: '', settings: { activePresetId: '', presets: [], paramDefs: [], edgeParamDefs: [] }, nodes: [], edges: [], regions: [], app: new Map() };
}
function addTab(name: string, store: Store, savePath: string | null): TabMeta {
  const id = uid();
  stores[id] = store;
  // Baseline = the tab's initial content (mirrors the desktop backend): a new or
  // freshly-opened tab is born clean and only goes dirty once its content differs
  // from this — and returns to clean when undone back to it.
  baselines[id] = fingerprintStore(store);
  const meta: TabMeta = { id, name, savePath, order: order++, isActive: true, dirty: false };
  tabs.push(meta);
  activeId = id;
  return meta;
}

// Seed one project so the demo lands on the canvas (not the start screen).
// Default = the software-architecture map (matches the architect positioning).
addTab('Payments platform architecture',
       storeFromExport('Payments platform architecture', DEMOS['software-architecture']),
       'demo://software-architecture');

/* ── Browser download / upload helpers (replace disk I/O) ────────────────── */
function basename(p: string): string { return (p.split(/[\\/]/).pop() || p).trim(); }
function download(filename: string, data: BlobPart, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function pickFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glograph,application/json';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return resolve(null);
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const path = 'upload://' + uid();
          uploads[path] = { name: f.name.replace(/\.glograph$/i, ''), data: JSON.parse(String(fr.result)) };
          resolve(path);
        } catch { resolve(null); }
      };
      fr.onerror = () => resolve(null);
      fr.readAsText(f);
    };
    // If the dialog is dismissed without a file we simply never resolve with a
    // path; resolve null on window refocus as a best-effort cancel.
    input.click();
    const onFocus = () => { window.removeEventListener('focus', onFocus); setTimeout(() => { if (!input.files || !input.files.length) resolve(null); }, 300); };
    window.addEventListener('focus', onFocus);
  });
}

function buildExport(s: Store): any {
  return {
    version: 8,
    exportedAt: now(),
    settings: {
      presetName: s.settings.presets[0]?.name || 'Untitled',
      paramDefs: s.settings.paramDefs,
      edgeParamDefs: s.settings.edgeParamDefs,
    },
    nodes: s.nodes,
    edges: s.edges,
    regions: s.regions,
    bookmarks: s.app.get('canvas_bookmarks') ?? null,
    graphNotes: s.app.get('graph_notes') ?? null,
  };
}

/* ── Dirty-tracking fingerprint (demo mirror of Rust compute_fingerprint) ──── */
// Stable, key-sorted JSON so object key order can't perturb the fingerprint.
function stableStringify(v: any): string {
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
// Content fingerprint of a tab's store. Normalizes the export so undoing edits
// back to the saved/initial state clears the unsaved dot (see ARCHITECTURE.md
// "one allowed duplicate"): drops the `exportedAt` timestamp + the volatile
// child-row ids that restore regenerates, and is order- and key-independent.
function fingerprintStore(s: Store): string {
  const exp: any = clone(buildExport(s)); // clone: buildExport returns live refs
  delete exp.exportedAt;
  for (const key of ['nodes', 'edges', 'regions']) {
    const arr = exp[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      for (const child of ['paramValues', 'links', 'media']) {
        if (Array.isArray(item[child])) {
          for (const c of item[child]) { delete c.id; delete c.nodeId; delete c.edgeId; }
          item[child].sort((x: any, y: any) => stableStringify(x).localeCompare(stableStringify(y)));
        }
      }
    }
    arr.sort((x: any, y: any) => stableStringify(x).localeCompare(stableStringify(y)));
  }
  return stableStringify(exp);
}

/* ── Small mutation helpers ──────────────────────────────────────────────── */
const findNode = (id: string) => A().nodes.find((n) => n.id === id);
const findEdge = (id: string) => A().edges.find((e) => e.id === id);
const findRegion = (id: string) => A().regions.find((r) => r.id === id);
const defs = () => A().settings.paramDefs as any[];
const edefs = () => A().settings.edgeParamDefs as any[];
function slug(label: string): string {
  return (label || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'opt';
}
function maxSort(arr: any[]): number { return arr.reduce((m, x) => Math.max(m, x.sortOrder ?? 0), -1) + 1; }

/* ── The command dispatcher (mirrors the Tauri invoke handler) ───────────── */
export async function invoke<T = any>(cmd: string, args: any = {}): Promise<T> {
  const r = handle(cmd, args);
  return r as T;
}

function handle(cmd: string, a: any): any {
  switch (cmd) {
    case 'get_build_info': return { version: '0.9.13', buildDate: 'web demo' };
    case 'log_frontend_error': return undefined;

    /* Tabs */
    case 'get_tabs': return tabMetas();
    case 'create_tab': {
      // Demo tab cap: block past the limit with the inline banner (no throw — the
      // Start-screen New Project path doesn't catch). A no-op leaves the tab list as-is.
      if (atTabLimit()) { showLimitBanner(TAB_LIMIT_MSG); return tabMetas(); }
      addTab(a.name || 'Untitled Project', blankStore(a.name || 'Untitled Project', a.presetId), null);
      emit('tabs:changed', tabMetas()); return tabMetas();
    }
    case 'switch_tab': { if (stores[a.id]) activeId = a.id; emit('tabs:changed', tabMetas()); return tabMetas(); }
    case 'close_tab': {
      tabs = tabs.filter((t) => t.id !== a.id); delete stores[a.id]; delete baselines[a.id];
      if (activeId === a.id) activeId = tabs.length ? tabs[tabs.length - 1].id : null;
      emit('tabs:changed', tabMetas()); return tabMetas();
    }
    case 'set_tab_dirty': { const t = tabs.find((x) => x.id === a.id); if (t) t.dirty = a.dirty; return tabMetas(); }
    // Authoritative recheck: dirty iff the active tab's content differs from its
    // clean baseline — so undoing back to the saved/initial state clears the dot.
    case 'recompute_active_tab_dirty': {
      const t = tabs.find((x) => x.id === activeId);
      if (t && activeId) t.dirty = fingerprintStore(A()) !== baselines[activeId];
      return tabMetas();
    }
    case 'rename_tab': { const t = tabs.find((x) => x.id === a.id); if (t) { t.name = a.name; stores[a.id] && (stores[a.id].name = a.name); } emit('tabs:changed', tabMetas()); return tabMetas(); }
    case 'set_tab_save_path': { const t = tabs.find((x) => x.id === a.id); if (t) t.savePath = a.path; emit('tabs:changed', tabMetas()); return tabMetas(); }
    case 'open_path_as_tab': {
      const existing = tabs.find((t) => t.savePath === a.path);
      if (existing) { activeId = existing.id; emit('tabs:changed', tabMetas()); return tabMetas(); }
      let exp: any, name: string;
      if (DEMO_BY_PATH[a.path]) { exp = DEMO_BY_PATH[a.path]; name = basename(a.path).replace('demo://', '') || 'Project'; const rec = RECENTS.find((r) => r.path === a.path); if (rec) name = rec.name; }
      else if (uploads[a.path]) { exp = uploads[a.path].data; name = uploads[a.path].name; }
      else { exp = { settings: { presetName: 'Project', paramDefs: [], edgeParamDefs: [] }, nodes: [], edges: [], regions: [] }; name = 'Project'; }
      addTab(name, storeFromExport(name, exp), a.path);
      emit('tabs:changed', tabMetas()); return tabMetas();
    }
    case 'get_recent_projects': return RECENTS;
    case 'record_recent_project': return undefined;
    case 'remove_recent_project': return undefined;

    /* Settings (read) */
    case 'get_graph_settings': return A().settings;
    case 'set_active_preset': return A().settings;

    /* Graph reads */
    // Return a shallow *copy* of the list, never the live store array — otherwise
    // the caller (useGraph React state) holds the same array the store mutates in
    // place (e.g. create_node's `A().nodes.push`), which makes a freshly-created
    // node appear in `prev` and get appended twice. The real Tauri backend
    // serializes over IPC (fresh arrays), so this mirrors that.
    case 'get_all_nodes': return A().nodes.slice();
    case 'get_all_edges': return A().edges.slice(); // copy, not the live store array (see get_all_nodes)
    case 'publish_change': return undefined; // no SSE bus in the demo
    // File-node previews can't touch the local disk in the browser demo → no preview.
    case 'read_local_file': return [];
    case 'read_text_file_head': return '';
    case 'extract_office_thumbnail': return null;
    case 'trace': {
      // Demo mirror of the Rust `trace` command — same engine (src/lib/trace.ts),
      // pinned to the same fixture, so the overlay behaves identically here.
      if (!A().nodes.some((n: any) => n.id === a.seedId)) throw new Error(`Node '${a.seedId}' not found`);
      return computeTrace(a.seedId, A().edges, a.direction || 'downstream');
    }
    case 'get_all_regions': return A().regions.slice(); // copy, not the live store array (see get_all_nodes)
    case 'get_app_setting': return A().app.get(a.key) ?? null;
    case 'set_app_setting': A().app.set(a.key, a.value); return undefined;
    case 'get_display_name': return demoDisplayName;
    case 'set_display_name': demoDisplayName = (a.name || '').trim(); return undefined;
    case 'get_lan_address': return 'demo.local:57400'; // demo has no real network
    case 'start_host_session': return 57400; // demo: Share is greyed out, never reached
    case 'stop_host_session': return undefined;

    /* Nodes */
    case 'create_node': {
      if (atObjectLimit()) throw limitError();
      const i = a.input;
      const node = {
        id: uid(), title: i.title ?? '', description: i.description ?? null, eventDate: i.eventDate ?? null,
        dateAdded: now(), x: i.x ?? 0, y: i.y ?? 0, color: i.color ?? null,
        confidence: i.confidence ?? null, impactMagnitude: i.impactMagnitude ?? null,
        externalId: i.externalId ?? null, tags: i.tags ?? [], links: [], media: [],
        paramValues: (i.paramValues ?? []).map((p: any) => ({ id: uid(), nodeId: '', paramDefId: p.paramDefId, value: p.value ?? null, isEnabled: p.isEnabled !== false, showOnCard: !!p.showOnCard })),
        kind: i.kind ?? 'standard', width: i.width ?? null, height: i.height ?? null,
        isPinned: false, isExpandPinned: false, zOrder: 0,
      };
      node.paramValues.forEach((p: any) => (p.nodeId = node.id));
      A().nodes.push(node); noteCreated(node.id); return node;
    }
    case 'update_node': {
      const n = findNode(a.input.id); if (!n) return n;
      const i = a.input;
      ['title', 'description', 'eventDate', 'color', 'confidence', 'impactMagnitude', 'kind'].forEach((k) => { if (i[k] !== undefined) (n as any)[k] = i[k]; });
      if (i.tags !== undefined) n.tags = i.tags;
      if (i.paramValues !== undefined) n.paramValues = i.paramValues.map((p: any) => ({ id: uid(), nodeId: n.id, paramDefId: p.paramDefId, value: p.value ?? null, isEnabled: p.isEnabled !== false, showOnCard: !!p.showOnCard }));
      return n;
    }
    case 'restore_node': {
      const node = clone(a.node); const idx = A().nodes.findIndex((n) => n.id === node.id);
      if (idx >= 0) A().nodes[idx] = node; else A().nodes.push(node); noteRestored(node.id); return node;
    }
    case 'delete_node': {
      A().nodes = A().nodes.filter((n) => n.id !== a.id);
      A().edges = A().edges.filter((e) => e.sourceId !== a.id && e.targetId !== a.id);
      noteDeleted(a.id); return undefined;
    }
    case 'update_node_positions': { (a.positions || []).forEach((p: any) => { const n = findNode(p.id); if (n) { n.x = p.x; n.y = p.y; } }); return undefined; }
    case 'add_node_link': { const i = a.input; const link = { id: uid(), nodeId: i.nodeId, url: i.url, label: i.label ?? null }; const n = findNode(i.nodeId); if (n) n.links.push(link); return link; }
    case 'delete_node_link': { A().nodes.forEach((n) => (n.links = n.links.filter((l: any) => l.id !== a.id))); return undefined; }
    case 'add_node_media': { const i = a.input; const m = { id: uid(), nodeId: i.nodeId, label: i.label ?? '', src: i.src, srcType: i.srcType, mediaType: i.mediaType, sortOrder: i.sortOrder ?? 0, showOnCard: i.showOnCard !== false }; const n = findNode(i.nodeId); if (n) n.media.push(m); return m; }
    case 'update_node_media': { let res: any = null; A().nodes.forEach((n) => n.media.forEach((m: any) => { if (m.id === a.id) { m.label = a.label ?? ''; m.src = a.src; m.srcType = a.srcType; res = m; } })); return res; }
    case 'update_node_media_show_on_card': { A().nodes.forEach((n) => n.media.forEach((m: any) => { if (m.id === a.id) m.showOnCard = a.showOnCard; })); return undefined; }
    case 'update_node_media_sort_order': { A().nodes.forEach((n) => n.media.forEach((m: any) => { if (m.id === a.id) m.sortOrder = a.sortOrder; })); return undefined; }
    case 'delete_node_media': { A().nodes.forEach((n) => (n.media = n.media.filter((m: any) => m.id !== a.id))); return undefined; }
    case 'set_node_pinned': { const n = findNode(a.id); if (n) n.isPinned = a.pinned; return undefined; }
    case 'set_node_expand_pinned': { const n = findNode(a.id); if (n) n.isExpandPinned = a.expandPinned; return undefined; }
    case 'set_node_z_order': { const n = findNode(a.id); if (n) n.zOrder = a.zOrder; return n; }
    case 'set_node_size': { const n = findNode(a.id); if (n) { n.width = a.width; n.height = a.height; } return n; }
    case 'set_node_render_markdown': { const n = findNode(a.id); if (n) n.renderMarkdown = a.renderMarkdown; return undefined; }
    case 'set_node_show_thumbnail': { const n = findNode(a.id); if (n) n.showThumbnail = a.showThumbnail; return undefined; }

    /* Edges */
    case 'create_edge': {
      const i = a.input;
      // No explicit handles → connect from the closest sides, mirroring the Rust
      // backend's create_edge (one source: ../lib/handles ↔ core::handles).
      let sh = i.sourceHandle ?? null, th = i.targetHandle ?? null;
      if (sh == null && th == null) {
        const s = findNode(i.sourceId), t = findNode(i.targetId);
        if (s && t) {
          const [cs, ct] = closestHandles(
            (t.x + (t.width ?? 200) / 2) - (s.x + (s.width ?? 200) / 2),
            (t.y + (t.height ?? 80) / 2) - (s.y + (s.height ?? 80) / 2),
          );
          sh = cs; th = ct;
        }
      }
      const edge = { id: uid(), sourceId: i.sourceId, targetId: i.targetId, sourceHandle: sh, targetHandle: th, waypoints: null, label: i.label ?? null, externalId: i.externalId ?? null, color: i.color ?? null, paramValues: (i.paramValues ?? []).map((p: any) => ({ id: uid(), edgeId: '', paramDefId: p.paramDefId, value: p.value ?? null, isEnabled: p.isEnabled !== false })) };
      edge.paramValues.forEach((p: any) => (p.edgeId = edge.id));
      A().edges.push(edge); return edge;
    }
    case 'update_edge': {
      const e = findEdge(a.input.id); if (!e) return e; const i = a.input;
      if (i.label !== undefined) e.label = i.label;
      if (i.color !== undefined) e.color = i.color;
      if (i.externalId !== undefined) e.externalId = i.externalId;
      if (i.paramValues !== undefined) e.paramValues = i.paramValues.map((p: any) => ({ id: uid(), edgeId: e.id, paramDefId: p.paramDefId, value: p.value ?? null, isEnabled: p.isEnabled !== false }));
      return e;
    }
    case 'update_edge_waypoints': { const e = findEdge(a.input.id); if (e) e.waypoints = a.input.waypoints ?? null; return e; }
    case 'reconnect_edge': { const e = findEdge(a.id); if (e) { e.sourceId = a.sourceId; e.targetId = a.targetId; e.sourceHandle = a.sourceHandle ?? null; e.targetHandle = a.targetHandle ?? null; } return e; }
    case 'restore_edge': { const edge = clone(a.edge); const idx = A().edges.findIndex((e) => e.id === edge.id); if (idx >= 0) A().edges[idx] = edge; else A().edges.push(edge); return edge; }
    case 'delete_edge': { A().edges = A().edges.filter((e) => e.id !== a.id); return undefined; }

    /* Regions */
    case 'create_region': { if (atObjectLimit()) throw limitError(); const i = a.input; const region = { id: uid(), title: i.title ?? 'Region', x: i.x ?? 0, y: i.y ?? 0, width: i.width ?? 320, height: i.height ?? 220, color: i.color ?? null, zOrder: 0, isLocked: false, isMinimized: false, createdAt: now() }; A().regions.push(region); noteCreated(region.id); return region; }
    case 'update_region': { const r = findRegion(a.input.id); if (!r) return r; const i = a.input; ['title', 'x', 'y', 'width', 'height', 'color'].forEach((k) => { if (i[k] !== undefined) (r as any)[k] = i[k]; }); return r; }
    case 'restore_region': { const region = clone(a.region); const idx = A().regions.findIndex((r) => r.id === region.id); if (idx >= 0) A().regions[idx] = region; else A().regions.push(region); noteRestored(region.id); return region; }
    case 'delete_region': { A().regions = A().regions.filter((r) => r.id !== a.id); noteDeleted(a.id); return undefined; }
    case 'set_region_z_order': { const r = findRegion(a.id); if (r) r.zOrder = a.zOrder; return r; }
    case 'set_region_locked': { const r = findRegion(a.id); if (r) r.isLocked = a.locked; return r; }
    case 'set_region_minimized': { const r = findRegion(a.id); if (r) r.isMinimized = a.minimized; return r; }

    /* Settings — node param defs / options */
    case 'create_node_param_def': { const i = a.input; defs().push({ id: uid(), presetId: A().settings.activePresetId, displayName: i.displayName, paramType: i.paramType || 'text', defaultValue: i.defaultValue ?? null, drivesColor: false, showOnCardDefault: false, sortOrder: maxSort(defs()), options: [] }); return A().settings; }
    case 'update_node_param_def': { const d = defs().find((x) => x.id === a.input.id); if (d) { const i = a.input; if (i.displayName !== undefined) d.displayName = i.displayName; if (i.paramType !== undefined) d.paramType = i.paramType; if (i.defaultValue !== undefined) d.defaultValue = i.defaultValue; } return A().settings; }
    case 'delete_node_param_def': { A().settings.paramDefs = defs().filter((d) => d.id !== a.id); A().nodes.forEach((n) => (n.paramValues = n.paramValues.filter((p: any) => p.paramDefId !== a.id))); return A().settings; }
    case 'set_drives_color': { defs().forEach((d) => (d.drivesColor = d.id === a.id)); return A().settings; }
    case 'create_param_option': { const i = a.input; const d = defs().find((x) => x.id === i.paramDefId); if (d) d.options.push({ id: uid(), paramDefId: d.id, valueSlug: slug(i.label), label: i.label, color: i.color ?? null, sortOrder: maxSort(d.options) }); return A().settings; }
    case 'update_param_option': { defs().forEach((d) => d.options.forEach((o: any) => { if (o.id === a.input.id) { if (a.input.label !== undefined) o.label = a.input.label; if (a.input.color !== undefined) o.color = a.input.color; } })); return A().settings; }
    case 'delete_param_option': { defs().forEach((d) => (d.options = d.options.filter((o: any) => o.id !== a.id))); return A().settings; }

    /* Settings — edge param defs / options */
    case 'create_edge_param_def': { const i = a.input; edefs().push({ id: uid(), presetId: A().settings.activePresetId, displayName: i.displayName, paramType: i.paramType || 'text', defaultValue: i.defaultValue ?? null, drivesArrow: false, drivesStyle: false, drivesColor: false, drivesWidth: false, sortOrder: maxSort(edefs()), options: [] }); return A().settings; }
    case 'update_edge_param_def': { const d = edefs().find((x) => x.id === a.input.id); if (d) { const i = a.input; if (i.displayName !== undefined) d.displayName = i.displayName; if (i.paramType !== undefined) d.paramType = i.paramType; if (i.defaultValue !== undefined) d.defaultValue = i.defaultValue; } return A().settings; }
    case 'delete_edge_param_def': { A().settings.edgeParamDefs = edefs().filter((d) => d.id !== a.id); A().edges.forEach((e) => (e.paramValues = e.paramValues.filter((p: any) => p.paramDefId !== a.id))); return A().settings; }
    case 'set_edge_drive': { const flag = ({ arrow: 'drivesArrow', style: 'drivesStyle', color: 'drivesColor', width: 'drivesWidth' } as any)[a.drive]; if (flag) edefs().forEach((d) => (d[flag] = d.id === a.id)); return A().settings; }
    case 'create_edge_param_option': { const i = a.input; const d = edefs().find((x) => x.id === i.paramDefId); if (d) d.options.push({ id: uid(), paramDefId: d.id, valueSlug: slug(i.label), label: i.label, color: i.color ?? null, sortOrder: maxSort(d.options) }); return A().settings; }
    case 'update_edge_param_option': { edefs().forEach((d) => d.options.forEach((o: any) => { if (o.id === a.input.id) { if (a.input.label !== undefined) o.label = a.input.label; if (a.input.color !== undefined) o.color = a.input.color; } })); return A().settings; }
    case 'delete_edge_param_option': { edefs().forEach((d) => (d.options = d.options.filter((o: any) => o.id !== a.id))); return A().settings; }

    /* Presets (loosely modelled — one settings object per tab) */
    case 'create_preset': { const p = { id: uid(), name: a.input.name, isBuiltin: false, createdAt: now() }; A().settings.presets.push(p); A().settings.activePresetId = p.id; return A().settings; }
    case 'duplicate_preset': { const p = { id: uid(), name: a.input.newName, isBuiltin: false, createdAt: now() }; A().settings.presets.push(p); A().settings.activePresetId = p.id; return A().settings; }
    case 'rename_preset': { const p = A().settings.presets.find((x: any) => x.id === a.input.id); if (p) p.name = a.input.newName; return A().settings; }
    case 'delete_preset': { A().settings.presets = A().settings.presets.filter((x: any) => x.id !== a.id); return A().settings; }

    /* Graph file ops → browser downloads / clear */
    case 'new_graph': { A().nodes = []; A().edges = []; A().regions = []; return undefined; }
    case 'save_graph_to_path': {
      download(ensureExt(basename(a.path), 'glograph'), JSON.stringify(buildExport(A()), null, 2), 'application/json');
      // Saving establishes a new clean baseline (mirrors the desktop backend).
      if (activeId) { baselines[activeId] = fingerprintStore(A()); const t = tabs.find((x) => x.id === activeId); if (t) t.dirty = false; }
      return a.path;
    }
    case 'write_text_file': { download(basename(a.path), a.content, 'text/plain'); return undefined; }
    case 'write_binary_file': { download(basename(a.path), new Uint8Array(a.bytes), 'application/octet-stream'); return undefined; }

    default:
      // Unknown command — resolve undefined so the demo never hard-fails.
      console.warn('[demo] unhandled command:', cmd);
      return undefined;
  }
}

function ensureExt(name: string, ext: string): string {
  return name.toLowerCase().endsWith('.' + ext) ? name : name + '.' + ext;
}

/* ════════════════════════════════════════════════════════════════════════
   Demo chrome: the site header above the app + the two status badges
   (objects created / cap, and the 30-minute reset timer).
   ════════════════════════════════════════════════════════════════════════ */
let objectsBadgeEl: HTMLElement | null = null;
let timerBadgeEl: HTMLElement | null = null;
let limitBannerEl: HTMLElement | null = null;
let limitBannerTimer: ReturnType<typeof setTimeout> | null = null;
const TIMER_KEY = 'gg_demo_deadline';

// Inline (non-toast) notice shown when a create is blocked by a demo cap (objects
// or tabs). Defaults to the object-cap message; callers pass their own for tabs.
function showLimitBanner(message: string = OBJECT_LIMIT_MSG) {
  if (!limitBannerEl) return;
  const msg = limitBannerEl.querySelector('.demo-limit__msg');
  if (msg) msg.textContent = message;
  limitBannerEl.classList.add('demo-limit--show');
  if (limitBannerTimer) clearTimeout(limitBannerTimer);
  limitBannerTimer = setTimeout(() => limitBannerEl && limitBannerEl.classList.remove('demo-limit--show'), 6000);
}

function updateObjectsBadge() {
  if (!objectsBadgeEl) return;
  const n = objectsCount();
  objectsBadgeEl.querySelector('.demo-badge__val')!.textContent = `${n} / ${DEMO_OBJECT_LIMIT}`;
  objectsBadgeEl.classList.toggle('demo-badge--warn', n >= Math.ceil(DEMO_OBJECT_LIMIT * 0.7) && n < DEMO_OBJECT_LIMIT);
  objectsBadgeEl.classList.toggle('demo-badge--full', n >= DEMO_OBJECT_LIMIT);
}
function flashObjectsBadge() {
  if (!objectsBadgeEl) return;
  objectsBadgeEl.classList.remove('demo-badge--flash');
  void objectsBadgeEl.offsetWidth;            // restart the animation
  objectsBadgeEl.classList.add('demo-badge--flash');
}

function startResetTimer() {
  let deadline = Number(sessionStorage.getItem(TIMER_KEY) || 0);
  if (!deadline || deadline <= Date.now()) {
    deadline = Date.now() + DEMO_DURATION_MS;
    try { sessionStorage.setItem(TIMER_KEY, String(deadline)); } catch { /* ignore */ }
  }
  const tick = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      try { sessionStorage.removeItem(TIMER_KEY); } catch { /* ignore */ }
      // Full reset: nothing is persisted, so a reload restores the seeded demo
      // and a fresh 30-minute window.
      location.reload();
      return;
    }
    if (timerBadgeEl) {
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      timerBadgeEl.querySelector('.demo-badge__val')!.textContent = `${m}:${String(s).padStart(2, '0')}`;
      timerBadgeEl.classList.toggle('demo-badge--warn', remaining <= 2 * 60000);
    }
  };
  tick();
  setInterval(tick, 1000);
}

function installDemoChrome() {
  if (typeof document === 'undefined') return;
  const boot = () => {
    if (document.getElementById('demo-chrome')) return;
    document.documentElement.classList.add('demo-framed');

    const style = document.createElement('style');
    style.textContent = `
      /* Stack the site header above the app and let the app fill the rest. */
      html.demo-framed, html.demo-framed body { height: 100%; }
      html.demo-framed body { display: flex; flex-direction: column; overflow: hidden; }
      html.demo-framed #root { flex: 1 1 auto; min-height: 0; height: auto; overflow: hidden; }
      html.demo-framed .app, html.demo-framed .app-loading { height: 100%; }
      html.demo-framed .sidebar, html.demo-framed .detail-panel { height: 100%; }

      /* Founder's deal strip — same as the marketing site (styles.css .founder-banner). */
      .founder-banner {
        flex: 0 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
        background: var(--accent-dim, #6e4c00); border-bottom: 1px solid var(--border-lo, #0c0c0c);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        padding: 7px 16px; font-size: 13px; color: #f0dcb0;
        font-family: 'IBM Plex Sans', 'Segoe UI', Tahoma, system-ui, sans-serif;
      }
      .founder-banner__tag {
        font-family: 'IBM Plex Mono', Consolas, monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px;
        background: var(--accent, #ffb000); color: #1a1200; padding: 2px 7px; border-radius: 1px;
      }
      .founder-banner__text { max-width: 100%; overflow-wrap: break-word; }
      .founder-banner__text strong { color: #fff; }
      .founder-banner__link { color: var(--accent, #ffb000); font-weight: 700; white-space: nowrap; text-decoration: none; }
      .founder-banner__link:hover { text-decoration: underline; }

      /* The demo header is the SAME as the marketing site nav (styles.css .nav),
         replicated here because the SPA doesn't load styles.css, plus the demo
         badges. Scoped to .nav / .nav__cta so it never collides with the app's .btn. */
      .nav {
        flex: 0 0 auto; position: relative; z-index: 200;
        display: flex; align-items: center; gap: 24px; padding: 10px 24px;
        background: var(--surface, #212121);
        border-bottom: 1px solid var(--border-lo, #0c0c0c);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .nav__brand {
        font-family: 'IBM Plex Mono', Consolas, 'Cascadia Code', monospace;
        font-weight: 700; letter-spacing: 2px; font-size: 18px; color: var(--text, #ccc); text-decoration: none;
      }
      .nav__brand:hover { text-decoration: none; }
      .nav__links { display: flex; gap: 20px; margin-left: auto; }
      .nav__links a {
        color: var(--text-muted, #888); font-size: 13px; font-weight: 500;
        font-family: 'IBM Plex Mono', Consolas, 'Cascadia Code', monospace;
        text-transform: uppercase; letter-spacing: 0.6px; text-decoration: none;
      }
      .nav__links a:hover { color: var(--text, #ccc); text-decoration: none; }
      .nav__cta {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        font-family: 'IBM Plex Mono', Consolas, 'Cascadia Code', monospace;
        font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
        padding: 8px 16px; min-height: 32px; white-space: nowrap;
        background: var(--accent, #ffb000); color: #1a1200;
        border: 1px solid; border-color: #ffc94d var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) #ffc94d;
        border-radius: 1px; text-decoration: none; cursor: pointer; transition: background .15s ease;
      }
      .nav__cta:hover { background: #ffbf2e; text-decoration: none; }
      .demo-badges { display: flex; align-items: center; gap: 8px; }
      .demo-badge {
        display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 9px;
        font-family: Consolas, 'Cascadia Code', monospace; font-size: 11px; font-variant-numeric: tabular-nums;
        color: var(--text-muted, #888); background: var(--surface-2, #2a2a2a);
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        border-radius: 1px; white-space: nowrap;
      }
      .demo-badge__lbl { color: var(--text-dim, #545454); text-transform: uppercase; letter-spacing: 0.5px; font-size: 9px; }
      .demo-badge__val { color: var(--text, #ccc); }
      .demo-badge__ic { color: var(--accent, #ffb000); display: inline-flex; }
      .demo-badge--warn { border-color: var(--warn,#c97a1a); }
      .demo-badge--warn .demo-badge__val, .demo-badge--warn .demo-badge__ic { color: var(--warn,#c97a1a); }
      .demo-badge--full { border-color: var(--danger,#c83030); }
      .demo-badge--full .demo-badge__val, .demo-badge--full .demo-badge__ic { color: var(--danger,#c83030); }
      .demo-badge--flash { animation: demo-badge-flash 0.6s ease-out; }
      @keyframes demo-badge-flash {
        0% { box-shadow: 0 0 0 0 rgba(200,48,48,0.8); }
        100% { box-shadow: 0 0 0 8px rgba(200,48,48,0); }
      }
      @media (max-width: 860px) { .nav__links { display: none; } }

      /* Inline limit notice (anchored bar under the header, not a toast). */
      .demo-limit {
        position: fixed; top: 84px; left: 50%; z-index: 6000;
        display: flex; align-items: center; gap: 8px; max-width: 540px;
        padding: 8px 8px 8px 12px;
        background: var(--surface-2, #2a2a2a); color: var(--text, #ccc);
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        border-left: 3px solid var(--danger, #c83030);
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; font-size: 12px; line-height: 1.4;
        opacity: 0; pointer-events: none;
        transform: translateX(-50%) translateY(-8px);
        transition: opacity .15s ease, transform .15s ease;
      }
      .demo-limit--show { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
      .demo-limit__ic { color: var(--danger, #c83030); flex-shrink: 0; }
      .demo-limit__x {
        flex-shrink: 0; background: transparent; border: none; color: var(--text-muted, #888);
        cursor: pointer; font-size: 13px; line-height: 1; padding: 2px 4px;
      }
      .demo-limit__x:hover { color: var(--text, #ccc); }

      /* "? Tutorial" badge-button (lives in the demo-only badge cluster). */
      .demo-badge--btn { cursor: pointer; font-family: Consolas, 'Cascadia Code', monospace; }
      .demo-badge--btn:hover { color: var(--text, #ccc); border-color: var(--border-strong, #585858); }

      /* Tutorial modal (app modal aesthetic). */
      .dtut-backdrop {
        display: none; position: fixed; inset: 0; z-index: 8000;
        background: rgba(0,0,0,0.72); align-items: flex-start; justify-content: center; padding-top: 64px;
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif;
      }
      .dtut-backdrop--open { display: flex; }
      .dtut-panel {
        background: var(--surface, #212121); width: 480px; max-width: calc(100vw - 32px); max-height: calc(100vh - 128px);
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        box-shadow: 0 12px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column;
      }
      .dtut-header {
        align-items: center; background: #363636; border-bottom: 1px solid var(--border-lo,#0c0c0c);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 0 var(--border,#484848);
        display: flex; flex-shrink: 0; gap: 8px; padding: 9px 12px;
      }
      .dtut-header h2 { color: var(--text,#ccc); flex: 1; font-size: 13px; font-weight: 600; margin: 0; }
      .dtut-close { background: transparent; border: none; color: var(--text-muted,#888); cursor: pointer; font-size: 16px; line-height: 1; padding: 2px 4px; }
      .dtut-close:hover { color: var(--text,#ccc); }
      .dtut-body { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; padding: 16px; }
      .dtut-intro { color: var(--text-muted,#888); font-size: 13px; margin: 0 0 2px; line-height: 1.45; }
      .dtut-intro b { color: var(--accent,#ffb000); font-weight: 600; }
      .dtut-step { display: flex; gap: 12px; align-items: flex-start; }
      .dtut-step__ic {
        align-items: center; background: var(--bg,#171717); border: 1px solid var(--border-subtle,#1c1c1c);
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.55); color: var(--accent,#ffb000);
        display: flex; flex-shrink: 0; height: 34px; justify-content: center; width: 34px;
      }
      .dtut-step__t { color: var(--text,#ccc); font-size: 13px; font-weight: 600; }
      .dtut-step__d { color: var(--text-muted,#888); font-size: 12px; line-height: 1.45; margin-top: 1px; }
      .dtut-footer {
        align-items: center; background: #141414; border-top: 1px solid var(--border-lo,#0c0c0c);
        box-shadow: inset 0 1px 0 var(--border-subtle,#1c1c1c);
        display: flex; flex-shrink: 0; gap: 8px; justify-content: space-between; padding: 10px 12px;
      }
      .dtut-btn {
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; font-size: 12px; font-weight: 600;
        padding: 7px 14px; min-height: 30px; border-radius: 1px; cursor: pointer;
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        background: var(--surface-2,#2a2a2a); color: var(--text,#ccc);
      }
      .dtut-btn:hover { background: var(--surface-3,#353535); }
      .dtut-btn--primary { background: var(--accent,#ffb000); color: #1a1200; font-weight: 700; border-color: #ffc94d var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) #ffc94d; }
      .dtut-btn--primary:hover { background: #ffbf2e; }

      /* Mobile: the demo is the full desktop workstation — replace it with a
         fallback rather than cram React Flow + three panels onto a phone. */
      .demo-mobile {
        display: none; flex-direction: column; align-items: center; text-align: center;
        gap: 14px; padding: 28px 20px; overflow-y: auto;
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; color: var(--text,#ccc);
      }
      .demo-mobile__kicker { font-family: 'IBM Plex Mono', Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--accent,#ffb000); max-width: 100%; }
      .demo-mobile h2 { font-size: 22px; margin: 0; color: var(--text,#ccc); max-width: 100%; overflow-wrap: break-word; }
      .demo-mobile p { color: var(--text-muted,#888); font-size: 14px; line-height: 1.5; max-width: 38ch; margin: 0; }
      .demo-mobile p strong { color: var(--text,#ccc); }
      .demo-mobile__shot { width: 100%; max-width: 440px; height: auto; border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a); }
      .demo-mobile__btn {
        margin-top: 6px; display: inline-flex; align-items: center; padding: 10px 18px;
        background: var(--accent,#ffb000); color: #1a1200; font-weight: 700; text-decoration: none;
        border: 1px solid; border-color: #ffc94d var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) #ffc94d;
        border-radius: 1px; font-family: 'IBM Plex Mono', Consolas, monospace; letter-spacing: 0.5px;
      }
      @media (max-width: 760px) {
        html.demo-framed, html.demo-framed body { max-width: 100%; overflow-x: hidden; }
        html.demo-framed #root { display: none; }
        .demo-badges { display: none; }
        .demo-limit { display: none !important; }
        .demo-mobile { display: flex; flex: 1 1 auto; min-height: 0; }
        .founder-banner { display: none; }   /* drop the promo strip on phones */
        .nav { padding: 10px 14px; gap: 12px; }
        .nav__cta { margin-left: auto; }
      }
    `;
    document.head.appendChild(style);

    // Same web fonts the marketing site uses, so the header matches exactly.
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(font);

    // Markup mirrors the site nav in ../website/index.html (same brand, links, CTA);
    // in-page anchors are prefixed with "/" so they jump to the marketing site.
    const header = document.createElement('header');
    header.id = 'demo-chrome';
    header.className = 'nav';
    header.innerHTML = `
      <a class="nav__brand" href="/" title="GloGraph home">GLOGRAPH</a>
      <nav class="nav__links">
        <a href="/#why">Why</a>
        <a href="/#features">Features</a>
        <a href="/#sdk">SDK</a>
        <a href="/demo/">Demo</a>
        <a href="/#gallery">Gallery</a>
        <a href="/#plans">Plans</a>
        <a href="/#faq">FAQ</a>
      </nav>
      <div class="demo-badges">
        <button class="demo-badge demo-badge--btn" id="demo-help" title="Show the demo tutorial">? Tutorial</button>
        <span class="demo-badge" id="demo-badge-objects" title="Graph objects you can create in the demo">
          <span class="demo-badge__ic">▪</span><span class="demo-badge__lbl">objects</span><span class="demo-badge__val">0 / ${DEMO_OBJECT_LIMIT}</span>
        </span>
        <span class="demo-badge" id="demo-badge-timer" title="The demo resets when this reaches 0:00">
          <span class="demo-badge__ic">⏱</span><span class="demo-badge__lbl">resets in</span><span class="demo-badge__val">30:00</span>
        </span>
      </div>
      <a class="nav__cta" href="/#notify">Get early access</a>
    `;

    // Early-access strip sits above the nav, exactly like the marketing site.
    const founder = document.createElement('div');
    founder.className = 'founder-banner';
    founder.innerHTML = `
      <span class="founder-banner__tag">EARLY ACCESS</span>
      <span class="founder-banner__text">GloGraph is in beta. Join the list for early access and launch updates.</span>
      <a href="/#notify" class="founder-banner__link">Join the list →</a>
    `;
    document.body.insertBefore(founder, document.body.firstChild);
    document.body.insertBefore(header, founder.nextSibling);

    const banner = document.createElement('div');
    banner.id = 'demo-limit';
    banner.className = 'demo-limit';
    banner.innerHTML = `
      <span class="demo-limit__ic" aria-hidden>▲</span>
      <span class="demo-limit__msg">${OBJECT_LIMIT_MSG}</span>
      <button class="demo-limit__x" aria-label="Dismiss">✕</button>
    `;
    document.body.appendChild(banner);
    limitBannerEl = banner;
    banner.querySelector('.demo-limit__x')!.addEventListener('click', () => banner.classList.remove('demo-limit--show'));

    // Mobile fallback (shown via CSS ≤760px; the desktop app is hidden there).
    const mobile = document.createElement('div');
    mobile.className = 'demo-mobile';
    mobile.innerHTML = `
      <div class="demo-mobile__kicker">:: Live demo ::</div>
      <h2>Best on a bigger screen</h2>
      <p>The GloGraph demo is the full desktop workstation — dense docked panels, drag-to-connect, a graph canvas. It wants a mouse and some room. Open <strong>glograph.com/demo</strong> on a computer to try it.</p>
      <img class="demo-mobile__shot" src="/assets/macro-economics-demo.png" alt="A GloGraph causal map: typed nodes and colored, labeled edges." />
      <a class="demo-mobile__btn" href="/">Back to home</a>
    `;
    document.body.appendChild(mobile);

    objectsBadgeEl = header.querySelector('#demo-badge-objects');
    timerBadgeEl = header.querySelector('#demo-badge-timer');
    updateObjectsBadge();
    startResetTimer();

    installTutorial(header.querySelector('#demo-help') as HTMLElement);
  };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
}

// Tutorial popup — shown on first visit (per-browser, localStorage), reopenable
// via the "? Tutorial" badge. Steps describe the real app interactions.
function installTutorial(helpBtn: HTMLElement | null) {
  const KEY = 'glograph_demo_tutorial_dismissed';
  const ico = (p: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const steps: [string, string, string][] = [
    ['<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/>',
      'Move a node', 'Drag any node card to reposition it on the canvas.'],
    ['<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
      'Expand & keep open', 'Hover a node to reveal its details. Click the chevron in its title row to keep it expanded.'],
    ['<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
      'Pin a position', "Click the pin in a node's title row to lock it in place so it won't drag."],
    ['<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>',
      'Inspect', 'Click any node or region to open the detail panel on the right, with its parameters and connections.'],
    ['<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
      'Group with regions', 'Lock or minimize a region from its header to group its nodes or collapse it. Captured nodes show a lock badge.'],
    ['<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
      'Navigate', 'Drag the canvas to pan, scroll to zoom. Use the sidebar tree and search, or open your own .glograph from the File menu.'],
  ];
  const back = document.createElement('div');
  back.className = 'dtut-backdrop';
  back.innerHTML = `
    <div class="dtut-panel" role="dialog" aria-modal="true" aria-label="Demo tutorial">
      <div class="dtut-header"><h2>Welcome to the GloGraph demo</h2><button class="dtut-close" aria-label="Close">✕</button></div>
      <div class="dtut-body">
        <p class="dtut-intro">This is the real GloGraph app, running in your browser. Edit freely — you can create up to <b>${DEMO_OBJECT_LIMIT} objects</b>, nothing is saved, and it <b>resets every 30 minutes</b>.</p>
        ${steps.map((s) => `<div class="dtut-step"><span class="dtut-step__ic">${ico(s[0])}</span><div><div class="dtut-step__t">${s[1]}</div><div class="dtut-step__d">${s[2]}</div></div></div>`).join('')}
      </div>
      <div class="dtut-footer"><button class="dtut-btn" data-act="skip">Skip tutorial</button><button class="dtut-btn dtut-btn--primary" data-act="ok">Got it</button></div>
    </div>`;
  document.body.appendChild(back);
  const open = () => back.classList.add('dtut-backdrop--open');
  const close = () => { back.classList.remove('dtut-backdrop--open'); try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ } };
  back.querySelector('.dtut-close')!.addEventListener('click', close);
  back.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', close));
  back.addEventListener('click', (e) => { if (e.target === back) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && back.classList.contains('dtut-backdrop--open')) close(); });
  if (helpBtn) helpBtn.addEventListener('click', open);
  let dismissed = false; try { dismissed = localStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
  // Don't auto-open on mobile — the demo shows a fallback there, not the app.
  if (!dismissed && window.innerWidth > 760) open();
}

installDemoChrome();
