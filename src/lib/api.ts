import { invoke } from '@tauri-apps/api/core';
import type {
  AddLinkInput,
  AddMediaInput,
  CreateEdgeInput,
  CreateEdgeParamDefInput,
  CreateEdgeParamOptionInput,
  CreateNodeInput,
  CreateNodeParamDefInput,
  CreateNodeParamOptionInput,
  CreatePresetInput,
  CreateRegionInput,
  DuplicatePresetInput,
  GloEdge,
  GloNode,
  GloRegion,
  GraphSettings,
  NodeLink,
  NodeMedia,
  NodePosition,
  ProjectTab,
  RenamePresetInput,
  UpdateEdgeInput,
  UpdateEdgeParamDefInput,
  UpdateEdgeParamOptionInput,
  UpdateEdgeWaypointsInput,
  UpdateNodeInput,
  UpdateNodeParamDefInput,
  UpdateNodeParamOptionInput,
  UpdateRegionInput,
} from '../types';
import type { TraceDirection, TraceResult } from './trace';

export const api = {
  getBuildInfo: () => invoke<{ version: string; buildDate: string }>('get_build_info'),
  getAllNodes: () => invoke<GloNode[]>('get_all_nodes'),
  createNode: (input: CreateNodeInput) => invoke<GloNode>('create_node', { input }),
  updateNode: (input: UpdateNodeInput) => invoke<GloNode>('update_node', { input }),
  restoreNode: (node: GloNode) => invoke<GloNode>('restore_node', { node }),
  deleteNode: (id: string) => invoke<void>('delete_node', { id }),
  updateNodePositions: (positions: NodePosition[]) =>
    invoke<void>('update_node_positions', { positions }),
  addNodeLink: (input: AddLinkInput) => invoke<NodeLink>('add_node_link', { input }),
  deleteNodeLink: (id: string) => invoke<void>('delete_node_link', { id }),
  addNodeMedia: (input: AddMediaInput) => invoke<NodeMedia>('add_node_media', { input }),
  updateNodeMedia: (id: string, label: string | null, src: string, srcType: string) =>
    invoke<NodeMedia>('update_node_media', { id, label, src, srcType }),
  updateNodeMediaShowOnCard: (id: string, showOnCard: boolean) =>
    invoke<void>('update_node_media_show_on_card', { id, showOnCard }),
  updateNodeMediaSortOrder: (id: string, sortOrder: number) =>
    invoke<void>('update_node_media_sort_order', { id, sortOrder }),
  deleteNodeMedia: (id: string) => invoke<void>('delete_node_media', { id }),
  // Read a local file's bytes (a Live Share guest uses this to upload a picked
  // media file to the host over the session).
  readLocalFile: (path: string) => invoke<number[]>('read_local_file', { path }),
  // File-node previews: read the head of a text file, and best-effort extract an
  // Office file's embedded thumbnail (null when absent / not renderable).
  readTextFileHead: (path: string, maxBytes: number) =>
    invoke<string>('read_text_file_head', { path, maxBytes }),
  extractOfficeThumbnail: (path: string) =>
    invoke<number[] | null>('extract_office_thumbnail', { path }),
  setNodePinned: (id: string, pinned: boolean) => invoke<void>('set_node_pinned', { id, pinned }),
  setNodeExpandPinned: (id: string, expandPinned: boolean) =>
    invoke<void>('set_node_expand_pinned', { id, expandPinned }),
  setNodeZOrder: (id: string, zOrder: number) =>
    invoke<GloNode>('set_node_z_order', { id, zOrder }),
  setNodeSize: (id: string, width: number | null, height: number | null) =>
    invoke<GloNode>('set_node_size', { id, width, height }),
  setNodeRenderMarkdown: (id: string, renderMarkdown: boolean) =>
    invoke<void>('set_node_render_markdown', { id, renderMarkdown }),
  setNodeShowThumbnail: (id: string, showThumbnail: boolean) =>
    invoke<void>('set_node_show_thumbnail', { id, showThumbnail }),

  // Publish a coalesced "graph changed" event to the SSE stream (GET /api/events)
  // so GUI edits are visible to subscribers / a future spectate client.
  publishChange: () => invoke<void>('publish_change'),

  getAllEdges: () => invoke<GloEdge[]>('get_all_edges'),
  // Impact trace runs in the authoritative Rust engine (shared with GET /api/trace).
  trace: (seedId: string, direction: TraceDirection) =>
    invoke<TraceResult>('trace', { seedId, direction }),
  createEdge: (input: CreateEdgeInput) => invoke<GloEdge>('create_edge', { input }),
  updateEdge: (input: UpdateEdgeInput) => invoke<GloEdge>('update_edge', { input }),
  updateEdgeWaypoints: (input: UpdateEdgeWaypointsInput) => invoke<GloEdge>('update_edge_waypoints', { input }),
  reconnectEdge: (id: string, sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) =>
    invoke<GloEdge>('reconnect_edge', { id, sourceId, targetId, sourceHandle, targetHandle }),
  restoreEdge: (edge: GloEdge) => invoke<GloEdge>('restore_edge', { edge }),
  deleteEdge: (id: string) => invoke<void>('delete_edge', { id }),

  getGraphSettings: () => invoke<GraphSettings>('get_graph_settings'),
  setActivePreset: (id: string) => invoke<GraphSettings>('set_active_preset', { id }),
  createPreset: (input: CreatePresetInput) => invoke<GraphSettings>('create_preset', { input }),
  duplicatePreset: (input: DuplicatePresetInput) => invoke<GraphSettings>('duplicate_preset', { input }),
  renamePreset: (input: RenamePresetInput) => invoke<GraphSettings>('rename_preset', { input }),
  deletePreset: (id: string) => invoke<GraphSettings>('delete_preset', { id }),

  createNodeParamDef: (input: CreateNodeParamDefInput) => invoke<GraphSettings>('create_node_param_def', { input }),
  updateNodeParamDef: (input: UpdateNodeParamDefInput) => invoke<GraphSettings>('update_node_param_def', { input }),
  deleteNodeParamDef: (id: string) => invoke<GraphSettings>('delete_node_param_def', { id }),
  setDrivesColor: (id: string) => invoke<GraphSettings>('set_drives_color', { id }),

  createParamOption: (input: CreateNodeParamOptionInput) => invoke<GraphSettings>('create_param_option', { input }),
  updateParamOption: (input: UpdateNodeParamOptionInput) => invoke<GraphSettings>('update_param_option', { input }),
  deleteParamOption: (id: string) => invoke<GraphSettings>('delete_param_option', { id }),

  createEdgeParamDef: (input: CreateEdgeParamDefInput) => invoke<GraphSettings>('create_edge_param_def', { input }),
  updateEdgeParamDef: (input: UpdateEdgeParamDefInput) => invoke<GraphSettings>('update_edge_param_def', { input }),
  deleteEdgeParamDef: (id: string) => invoke<GraphSettings>('delete_edge_param_def', { id }),
  setEdgeDrive: (id: string, drive: string) => invoke<GraphSettings>('set_edge_drive', { id, drive }),

  createEdgeParamOption: (input: CreateEdgeParamOptionInput) => invoke<GraphSettings>('create_edge_param_option', { input }),
  updateEdgeParamOption: (input: UpdateEdgeParamOptionInput) => invoke<GraphSettings>('update_edge_param_option', { input }),
  deleteEdgeParamOption: (id: string) => invoke<GraphSettings>('delete_edge_param_option', { id }),

  getAllRegions: () => invoke<GloRegion[]>('get_all_regions'),
  createRegion: (input: CreateRegionInput) => invoke<GloRegion>('create_region', { input }),
  updateRegion: (input: UpdateRegionInput) => invoke<GloRegion>('update_region', { input }),
  restoreRegion: (region: GloRegion) => invoke<GloRegion>('restore_region', { region }),
  deleteRegion: (id: string) => invoke<void>('delete_region', { id }),
  setRegionZOrder: (id: string, zOrder: number) => invoke<GloRegion>('set_region_z_order', { id, zOrder }),
  setRegionLocked: (id: string, locked: boolean) => invoke<GloRegion>('set_region_locked', { id, locked }),
  setRegionMinimized: (id: string, minimized: boolean) => invoke<GloRegion>('set_region_minimized', { id, minimized }),

  getAppSetting: (key: string) => invoke<string | null>('get_app_setting', { key }),
  setAppSetting: (key: string, value: string) => invoke<void>('set_app_setting', { key, value }),

  // User identity (global, per-machine) — display name for future shared sessions.
  getDisplayName: () => invoke<string>('get_display_name'),
  setDisplayName: (name: string) => invoke<void>('set_display_name', { name }),
  // The host's shareable LAN address (ip:port) for sessions.
  getLanAddress: () => invoke<string>('get_lan_address'),
  // Live Share host session: start the LAN-bound, token-gated read-only server
  // (returns the port); stop it.
  startHostSession: (token: string, role: string) => invoke<{ port: number; fingerprint: string }>('start_host_session', { token, role }),
  stopHostSession: () => invoke<void>('stop_host_session'),
  // Live Share TLS: the guest's loopback bridge to the host's HTTPS session
  // server (host cert pinned by fingerprint). Returns the local http://127.0.0.1
  // base the guest's transport should use.
  startGuestBridge: (host: string, fingerprint: string) => invoke<string>('start_guest_bridge', { host, fingerprint }),
  stopGuestBridge: () => invoke<void>('stop_guest_bridge'),

  newGraph: () => invoke<void>('new_graph'),
  saveGraphToPath: (path: string) => invoke<string>('save_graph_to_path', { path }),
  writeTextFile: (path: string, content: string) => invoke<void>('write_text_file', { path, content }),
  writeBinaryFile: (path: string, bytes: number[]) => invoke<void>('write_binary_file', { path, bytes }),

  getTabs: () => invoke<ProjectTab[]>('get_tabs'),
  createTab: (name: string, presetId: string) => invoke<ProjectTab[]>('create_tab', { name, presetId }),
  switchTab: (id: string) => invoke<ProjectTab[]>('switch_tab', { id }),
  closeTab: (id: string, deleteDb = false) => invoke<ProjectTab[]>('close_tab', { id, deleteDb }),
  setTabDirty: (id: string, dirty: boolean) => invoke<ProjectTab[]>('set_tab_dirty', { id, dirty }),
  // Recompute the active tab's dirty flag from a content fingerprint vs its clean
  // baseline (so undoing back to the saved/initial state clears the unsaved dot).
  recomputeActiveTabDirty: () => invoke<ProjectTab[]>('recompute_active_tab_dirty'),
  renameTab: (id: string, name: string) => invoke<ProjectTab[]>('rename_tab', { id, name }),
  setTabSavePath: (id: string, path: string | null) => invoke<ProjectTab[]>('set_tab_save_path', { id, path }),
  getRecentProjects: () => invoke<{ name: string; path: string; missing?: boolean }[]>('get_recent_projects'),
  recordRecentProject: (name: string, path: string) => invoke<void>('record_recent_project', { name, path }),
  removeRecentProject: (path: string) => invoke<void>('remove_recent_project', { path }),
  openPathAsTab: (path: string) => invoke<ProjectTab[]>('open_path_as_tab', { path }),
};
