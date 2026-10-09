export interface NodeLink {
  id: string;
  nodeId: string;
  url: string;
  label?: string | null;
}

export interface NodeMedia {
  id: string;
  nodeId: string;
  label: string;
  src: string;
  srcType: string;
  mediaType: string;
  sortOrder: number;
  showOnCard: boolean;
}

export interface AddMediaInput {
  nodeId: string;
  label: string;
  src: string;
  srcType: string;
  mediaType: string;
  showOnCard?: boolean;
}

export interface NodeParamValue {
  id: string;
  nodeId: string;
  paramDefId: string;
  value?: string | null;
  isEnabled: boolean;
  showOnCard: boolean;
}

export interface NodeParamValueInput {
  paramDefId: string;
  value?: string | null;
  isEnabled: boolean;
  showOnCard: boolean;
}

export interface GloNode {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  dateAdded: string;
  x: number;
  y: number;
  color?: string | null;
  confidence?: number | null;
  impactMagnitude?: number | null;
  externalId?: string | null;
  tags: string[];
  links: NodeLink[];
  media: NodeMedia[];
  paramValues: NodeParamValue[];
  isPinned?: boolean;
  isExpandPinned?: boolean;
  zOrder?: number;
  // Graph-item variant (see specs/GRAPH_ITEMS_DESIGN.md). Absent on legacy data
  // → treat as 'standard'. The backend always emits it going forward.
  kind?: NodeKind;
  // Optional per-node canvas size for resizable items (null = default size).
  width?: number | null;
  height?: number | null;
  // Notes: render the body as markdown (true / default) or as raw plain text
  // (false). Only meaningful for kind === 'note'. Absent on legacy data → true.
  renderMarkdown?: boolean;
  // Files: show a thumbnail / first-page preview (true / default) or just a
  // file-type icon (false). Only meaningful for kind === 'file'. Absent on
  // legacy data → true.
  showThumbnail?: boolean;
}

// Node variant discriminator. 'standard' is a normal typed node; the others are
// the lightweight "graph items" (note / image / video / audio).
export type NodeKind = 'standard' | 'note' | 'image' | 'video' | 'audio' | 'file';

// ── Edge ──────────────────────────────────────────────────────────────────────

export interface WaypointPoint {
  x: number;
  y: number;
}

export type EdgeRoutingMode = 'bezier' | 'waypoints' | 'orthogonal';

export interface EdgeParamValue {
  id: string;
  edgeId: string;
  paramDefId: string;
  value?: string | null;
  isEnabled: boolean;
}

export interface EdgeParamValueInput {
  paramDefId: string;
  value?: string | null;
  isEnabled: boolean;
}

export interface GloEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  paramValues: EdgeParamValue[];
  waypoints?: WaypointPoint[] | null;
  externalId?: string | null;
  label?: string | null;
  color?: string | null;   // hex override; null = use the colour-driving edge param
}

export interface UpdateEdgeWaypointsInput {
  id: string;
  waypoints?: WaypointPoint[] | null;
}

export interface CreateNodeInput {
  title: string;
  description?: string | null;
  eventDate?: string | null;
  x: number;
  y: number;
  color?: string | null;
  confidence?: number | null;
  impactMagnitude?: number | null;
  paramValues: NodeParamValueInput[];
  tags?: string[];
  // Omit for a standard node; the backend defaults it to 'standard'.
  kind?: NodeKind;
}

export interface UpdateNodeInput {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  x: number;
  y: number;
  color?: string | null;
  confidence?: number | null;
  impactMagnitude?: number | null;
  paramValues: NodeParamValueInput[];
  tags?: string[];
}

export interface CreateEdgeInput {
  sourceId: string;
  targetId: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  paramValues: EdgeParamValueInput[];
}

export interface UpdateEdgeInput {
  id: string;
  paramValues: EdgeParamValueInput[];
  label?: string | null;
  color?: string | null;
}

export interface AddLinkInput {
  nodeId: string;
  url: string;
  label?: string | null;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

// ── Region ────────────────────────────────────────────────────────────────────

export interface GloRegion {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string | null;
  zOrder: number;
  isLocked?: boolean;
  isMinimized?: boolean;
  createdAt: string;
}

export interface CreateRegionInput {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string | null;
}

export interface UpdateRegionInput {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string | null;
}

// ── Settings types ────────────────────────────────────────────────────────────

export interface Preset {
  id: string;
  name: string;
  isBuiltin: boolean;
  createdAt: string;
}

export interface NodeParamOption {
  id: string;
  paramDefId: string;
  valueSlug: string;
  label: string;
  color?: string | null;
  sortOrder: number;
}

export interface NodeParamDef {
  id: string;
  presetId: string;
  displayName: string;
  paramType: string;
  defaultValue?: string | null;
  drivesColor: boolean;
  showOnCardDefault: boolean;
  sortOrder: number;
  options: NodeParamOption[];
}

export interface EdgeParamOption {
  id: string;
  paramDefId: string;
  valueSlug: string;
  label: string;
  color?: string | null;
  sortOrder: number;
}

/**
 * drivesArrow: boolean param — controls arrowhead visibility
 * drivesStyle: select param — controls RF edge path (default/straight/step/smoothstep)
 * drivesColor: select_color param — controls stroke color
 * drivesWidth: number param (1-10) — controls stroke width
 */
export interface EdgeParamDef {
  id: string;
  presetId: string;
  displayName: string;
  paramType: string;
  defaultValue?: string | null;
  drivesArrow: boolean;
  drivesStyle: boolean;
  drivesColor: boolean;
  drivesWidth: boolean;
  sortOrder: number;
  options: EdgeParamOption[];
}

export interface GraphSettings {
  activePresetId: string;
  presets: Preset[];
  paramDefs: NodeParamDef[];
  edgeParamDefs: EdgeParamDef[];
}

export interface GraphExportSettings {
  presetName: string;
  paramDefs: NodeParamDef[];
  edgeParamDefs: EdgeParamDef[];
}

export interface GraphExport {
  version: number;
  exportedAt: string;
  settings: GraphExportSettings;
  nodes: GloNode[];
  edges: GloEdge[];
  regions: GloRegion[];
  /** JSON-stringified CanvasBookmark[] (or null) — round-trips with the file (v5+). */
  bookmarks?: string | null;
  /** Free-text graph notes (or null) — round-trips with the file (v5+). */
  graphNotes?: string | null;
}

// ── Input types ───────────────────────────────────────────────────────────────

// ── Tabs ──────────────────────────────────────────────────────────────────────

export interface ProjectTab {
  id: string;
  name: string;
  savePath: string | null;
  order: number;
  isActive: boolean;
  /** Has edits not yet written to the linked .glograph file. */
  dirty: boolean;
}

export interface CreatePresetInput { name: string }
export interface DuplicatePresetInput { id: string; newName: string }
export interface RenamePresetInput { id: string; name: string }

export interface CreateNodeParamDefInput {
  presetId: string;
  displayName: string;
  paramType: string;
  defaultValue?: string | null;
  drivesColor: boolean;
  showOnCardDefault: boolean;
}
export interface UpdateNodeParamDefInput {
  id: string;
  displayName: string;
  paramType: string;
  defaultValue?: string | null;
  showOnCardDefault: boolean;
}

export interface CreateNodeParamOptionInput {
  paramDefId: string;
  label: string;
  color?: string | null;
}
export interface UpdateNodeParamOptionInput {
  id: string;
  label: string;
  color?: string | null;
}

export interface CreateEdgeParamDefInput {
  presetId: string;
  displayName: string;
  paramType: string;
  defaultValue?: string | null;
  drivesArrow: boolean;
  drivesStyle: boolean;
  drivesColor: boolean;
  drivesWidth: boolean;
}
export interface UpdateEdgeParamDefInput {
  id: string;
  displayName: string;
  paramType: string;
  defaultValue?: string | null;
}

export interface CreateEdgeParamOptionInput {
  paramDefId: string;
  label: string;
  color?: string | null;
}
export interface UpdateEdgeParamOptionInput {
  id: string;
  label: string;
  color?: string | null;
}

// Which entity (if any) the right-hand detail panel is editing/creating. Owned by
// AppInner, but shared here so the extracted action-hooks (region/edge/node) can
// type their `setPanel` dependency. See hooks/useRegionActions etc.
export type PanelState =
  | { kind: 'none' }
  | { kind: 'createNode'; pos: { x: number; y: number } }
  | { kind: 'editNode'; node: GloNode }
  | { kind: 'editEdge'; edge: GloEdge }
  | { kind: 'createRegion'; pos: { x: number; y: number } }
  | { kind: 'editRegion'; region: GloRegion };
