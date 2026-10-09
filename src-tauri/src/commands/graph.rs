use crate::commands::edges::list_all_edges;
use crate::commands::nodes::{data_source_to_json, list_all_nodes, tags_to_json};
use crate::commands::regions::list_all_regions;
use crate::commands::settings::load_settings;
use crate::models::*;
use crate::PmState;
use rusqlite::params;
use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

pub(crate) fn build_export(conn: &rusqlite::Connection) -> Result<GraphExport, String> {
    let gs = load_settings(conn).map_err(|e| e.to_string())?;
    let preset_name = gs.presets.iter()
        .find(|p| p.id == gs.active_preset_id)
        .map(|p| p.name.clone())
        .unwrap_or_else(|| "Unnamed".to_string());

    // Reuse the shared list helpers (batched reads) rather than re-implementing
    // the SELECT-id-then-fetch-per-id loop three times.
    let nodes = list_all_nodes(conn)?;
    let edges = list_all_edges(conn)?;
    let regions = list_all_regions(conn)?;

    // Project-level state that lives in app_settings — carried in the file so it
    // survives sharing, not just locally.
    let read_setting = |key: &str| -> Option<String> {
        conn.query_row(
            "SELECT value FROM app_settings WHERE key=?1",
            params![key],
            |row| row.get::<_, String>(0),
        ).ok()
    };

    Ok(GraphExport {
        version: 10,
        exported_at: Utc::now().to_rfc3339(),
        settings: GraphExportSettings {
            preset_name,
            param_defs: gs.param_defs,
            edge_param_defs: gs.edge_param_defs,
        },
        nodes,
        edges,
        regions,
        bookmarks: read_setting("canvas_bookmarks"),
        graph_notes: read_setting("graph_notes"),
    })
}

/// Stable content fingerprint of a project, used for dirty-tracking. A tab is
/// "dirty" iff this differs from the fingerprint captured at the last save / open
/// / create (its clean baseline) — so undoing edits back to the saved state
/// clears the unsaved marker, instead of "any edit happened" sticking forever.
///
/// It hashes a *normalized* projection of the export, not the raw bytes, so that:
///   - the wall-clock `exportedAt` never perturbs it,
///   - undo that regenerates child-row UUIDs (param values / links / media re-
///     inserted by `restore_node`/`restore_edge`) still matches the pre-edit
///     state — those volatile ids are dropped from the hash,
///   - DB row order can't perturb it (collections are sorted by content).
pub(crate) fn compute_fingerprint(conn: &rusqlite::Connection) -> Result<u64, String> {
    Ok(fingerprint_of_export(&build_export(conn)?))
}

/// Fingerprint an already-built export (lets `save_graph_to_path` reuse the export
/// it just wrote instead of re-reading the DB).
pub(crate) fn fingerprint_of_export(export: &GraphExport) -> u64 {
    let mut v = serde_json::to_value(export).unwrap_or(serde_json::Value::Null);
    normalize_for_fingerprint(&mut v);
    // serde_json's default `Value` map is key-sorted, so this serialization is
    // deterministic; we only sort the arrays ourselves (below).
    let canonical = serde_json::to_string(&v).unwrap_or_default();
    let mut h = DefaultHasher::new();
    canonical.hash(&mut h);
    h.finish()
}

/// Strip volatile fields and impose a stable order so the fingerprint reflects
/// user-meaningful content only. See `compute_fingerprint`.
fn normalize_for_fingerprint(v: &mut serde_json::Value) {
    use serde_json::Value;
    let obj = match v.as_object_mut() { Some(o) => o, None => return };
    obj.remove("exportedAt"); // changes on every build_export; not content
    for key in ["nodes", "edges", "regions"] {
        if let Some(Value::Array(arr)) = obj.get_mut(key) {
            for item in arr.iter_mut() {
                if let Some(io) = item.as_object_mut() {
                    // Top-level node/edge/region ids are preserved across undo, so
                    // keep them; only the child rows get fresh UUIDs on restore.
                    for child in ["paramValues", "links", "media"] {
                        if let Some(Value::Array(carr)) = io.get_mut(child) {
                            for c in carr.iter_mut() {
                                if let Some(co) = c.as_object_mut() {
                                    co.remove("id");
                                    co.remove("nodeId");
                                    co.remove("edgeId");
                                }
                            }
                            sort_value_array(carr);
                        }
                    }
                }
            }
            sort_value_array(arr);
        }
    }
}

/// Deterministic, content-based array order (by each element's serialized form).
fn sort_value_array(arr: &mut [serde_json::Value]) {
    arr.sort_by(|a, b| a.to_string().cmp(&b.to_string()));
}

pub(crate) fn do_import(conn: &rusqlite::Connection, export: GraphExport) -> Result<(), String> {
    if export.version < 3 || export.version > 10 {
        return Err(format!("Unsupported file version: {}. Expected version 3–10.", export.version));
    }

    let now = Utc::now().to_rfc3339();

    // Import is destructive — it deletes everything before re-inserting. Wrap the
    // whole rebuild in a transaction so a mid-import failure rolls back to the
    // prior state instead of leaving the project half-deleted.
    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let import_result: Result<(), String> = (|| {
    conn.execute("DELETE FROM edges", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM nodes", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM regions", []).map_err(|e| e.to_string())?;

    let mut param_def_id_map: HashMap<String, String> = HashMap::new();
    let mut edge_param_def_id_map: HashMap<String, String> = HashMap::new();

    let existing_builtin_id: Option<String> = conn.query_row(
        "SELECT id FROM presets WHERE is_builtin=1 AND name=?1",
        params![export.settings.preset_name],
        |row| row.get(0),
    ).ok();

    if let Some(builtin_id) = existing_builtin_id {
        {
            let mut stmt = conn.prepare(
                "SELECT id, display_name FROM node_param_defs WHERE preset_id=?1"
            ).map_err(|e| e.to_string())?;
            let rows: Vec<(String, String)> = stmt
                .query_map(params![builtin_id], |row| Ok((row.get(0)?, row.get(1)?)))
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();
            for (db_id, display_name) in rows {
                if let Some(def) = export.settings.param_defs.iter().find(|d| d.display_name == display_name) {
                    param_def_id_map.insert(def.id.clone(), db_id);
                }
            }
        }
        {
            let mut stmt = conn.prepare(
                "SELECT id, display_name FROM edge_param_defs WHERE preset_id=?1"
            ).map_err(|e| e.to_string())?;
            let rows: Vec<(String, String)> = stmt
                .query_map(params![builtin_id], |row| Ok((row.get(0)?, row.get(1)?)))
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();
            for (db_id, display_name) in rows {
                if let Some(def) = export.settings.edge_param_defs.iter().find(|d| d.display_name == display_name) {
                    edge_param_def_id_map.insert(def.id.clone(), db_id);
                }
            }
        }
        conn.execute(
            "UPDATE app_settings SET value=?1 WHERE key='active_preset_id'",
            params![builtin_id],
        ).map_err(|e| e.to_string())?;
    } else {
        let preset_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO presets (id, name, is_builtin, created_at) VALUES (?1, ?2, 0, ?3)",
            params![preset_id, export.settings.preset_name, now],
        ).map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE app_settings SET value=?1 WHERE key='active_preset_id'",
            params![preset_id],
        ).map_err(|e| e.to_string())?;

        for def in &export.settings.param_defs {
            let new_def_id = Uuid::new_v4().to_string();
            param_def_id_map.insert(def.id.clone(), new_def_id.clone());
            conn.execute(
                "INSERT INTO node_param_defs
                 (id, preset_id, display_name, param_type, default_value, drives_color, show_on_card_default, sort_order)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![new_def_id, preset_id, def.display_name, def.param_type,
                        def.default_value, def.drives_color as i64, def.show_on_card_default as i64, def.sort_order],
            ).map_err(|e| e.to_string())?;

            for opt in &def.options {
                let new_opt_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO node_param_options
                     (id, param_def_id, value_slug, label, color, sort_order)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![new_opt_id, new_def_id, opt.value_slug, opt.label, opt.color, opt.sort_order],
                ).map_err(|e| e.to_string())?;
            }
        }

        for def in &export.settings.edge_param_defs {
            let new_def_id = Uuid::new_v4().to_string();
            edge_param_def_id_map.insert(def.id.clone(), new_def_id.clone());
            conn.execute(
                "INSERT INTO edge_param_defs
                 (id, preset_id, display_name, param_type, default_value,
                  drives_arrow, drives_style, drives_color, drives_width, sort_order)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                params![
                    new_def_id, preset_id, def.display_name, def.param_type, def.default_value,
                    def.drives_arrow as i64, def.drives_style as i64,
                    def.drives_color as i64, def.drives_width as i64, def.sort_order
                ],
            ).map_err(|e| e.to_string())?;

            for opt in &def.options {
                let new_opt_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO edge_param_options
                     (id, param_def_id, value_slug, label, color, sort_order)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![new_opt_id, new_def_id, opt.value_slug, opt.label, opt.color, opt.sort_order],
                ).map_err(|e| e.to_string())?;
            }
        }
    }

    for node in &export.nodes {
        let tags_json = tags_to_json(&node.tags);
        let data_source_json = data_source_to_json(node.data_source.as_ref());
        conn.execute(
            "INSERT INTO nodes
             (id, title, description, event_date, date_added, x, y, color,
              confidence, impact_magnitude, external_id, tags, data_source,
              is_pinned, is_expand_pinned, z_order, kind, width, height, render_markdown, show_thumbnail)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)",
            params![
                node.id, node.title, node.description,
                node.event_date, node.date_added, node.x, node.y, node.color,
                node.confidence, node.impact_magnitude,
                node.external_id, tags_json, data_source_json,
                node.is_pinned as i64, node.is_expand_pinned as i64, node.z_order, node.kind,
                node.width, node.height, node.render_markdown as i64, node.show_thumbnail as i64
            ],
        ).map_err(|e| e.to_string())?;

        for link in &node.links {
            conn.execute(
                "INSERT INTO node_links (id, node_id, url, label) VALUES (?1, ?2, ?3, ?4)",
                params![link.id, node.id, link.url, link.label],
            ).map_err(|e| e.to_string())?;
        }

        for pv in &node.param_values {
            if let Some(new_def_id) = param_def_id_map.get(&pv.param_def_id) {
                let pv_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO node_param_values (id, node_id, param_def_id, value, is_enabled, show_on_card)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![pv_id, node.id, new_def_id, pv.value, pv.is_enabled as i64, pv.show_on_card as i64],
                ).map_err(|e| e.to_string())?;
            }
        }

        for media in &node.media {
            conn.execute(
                "INSERT INTO node_media (id, node_id, label, src, src_type, media_type, sort_order, show_on_card)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![media.id, node.id, media.label, media.src,
                        media.src_type, media.media_type, media.sort_order, media.show_on_card as i64],
            ).map_err(|e| e.to_string())?;
        }
    }

    for edge in &export.edges {
        let waypoints_json = edge.waypoints.as_ref().and_then(|w| serde_json::to_string(w).ok());
        conn.execute(
            "INSERT INTO edges (id, source_id, target_id, source_handle, target_handle, external_id, label, color, waypoints, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![edge.id, edge.source_id, edge.target_id,
                    edge.source_handle, edge.target_handle, edge.external_id, edge.label, edge.color, waypoints_json, now],
        ).map_err(|e| e.to_string())?;

        for pv in &edge.param_values {
            if let Some(new_def_id) = edge_param_def_id_map.get(&pv.param_def_id) {
                let pv_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![pv_id, edge.id, new_def_id, pv.value, pv.is_enabled as i64],
                ).map_err(|e| e.to_string())?;
            }
        }
    }

    for region in &export.regions {
        conn.execute(
            "INSERT INTO regions (id, title, x, y, width, height, color, z_order, is_locked, is_minimized, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![region.id, region.title, region.x, region.y,
                    region.width, region.height, region.color, region.z_order,
                    region.is_locked as i64, region.is_minimized as i64, now],
        ).map_err(|e| e.to_string())?;
    }

    // Restore project-level state. Absent on legacy files (v3/v4) → leave the
    // existing per-tab values untouched rather than clobbering them with NULL.
    if let Some(bookmarks) = &export.bookmarks {
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('canvas_bookmarks', ?1)",
            params![bookmarks],
        ).map_err(|e| e.to_string())?;
    }
    if let Some(notes) = &export.graph_notes {
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('graph_notes', ?1)",
            params![notes],
        ).map_err(|e| e.to_string())?;
    }

    Ok(())
    })();

    match import_result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string()),
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); Err(e) }
    }
}

// ── Tauri commands ────────────────────────────────────────────────────────────

#[tauri::command]
pub fn new_graph(state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    // Clear the whole graph in one transaction (cascades clean links/media/params),
    // so a failure mid-clear can't leave the project half-deleted.
    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let r = (|| -> rusqlite::Result<()> {
        conn.execute("DELETE FROM edges", [])?;
        conn.execute("DELETE FROM nodes", [])?;
        conn.execute("DELETE FROM regions", [])?;
        Ok(())
    })();
    match r {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string()),
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); Err(e.to_string()) }
    }
}

#[tauri::command]
pub fn save_graph_to_path(path: String, state: State<PmState>) -> Result<String, String> {
    let dest = std::path::Path::new(&path);

    if let Some(parent) = dest.parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    // Build the export under the lock, then release it before the file I/O (don't
    // hold the DB mutex across disk writes — matches the rest of the codebase).
    let (active_id, export) = {
        let pm = state.lock().map_err(|e| e.to_string())?;
        (pm.active_tab_id.clone(), build_export(pm.active_conn()?)?)
    };

    let json = serde_json::to_string_pretty(&export).map_err(|e| e.to_string())?;
    std::fs::write(dest, &json).map_err(|e| e.to_string())?;

    // The on-disk file now equals the project: capture it as the new clean
    // baseline and clear dirty (keyed on the tab we exported, not "active", in case
    // the active tab changed during the write). This keeps the backend the dirty
    // authority and seeds the fingerprint for future undo-to-clean rechecks; the
    // frontend also clears the dot via markTabClean.
    let fp = fingerprint_of_export(&export);
    if let Ok(mut pm) = state.lock() {
        if let Some(entry) = pm.tabs.get_mut(&active_id) {
            entry.saved_fingerprint = Some(fp);
            entry.dirty = false;
        }
    }

    Ok(path)
}

/// Write arbitrary text to a user-chosen path (CSV / Mermaid / DOT exports).
#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

/// Write raw bytes to a user-chosen path (PNG export). The frontend decodes the
/// canvas data-URL to bytes and passes them here.
#[tauri::command]
pub fn write_binary_file(path: String, bytes: Vec<u8>) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    std::fs::write(&path, bytes).map_err(|e| e.to_string())
}

/// Read a local file's bytes — used by a Live Share **guest** to upload a media
/// file it picked (via the file dialog) to the host over the session. The guest
/// chose the path itself; this just returns its contents to the frontend.
#[tauri::command]
pub fn read_local_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

/// Read the first `max_bytes` of a local file as (lossy) UTF-8 text — used by a
/// file node to preview text/markdown/code without loading a whole large file.
#[tauri::command]
pub fn read_text_file_head(path: String, max_bytes: usize) -> Result<String, String> {
    use std::io::Read;
    let mut file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let cap = max_bytes.min(1_000_000); // hard ceiling so a bad arg can't OOM
    let mut buf = vec![0u8; cap];
    let n = file.read(&mut buf).map_err(|e| e.to_string())?;
    buf.truncate(n);
    Ok(String::from_utf8_lossy(&buf).to_string())
}

/// Best-effort thumbnail for an Office file (.docx/.pptx/.xlsx). These are ZIP
/// archives that *may* embed `docProps/thumbnail.<ext>` (present only if the file
/// was saved with a thumbnail). Returns the image bytes for renderable formats
/// (jpeg/png) or `None` (caller falls back to a file icon) — EMF/WMF thumbnails
/// aren't browser-renderable, so they're treated as absent.
#[tauri::command]
pub fn extract_office_thumbnail(path: String) -> Result<Option<Vec<u8>>, String> {
    use std::io::Read;
    let file = match std::fs::File::open(&path) {
        Ok(f) => f,
        Err(_) => return Ok(None),
    };
    let mut archive = match zip::ZipArchive::new(file) {
        Ok(a) => a,
        Err(_) => return Ok(None), // not a zip → not an Office file
    };
    for name in ["docProps/thumbnail.jpeg", "docProps/thumbnail.jpg", "docProps/thumbnail.png"] {
        if let Ok(mut entry) = archive.by_name(name) {
            let mut buf = Vec::new();
            if entry.read_to_end(&mut buf).is_ok() && !buf.is_empty() {
                return Ok(Some(buf));
            }
        }
    }
    Ok(None)
}

/// Impact trace over the active project's directed edges — the local (in-process)
/// twin of the HTTP `GET /api/trace`. Both defer to the same pure engine in
/// `crate::core::trace`, so the canvas overlay and external/agent callers can't
/// disagree. `direction` is `"downstream"` or `"upstream"`.
#[tauri::command]
pub fn trace(
    seed_id: String,
    direction: String,
    state: State<PmState>,
) -> Result<crate::core::trace::TraceResult, String> {
    use crate::core::trace::{compute_trace, TraceDirection, TraceEdge};
    use rusqlite::OptionalExtension;

    let dir = match direction.as_str() {
        "downstream" => TraceDirection::Downstream,
        "upstream" => TraceDirection::Upstream,
        _ => return Err("direction must be 'downstream' or 'upstream'".to_string()),
    };
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let exists: Option<i64> = conn
        .query_row("SELECT 1 FROM nodes WHERE id = ?1", params![seed_id], |r| r.get(0))
        .optional()
        .map_err(|e| e.to_string())?;
    if exists.is_none() {
        return Err(format!("Node '{}' not found", seed_id));
    }
    let edges = list_all_edges(conn)?;
    let te: Vec<TraceEdge> = edges
        .iter()
        .map(|e| TraceEdge {
            id: e.id.clone(),
            source_id: e.source_id.clone(),
            target_id: e.target_id.clone(),
        })
        .collect();
    let result = compute_trace(&seed_id, &te, dir);
    if std::env::var("GLOGRAPH_DEBUG").is_ok() {
        eprintln!(
            "[trace] seed={} dir={} reached={} maxHop={}",
            seed_id, direction, result.reached_count, result.max_hop
        );
    }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;
    use rusqlite::Connection;

    fn fixture_export() -> GraphExport {
        let now = "2026-05-30T00:00:00Z".to_string();
        let node_a = GloNode {
            id: "node-a".into(),
            title: "Source".into(),
            description: None,
            event_date: None,
            date_added: now.clone(),
            x: 0.0,
            y: 0.0,
            color: None,
            confidence: None,
            impact_magnitude: None,
            external_id: None,
            tags: vec![],
            data_source: None,
            links: vec![],
            media: vec![NodeMedia {
                id: "media-1".into(),
                node_id: "node-a".into(),
                label: "hidden pic".into(),
                src: "C:/x.png".into(),
                src_type: "file".into(),
                media_type: "image".into(),
                sort_order: 0,
                // The bug: this used to come back `true` after import.
                show_on_card: false,
            }],
            param_values: vec![],
            is_pinned: true,
            is_expand_pinned: false,
            z_order: 0,
            // A non-default variant — must survive the import round-trip.
            kind: "note".into(),
            width: None,
            height: None,
            // Non-default (styling off) — must survive the round-trip too.
            render_markdown: false,
            // Non-default (thumbnail off) — must survive the round-trip too.
            show_thumbnail: false,
        };
        let node_b = GloNode {
            id: "node-b".into(),
            title: "Target".into(),
            description: None,
            event_date: None,
            date_added: now.clone(),
            x: 300.0,
            y: 0.0,
            color: None,
            confidence: None,
            impact_magnitude: None,
            external_id: None,
            tags: vec![],
            data_source: None,
            links: vec![],
            media: vec![],
            param_values: vec![],
            is_pinned: false,
            is_expand_pinned: false,
            z_order: 0,
            kind: "standard".into(),
            width: None,
            height: None,
            render_markdown: true,
            show_thumbnail: true,
        };
        let edge = GloEdge {
            id: "edge-1".into(),
            source_id: "node-a".into(),
            target_id: "node-b".into(),
            source_handle: Some("right".into()),
            target_handle: Some("left".into()),
            param_values: vec![],
            // The bugs: label and waypoints used to be dropped on import.
            waypoints: Some(vec![WaypointPoint { x: 10.0, y: 20.0 }, WaypointPoint { x: 30.0, y: 40.0 }]),
            external_id: None,
            label: Some("causes".into()),
            color: Some("#c83030".into()),
        };
        let region = GloRegion {
            id: "region-1".into(),
            title: "Locked".into(),
            x: 0.0,
            y: 0.0,
            width: 400.0,
            height: 300.0,
            color: None,
            z_order: 0,
            is_locked: true,
            is_minimized: false,
            created_at: now.clone(),
        };
        GraphExport {
            version: 5,
            exported_at: now,
            settings: GraphExportSettings {
                preset_name: "Macro Economics".into(),
                param_defs: vec![],
                edge_param_defs: vec![],
            },
            nodes: vec![node_a, node_b],
            edges: vec![edge],
            regions: vec![region],
            bookmarks: Some("[{\"x\":1,\"y\":2,\"zoom\":1}]".into()),
            graph_notes: Some("project notes".into()),
        }
    }

    #[test]
    fn import_preserves_media_visibility_edge_label_and_waypoints() {
        let conn = Connection::open_in_memory().expect("open db");
        db::init_db(&conn).expect("init db");

        do_import(&conn, fixture_export()).expect("import");

        // Re-export and assert the previously-dropped fields survived the round-trip.
        let exported = build_export(&conn).expect("export");

        let media = &exported
            .nodes
            .iter()
            .find(|n| n.id == "node-a")
            .expect("node-a present")
            .media;
        assert_eq!(media.len(), 1, "media row should survive import");
        assert!(!media[0].show_on_card, "show_on_card=false must survive import");

        let edge = exported
            .edges
            .iter()
            .find(|e| e.id == "edge-1")
            .expect("edge present");
        assert_eq!(edge.label.as_deref(), Some("causes"), "edge label must survive import");
        let wps = edge.waypoints.as_ref().expect("waypoints must survive import");
        assert_eq!(wps.len(), 2);
        assert_eq!((wps[0].x, wps[0].y), (10.0, 20.0));
        assert_eq!((wps[1].x, wps[1].y), (30.0, 40.0));

        // Element view-state must survive the round-trip.
        let node_a = exported.nodes.iter().find(|n| n.id == "node-a").expect("node-a");
        assert!(node_a.is_pinned, "node pin state must survive import");
        assert_eq!(node_a.kind, "note", "node kind must survive import");
        assert!(!node_a.render_markdown, "note render_markdown=false must survive import");
        assert!(!node_a.show_thumbnail, "node show_thumbnail=false must survive import");
        let node_b = exported.nodes.iter().find(|n| n.id == "node-b").expect("node-b");
        assert_eq!(node_b.kind, "standard", "default node kind must survive import");
        let region = exported.regions.iter().find(|r| r.id == "region-1").expect("region present");
        assert!(region.is_locked, "region lock state must survive import");

        // Project-level state must be restored into app_settings.
        assert_eq!(exported.graph_notes.as_deref(), Some("project notes"));
        assert_eq!(exported.bookmarks.as_deref(), Some("[{\"x\":1,\"y\":2,\"zoom\":1}]"));
    }

    // ── Dirty-tracking fingerprint ──────────────────────────────────────────

    #[test]
    fn fingerprint_ignores_timestamp_child_ids_and_order() {
        // The headline guarantee: a state that is user-meaningfully identical must
        // hash the same, even though `exportedAt` ticks, restore regenerates
        // child-row UUIDs (media/links/param-values), and DB row order can vary.
        // This is exactly what makes "delete a node, then undo" clear the dirty dot.
        let a = fixture_export();

        let mut b = fixture_export();
        b.exported_at = "2099-12-31T23:59:59Z".into();   // wall clock moved on
        b.nodes[0].media[0].id = "regenerated-uuid".into(); // restore() gives new child ids
        b.nodes.reverse();                                // different row order

        assert_eq!(
            fingerprint_of_export(&a),
            fingerprint_of_export(&b),
            "fingerprint must ignore exportedAt, child-row ids, and collection order"
        );
    }

    #[test]
    fn fingerprint_changes_on_real_content_edit() {
        let a = fixture_export();
        let mut b = fixture_export();
        b.nodes[0].title = "Renamed".into();
        assert_ne!(
            fingerprint_of_export(&a),
            fingerprint_of_export(&b),
            "a real content change must change the fingerprint"
        );

        // A moved node is a real change too (positions travel in the export).
        let mut c = fixture_export();
        c.nodes[0].x += 1.0;
        assert_ne!(fingerprint_of_export(&a), fingerprint_of_export(&c));
    }

    #[test]
    fn fingerprint_round_trips_through_the_db() {
        // compute_fingerprint(import(export)) must equal the in-memory fingerprint
        // of the same export — i.e. the baseline captured at open/save matches what
        // a later recheck computes from the DB for the unchanged graph.
        let conn = Connection::open_in_memory().expect("open db");
        db::init_db(&conn).expect("init db");
        do_import(&conn, fixture_export()).expect("import");

        let from_db = compute_fingerprint(&conn).expect("fingerprint");
        let reexported = build_export(&conn).expect("export");
        assert_eq!(from_db, fingerprint_of_export(&reexported));

        // And recomputing after a no-op re-read is stable (no spurious dirtiness).
        assert_eq!(from_db, compute_fingerprint(&conn).expect("fingerprint again"));
    }

    #[test]
    fn do_import_rolls_back_on_failure_and_preserves_existing_graph() {
        let conn = Connection::open_in_memory().expect("open db");
        db::init_db(&conn).expect("init db");

        // Seed a good graph first — this is the data a failed import must not destroy.
        do_import(&conn, fixture_export()).expect("first import");
        let before = build_export(&conn).expect("export");
        assert_eq!(before.nodes.len(), 2);
        assert_eq!(before.edges.len(), 1);
        assert_eq!(before.regions.len(), 1);

        // Craft a broken import: two nodes sharing one primary key. do_import deletes
        // everything, inserts the first node, then the second INSERT hits a UNIQUE
        // violation — failing partway through, after the deletes.
        let mut broken = fixture_export();
        let dup_id = broken.nodes[0].id.clone();
        broken.nodes[1].id = dup_id;
        let result = do_import(&conn, broken);
        assert!(result.is_err(), "duplicate-PK import must fail");

        // The prior graph must be fully intact — the transaction rolled the deletes back.
        let after = build_export(&conn).expect("export after failed import");
        assert_eq!(after.nodes.len(), 2, "rollback must preserve existing nodes");
        assert_eq!(after.edges.len(), 1, "rollback must preserve existing edges");
        assert_eq!(after.regions.len(), 1, "rollback must preserve existing regions");
    }

    #[test]
    fn do_import_with_custom_preset_creates_preset_and_remaps_param_values() {
        let conn = Connection::open_in_memory().expect("open db");
        db::init_db(&conn).expect("init db");

        // A custom (non-builtin) preset with one select param def + option, and a
        // node carrying a value for it. The file's UUIDs are arbitrary and must be
        // remapped to fresh DB ids — this exercises the `else` (new-preset) branch.
        let def = NodeParamDef {
            id: "file-def-1".into(),
            preset_id: "file-preset".into(),
            display_name: "Kind".into(),
            param_type: "select".into(),
            default_value: None,
            drives_color: false,
            show_on_card_default: false,
            sort_order: 0,
            options: vec![NodeParamOption {
                id: "file-opt-1".into(),
                param_def_id: "file-def-1".into(),
                value_slug: "stock".into(),
                label: "Stock".into(),
                color: None,
                sort_order: 0,
            }],
        };
        let node = GloNode {
            id: "n1".into(), title: "S".into(),
            description: None, event_date: None,
            date_added: "2026-05-30T00:00:00Z".into(),
            x: 0.0, y: 0.0, color: None,
            confidence: None, impact_magnitude: None,
            external_id: None, tags: vec![], data_source: None,
            links: vec![], media: vec![],
            param_values: vec![NodeParamValue {
                id: "file-pv-1".into(), node_id: "n1".into(),
                param_def_id: "file-def-1".into(), // references the file's def id
                value: Some("stock".into()), is_enabled: true, show_on_card: true,
            }],
            is_pinned: false, is_expand_pinned: false, z_order: 0,
            kind: "standard".into(),
            width: None, height: None, render_markdown: true, show_thumbnail: true,
        };
        let export = GraphExport {
            version: 5,
            exported_at: "2026-05-30T00:00:00Z".into(),
            settings: GraphExportSettings {
                preset_name: "Custom Systems".into(), // not a builtin → new-preset branch
                param_defs: vec![def],
                edge_param_defs: vec![],
            },
            nodes: vec![node],
            edges: vec![],
            regions: vec![],
            bookmarks: None,
            graph_notes: None,
        };

        do_import(&conn, export).expect("import");

        // A brand-new preset was created and activated.
        let settings = load_settings(&conn).expect("settings");
        let active = settings.presets.iter()
            .find(|p| p.id == settings.active_preset_id)
            .expect("active preset");
        assert_eq!(active.name, "Custom Systems");

        // The node's param value survived with a REMAPPED def id that resolves to
        // the new preset's "Kind" def (not the file's original id).
        let exported = build_export(&conn).expect("export");
        let n = exported.nodes.iter().find(|n| n.id == "n1").expect("node");
        assert_eq!(n.param_values.len(), 1, "param value must survive import");
        assert_eq!(n.param_values[0].value.as_deref(), Some("stock"));
        let new_def_id = &n.param_values[0].param_def_id;
        assert_ne!(new_def_id.as_str(), "file-def-1", "def id must be remapped");
        assert!(
            settings.param_defs.iter().any(|d| &d.id == new_def_id && d.display_name == "Kind"),
            "remapped def id must resolve to the imported 'Kind' def",
        );
    }
}
