use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

pub fn default_true() -> bool { true }
fn default_empty_vec<T>() -> Vec<T> { vec![] }
/// Default node variant. See specs/GRAPH_ITEMS_DESIGN.md — legacy nodes/files
/// (and API/desktop callers that omit it) are plain `standard` nodes.
pub fn default_kind() -> String { "standard".to_string() }

// ── Node ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GloNode {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub event_date: Option<String>,
    pub date_added: String,
    pub x: f64,
    pub y: f64,
    pub color: Option<String>,
    pub confidence: Option<i64>,
    pub impact_magnitude: Option<i64>,
    #[serde(default)]
    pub external_id: Option<String>,
    #[serde(default = "default_empty_vec")]
    pub tags: Vec<String>,
    #[serde(default)]
    pub data_source: Option<JsonValue>,
    pub links: Vec<NodeLink>,
    #[serde(default)]
    pub media: Vec<NodeMedia>,
    pub param_values: Vec<NodeParamValue>,
    // Persisted view-state (defaults false on legacy files / API-created nodes).
    #[serde(default)]
    pub is_pinned: bool,
    #[serde(default)]
    pub is_expand_pinned: bool,
    // Manual front/back stacking order (higher = front). Default 0.
    #[serde(default)]
    pub z_order: i64,
    // Graph-item variant: standard | note | image | video | audio.
    #[serde(default = "default_kind")]
    pub kind: String,
    // Optional per-node canvas size for resizable items (None = default size).
    #[serde(default)]
    pub width: Option<f64>,
    #[serde(default)]
    pub height: Option<f64>,
    // Notes: render the body as markdown (true) or show it as raw plain text
    // (false). Default on; only meaningful for kind == "note".
    #[serde(default = "default_true")]
    pub render_markdown: bool,
    // File nodes: show the first-page/thumbnail preview (true) or just a file icon
    // (false). Default on; only meaningful for kind == "file".
    #[serde(default = "default_true")]
    pub show_thumbnail: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NodeMedia {
    pub id: String,
    pub node_id: String,
    pub label: String,
    pub src: String,
    pub src_type: String,
    pub media_type: String,
    pub sort_order: i64,
    pub show_on_card: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddMediaInput {
    // Optional in the request body: the HTTP route `POST /api/nodes/{id}/media`
    // takes the node id from the path (authoritative), so callers needn't repeat
    // it — matching API_SPEC. The Tauri command always supplies it from the UI.
    #[serde(default)]
    pub node_id: String,
    pub label: String,
    pub src: String,
    pub src_type: String,
    pub media_type: String,
    #[serde(default = "crate::models::default_true")]
    pub show_on_card: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NodeLink {
    pub id: String,
    pub node_id: String,
    pub url: String,
    pub label: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNodeInput {
    pub title: String,
    pub description: Option<String>,
    pub event_date: Option<String>,
    pub x: f64,
    pub y: f64,
    pub color: Option<String>,
    pub confidence: Option<i64>,
    pub impact_magnitude: Option<i64>,
    #[serde(default = "default_empty_vec")]
    pub param_values: Vec<NodeParamValueInput>,
    #[serde(default)]
    pub external_id: Option<String>,
    #[serde(default = "default_empty_vec")]
    pub tags: Vec<String>,
    #[serde(default)]
    pub data_source: Option<JsonValue>,
    #[serde(default = "default_kind")]
    pub kind: String,
    // Optional at create time so a script can make a styled/sized node in one call
    // (parity with PATCH). Omitted → DB defaults: NULL size, toggles on.
    #[serde(default)]
    pub width: Option<f64>,
    #[serde(default)]
    pub height: Option<f64>,
    #[serde(default = "default_true")]
    pub render_markdown: bool,
    #[serde(default = "default_true")]
    pub show_thumbnail: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNodeInput {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub event_date: Option<String>,
    pub x: f64,
    pub y: f64,
    pub color: Option<String>,
    pub confidence: Option<i64>,
    pub impact_magnitude: Option<i64>,
    #[serde(default = "default_empty_vec")]
    pub param_values: Vec<NodeParamValueInput>,
    #[serde(default = "default_empty_vec")]
    pub tags: Vec<String>,
    // Note: external_id / data_source are intentionally absent — they are
    // managed solely via the HTTP API's PatchNodeBody, never the desktop edit.
}

// ── HTTP API patch bodies ─────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchNodeBody {
    pub title: Option<String>,
    pub description: Option<String>,
    pub event_date: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub color: Option<String>,
    pub confidence: Option<i64>,
    pub impact_magnitude: Option<i64>,
    pub param_values: Option<Vec<NodeParamValueInput>>,
    pub external_id: Option<String>,
    pub tags: Option<Vec<String>>,
    pub data_source: Option<JsonValue>,
    // Graph-item variant + resizable item size (image/video/note). Omitted →
    // left unchanged; see GRAPH_ITEMS_DESIGN.md.
    pub kind: Option<String>,
    pub width: Option<f64>,
    pub height: Option<f64>,
    // Note markdown styling toggle (Live Share guests / scripts).
    pub render_markdown: Option<bool>,
    // File-node thumbnail/icon toggle (Live Share guests / scripts).
    pub show_thumbnail: Option<bool>,
    // Persisted element state (Live Share guests toggle pin / expand-pin / z-order).
    pub is_pinned: Option<bool>,
    pub is_expand_pinned: Option<bool>,
    pub z_order: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchEdgeBody {
    pub param_values: Option<Vec<EdgeParamValueInput>>,
    pub external_id: Option<String>,
    pub label: Option<String>,
    pub color: Option<String>,
    // Reconnect: when `source_id`/`target_id` is present the matching endpoint
    // (and its handle) is rewritten. Used by Live Share guests dragging an edge end.
    pub source_id: Option<String>,
    pub target_id: Option<String>,
    pub source_handle: Option<String>,
    pub target_handle: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchRegionBody {
    pub title: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub color: Option<String>,
    // Persisted view-state toggles (Live Share guests lock/minimize a region).
    pub is_locked: Option<bool>,
    pub is_minimized: Option<bool>,
    pub z_order: Option<i64>,
}

// ── Edge ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WaypointPoint {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GloEdge {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub source_handle: Option<String>,
    pub target_handle: Option<String>,
    pub param_values: Vec<EdgeParamValue>,
    #[serde(default)]
    pub waypoints: Option<Vec<WaypointPoint>>,
    #[serde(default)]
    pub external_id: Option<String>,
    #[serde(default)]
    pub label: Option<String>,
    #[serde(default)]
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEdgeWaypointsInput {
    pub id: String,
    pub waypoints: Option<Vec<WaypointPoint>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEdgeInput {
    pub source_id: String,
    pub target_id: String,
    pub source_handle: Option<String>,
    pub target_handle: Option<String>,
    #[serde(default = "default_empty_vec")]
    pub param_values: Vec<EdgeParamValueInput>,
    #[serde(default)]
    pub external_id: Option<String>,
    #[serde(default)]
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEdgeInput {
    pub id: String,
    #[serde(default = "default_empty_vec")]
    pub param_values: Vec<EdgeParamValueInput>,
    #[serde(default)]
    pub label: Option<String>,
    #[serde(default)]
    pub color: Option<String>,
}

// ── Edge params ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EdgeParamValue {
    pub id: String,
    pub edge_id: String,
    pub param_def_id: String,
    pub value: Option<String>,
    pub is_enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EdgeParamValueInput {
    pub param_def_id: String,
    pub value: Option<String>,
    pub is_enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EdgeParamOption {
    pub id: String,
    pub param_def_id: String,
    pub value_slug: String,
    pub label: String,
    pub color: Option<String>,
    pub sort_order: i64,
}

/// drives_arrow: boolean param → arrowhead visibility
/// drives_style: select param → RF edge path type (default/straight/step/smoothstep)
/// drives_color: select_color param → stroke color
/// drives_width: number param (1-10) → stroke width
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EdgeParamDef {
    pub id: String,
    pub preset_id: String,
    pub display_name: String,
    pub param_type: String,
    pub default_value: Option<String>,
    pub drives_arrow: bool,
    pub drives_style: bool,
    pub drives_color: bool,
    pub drives_width: bool,
    pub sort_order: i64,
    pub options: Vec<EdgeParamOption>,
}

// ── Links / Positions ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddLinkInput {
    pub node_id: String,
    pub url: String,
    pub label: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodePosition {
    pub id: String,
    pub x: f64,
    pub y: f64,
}

// ── Node param values ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NodeParamValue {
    pub id: String,
    pub node_id: String,
    pub param_def_id: String,
    pub value: Option<String>,
    pub is_enabled: bool,
    pub show_on_card: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeParamValueInput {
    pub param_def_id: String,
    pub value: Option<String>,
    pub is_enabled: bool,
    pub show_on_card: bool,
}

// ── Settings ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub is_builtin: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NodeParamOption {
    pub id: String,
    pub param_def_id: String,
    pub value_slug: String,
    pub label: String,
    pub color: Option<String>,
    pub sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NodeParamDef {
    pub id: String,
    pub preset_id: String,
    pub display_name: String,
    pub param_type: String,
    pub default_value: Option<String>,
    pub drives_color: bool,
    pub show_on_card_default: bool,
    pub sort_order: i64,
    pub options: Vec<NodeParamOption>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphSettings {
    pub active_preset_id: String,
    pub presets: Vec<Preset>,
    pub param_defs: Vec<NodeParamDef>,
    pub edge_param_defs: Vec<EdgeParamDef>,
}

// ── Region ────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GloRegion {
    pub id: String,
    pub title: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub color: Option<String>,
    #[serde(default)]
    pub z_order: i64,
    // Persisted view-state (defaults false on legacy files).
    #[serde(default)]
    pub is_locked: bool,
    #[serde(default)]
    pub is_minimized: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateRegionInput {
    pub title: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateRegionInput {
    pub id: String,
    pub title: String,
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub color: Option<String>,
}

// ── Graph export/import ───────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphExportSettings {
    pub preset_name: String,
    pub param_defs: Vec<NodeParamDef>,
    pub edge_param_defs: Vec<EdgeParamDef>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphExport {
    pub version: u32,
    pub exported_at: String,
    pub settings: GraphExportSettings,
    pub nodes: Vec<GloNode>,
    pub edges: Vec<GloEdge>,
    #[serde(default)]
    pub regions: Vec<GloRegion>,
    // Project-level state that previously lived only in the per-tab DB and so
    // didn't travel with a shared .glograph file.
    #[serde(default)]
    pub bookmarks: Option<String>,
    #[serde(default)]
    pub graph_notes: Option<String>,
}

// ── Settings inputs ───────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePresetInput { pub name: String }

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DuplicatePresetInput { pub id: String, pub new_name: String }

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenamePresetInput { pub id: String, pub name: String }

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNodeParamDefInput {
    pub preset_id: String,
    pub display_name: String,
    pub param_type: String,
    pub default_value: Option<String>,
    pub drives_color: bool,
    pub show_on_card_default: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNodeParamDefInput {
    pub id: String,
    pub display_name: String,
    pub param_type: String,
    pub default_value: Option<String>,
    pub show_on_card_default: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNodeParamOptionInput {
    pub param_def_id: String,
    pub label: String,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNodeParamOptionInput {
    pub id: String,
    pub label: String,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEdgeParamDefInput {
    pub preset_id: String,
    pub display_name: String,
    pub param_type: String,
    pub default_value: Option<String>,
    pub drives_arrow: bool,
    pub drives_style: bool,
    pub drives_color: bool,
    pub drives_width: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEdgeParamDefInput {
    pub id: String,
    pub display_name: String,
    pub param_type: String,
    pub default_value: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEdgeParamOptionInput {
    pub param_def_id: String,
    pub label: String,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEdgeParamOptionInput {
    pub id: String,
    pub label: String,
    pub color: Option<String>,
}
