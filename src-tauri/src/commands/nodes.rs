use crate::models::*;
use crate::PmState;
use rusqlite::params;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

// ── Tag / data_source serialisation helpers ───────────────────────────────────

pub(crate) fn tags_to_json(tags: &[String]) -> String {
    serde_json::to_string(tags).unwrap_or_else(|_| "[]".to_string())
}

fn json_to_tags(s: Option<String>) -> Vec<String> {
    s.and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default()
}

pub(crate) fn data_source_to_json(ds: Option<&serde_json::Value>) -> Option<String> {
    ds.map(|v| v.to_string())
}

fn json_to_data_source(s: Option<String>) -> Option<serde_json::Value> {
    s.and_then(|t| serde_json::from_str(&t).ok())
}

// ── Core fetch (used by Tauri commands and HTTP API) ─────────────────────────

pub(crate) fn fetch_node(conn: &rusqlite::Connection, id: &str) -> rusqlite::Result<GloNode> {
    let mut node = conn.query_row(
        "SELECT id, title, description, event_date, date_added, x, y, color,
                confidence, impact_magnitude, external_id, tags, data_source,
                is_pinned, is_expand_pinned, z_order, kind, width, height, render_markdown, show_thumbnail
         FROM nodes WHERE id = ?1",
        params![id],
        |row| {
            Ok(GloNode {
                id:               row.get(0)?,
                title:            row.get(1)?,
                description:      row.get(2)?,
                event_date:       row.get(3)?,
                date_added:       row.get(4)?,
                x:                row.get(5)?,
                y:                row.get(6)?,
                color:            row.get(7)?,
                confidence:       row.get(8)?,
                impact_magnitude: row.get(9)?,
                external_id:      row.get(10)?,
                tags:             json_to_tags(row.get(11)?),
                data_source:      json_to_data_source(row.get(12)?),
                links:            vec![],
                media:            vec![],
                param_values:     vec![],
                is_pinned:        row.get::<_, i64>(13)? != 0,
                is_expand_pinned: row.get::<_, i64>(14)? != 0,
                z_order:          row.get(15)?,
                kind:             row.get(16)?,
                width:            row.get(17)?,
                height:           row.get(18)?,
                render_markdown:  row.get::<_, i64>(19)? != 0,
                show_thumbnail:   row.get::<_, i64>(20)? != 0,
            })
        },
    )?;

    let mut stmt = conn.prepare(
        "SELECT id, node_id, url, label FROM node_links WHERE node_id = ?1",
    )?;
    node.links = stmt
        .query_map(params![id], |row| {
            Ok(NodeLink {
                id:      row.get(0)?,
                node_id: row.get(1)?,
                url:     row.get(2)?,
                label:   row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    let mut stmt = conn.prepare(
        "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card
         FROM node_media WHERE node_id = ?1 ORDER BY sort_order ASC",
    )?;
    node.media = stmt
        .query_map(params![id], |row| {
            Ok(NodeMedia {
                id:          row.get(0)?,
                node_id:     row.get(1)?,
                label:       row.get(2)?,
                src:         row.get(3)?,
                src_type:    row.get(4)?,
                media_type:  row.get(5)?,
                sort_order:  row.get(6)?,
                show_on_card: row.get::<_, i64>(7)? != 0,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    let mut stmt = conn.prepare(
        "SELECT id, node_id, param_def_id, value, is_enabled, show_on_card
         FROM node_param_values WHERE node_id = ?1",
    )?;
    node.param_values = stmt
        .query_map(params![id], |row| {
            Ok(NodeParamValue {
                id:           row.get(0)?,
                node_id:      row.get(1)?,
                param_def_id: row.get(2)?,
                value:        row.get(3)?,
                is_enabled:   row.get::<_, i64>(4)? != 0,
                show_on_card: row.get::<_, i64>(5)? != 0,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(node)
}

pub(crate) fn upsert_param_values(
    conn: &rusqlite::Connection,
    node_id: &str,
    param_values: &[NodeParamValueInput],
) -> rusqlite::Result<()> {
    for pv in param_values {
        let affected = conn.execute(
            "UPDATE node_param_values SET value=?3, is_enabled=?4, show_on_card=?5
             WHERE node_id=?1 AND param_def_id=?2",
            params![node_id, pv.param_def_id, pv.value, pv.is_enabled as i64, pv.show_on_card as i64],
        )?;
        if affected == 0 {
            let id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO node_param_values (id, node_id, param_def_id, value, is_enabled, show_on_card)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![id, node_id, pv.param_def_id, pv.value, pv.is_enabled as i64, pv.show_on_card as i64],
            )?;
        }
    }
    Ok(())
}

// ── List all nodes (shared by Tauri command + HTTP API) ───────────────────────

pub(crate) fn list_all_nodes(conn: &rusqlite::Connection) -> Result<Vec<GloNode>, String> {
    let mut stmt = conn.prepare(
        "SELECT id, title, description, event_date, date_added, x, y, color,
                confidence, impact_magnitude, external_id, tags, data_source,
                is_pinned, is_expand_pinned, z_order, kind, width, height, render_markdown, show_thumbnail
         FROM nodes ORDER BY date_added DESC",
    ).map_err(|e| e.to_string())?;

    let mut nodes: Vec<GloNode> = stmt
        .query_map([], |row| {
            Ok(GloNode {
                id:               row.get(0)?,
                title:            row.get(1)?,
                description:      row.get(2)?,
                event_date:       row.get(3)?,
                date_added:       row.get(4)?,
                x:                row.get(5)?,
                y:                row.get(6)?,
                color:            row.get(7)?,
                confidence:       row.get(8)?,
                impact_magnitude: row.get(9)?,
                external_id:      row.get(10)?,
                tags:             json_to_tags(row.get(11)?),
                data_source:      json_to_data_source(row.get(12)?),
                links:            vec![],
                media:            vec![],
                param_values:     vec![],
                is_pinned:        row.get::<_, i64>(13)? != 0,
                is_expand_pinned: row.get::<_, i64>(14)? != 0,
                z_order:          row.get(15)?,
                kind:             row.get(16)?,
                width:            row.get(17)?,
                height:           row.get(18)?,
                render_markdown:  row.get::<_, i64>(19)? != 0,
                show_thumbnail:   row.get::<_, i64>(20)? != 0,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    if nodes.is_empty() {
        return Ok(nodes);
    }

    let ids: Vec<String> = nodes.iter().map(|n| n.id.clone()).collect();
    let ph = std::iter::repeat_n("?", ids.len()).collect::<Vec<_>>().join(",");

    let id_to_idx: std::collections::HashMap<String, usize> =
        nodes.iter().enumerate().map(|(i, n)| (n.id.clone(), i)).collect();

    {
        let sql = format!(
            "SELECT id, node_id, url, label FROM node_links WHERE node_id IN ({})",
            ph
        );
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let links: Vec<NodeLink> = stmt
            .query_map(rusqlite::params_from_iter(ids.iter()), |row| {
                Ok(NodeLink { id: row.get(0)?, node_id: row.get(1)?, url: row.get(2)?, label: row.get(3)? })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        for link in links {
            if let Some(&i) = id_to_idx.get(&link.node_id) {
                nodes[i].links.push(link);
            }
        }
    }

    {
        let sql = format!(
            "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card \
             FROM node_media WHERE node_id IN ({}) ORDER BY sort_order ASC",
            ph
        );
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let items: Vec<NodeMedia> = stmt
            .query_map(rusqlite::params_from_iter(ids.iter()), |row| {
                Ok(NodeMedia {
                    id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
                    src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
                    sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        for item in items {
            if let Some(&i) = id_to_idx.get(item.node_id.as_str()) {
                nodes[i].media.push(item);
            }
        }
    }

    {
        let sql = format!(
            "SELECT id, node_id, param_def_id, value, is_enabled, show_on_card \
             FROM node_param_values WHERE node_id IN ({})",
            ph
        );
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let pvs: Vec<NodeParamValue> = stmt
            .query_map(rusqlite::params_from_iter(ids.iter()), |row| {
                Ok(NodeParamValue {
                    id: row.get(0)?, node_id: row.get(1)?, param_def_id: row.get(2)?,
                    value: row.get(3)?, is_enabled: row.get::<_, i64>(4)? != 0,
                    show_on_card: row.get::<_, i64>(5)? != 0,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        for pv in pvs {
            if let Some(&i) = id_to_idx.get(pv.node_id.as_str()) {
                nodes[i].param_values.push(pv);
            }
        }
    }

    Ok(nodes)
}

// ── Tauri commands ────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_all_nodes(state: State<PmState>) -> Result<Vec<GloNode>, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    list_all_nodes(pm.active_conn()?)
}

#[tauri::command]
pub fn create_node(input: CreateNodeInput, state: State<PmState>) -> Result<GloNode, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let tags_json = tags_to_json(&input.tags);
    let data_source_json = data_source_to_json(input.data_source.as_ref());

    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result = (|| -> rusqlite::Result<()> {
        conn.execute(
            "INSERT INTO nodes (id, title, description, event_date, date_added, x, y, color,
                                confidence, impact_magnitude, external_id, tags, data_source, kind,
                                width, height, render_markdown, show_thumbnail)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)",
            params![
                id, input.title, input.description,
                input.event_date, now, input.x, input.y, input.color,
                input.confidence, input.impact_magnitude,
                input.external_id, tags_json, data_source_json, input.kind,
                input.width, input.height, input.render_markdown as i64, input.show_thumbnail as i64
            ],
        )?;
        // width/height are NULL unless the caller set them; toggles default on.
        upsert_param_values(conn, &id, &input.param_values)?;
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
    }

    fetch_node(conn, &id).map_err(|e| e.to_string())
}

/// Core update logic, separated from the Tauri `State` wrapper so it can be
/// unit-tested directly against a `Connection`.
///
/// `external_id` and `data_source` are deliberately NOT updated here. They are
/// owned by the HTTP API (see `patch_node`), and the desktop UI has no fields
/// for them — writing them from this input would wipe API-set values. Wrapped
/// in a transaction so a mid-update failure can't leave the node and its param
/// values partially written (matching `create_node`).
pub(crate) fn update_node_inner(
    conn: &rusqlite::Connection,
    input: &UpdateNodeInput,
) -> Result<GloNode, String> {
    let tags_json = tags_to_json(&input.tags);

    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result = (|| -> rusqlite::Result<()> {
        conn.execute(
            "UPDATE nodes SET title=?2, description=?3, event_date=?4, x=?5, y=?6,
                              color=?7, confidence=?8, impact_magnitude=?9, tags=?10
             WHERE id=?1",
            params![
                input.id, input.title, input.description,
                input.event_date, input.x, input.y, input.color,
                input.confidence, input.impact_magnitude, tags_json
            ],
        )?;
        upsert_param_values(conn, &input.id, &input.param_values)?;
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
    }

    fetch_node(conn, &input.id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_node(input: UpdateNodeInput, state: State<PmState>) -> Result<GloNode, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    update_node_inner(pm.active_conn()?, &input)
}

/// Restore (INSERT OR REPLACE) a node and its links/media/param-values in one
/// transaction. Shared by the Tauri command and the HTTP `POST /api/nodes/restore`
/// (so a Live Share guest's Ctrl+Z of a delete restores with the original ids).
pub(crate) fn restore_node_inner(conn: &rusqlite::Connection, node: &GloNode) -> Result<GloNode, String> {
    let tags_json = tags_to_json(&node.tags);
    let data_source_json = data_source_to_json(node.data_source.as_ref());

    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result = (|| -> rusqlite::Result<()> {
        conn.execute(
            "INSERT OR REPLACE INTO nodes
             (id, title, description, event_date, date_added, x, y, color, confidence, impact_magnitude,
              external_id, tags, data_source, is_pinned, is_expand_pinned, z_order, kind, width, height,
              render_markdown, show_thumbnail)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)",
            params![
                node.id, node.title, node.description, node.event_date, node.date_added,
                node.x, node.y, node.color, node.confidence, node.impact_magnitude,
                node.external_id, tags_json, data_source_json,
                node.is_pinned as i64, node.is_expand_pinned as i64, node.z_order, node.kind,
                node.width, node.height, node.render_markdown as i64, node.show_thumbnail as i64
            ],
        )?;
        for link in &node.links {
            conn.execute(
                "INSERT OR REPLACE INTO node_links (id, node_id, url, label) VALUES (?1, ?2, ?3, ?4)",
                params![link.id, link.node_id, link.url, link.label],
            )?;
        }
        for m in &node.media {
            conn.execute(
                "INSERT OR REPLACE INTO node_media
                 (id, node_id, label, src, src_type, media_type, sort_order, show_on_card)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![m.id, m.node_id, m.label, m.src, m.src_type, m.media_type, m.sort_order, m.show_on_card as i64],
            )?;
        }
        for pv in &node.param_values {
            conn.execute(
                "INSERT OR REPLACE INTO node_param_values (id, node_id, param_def_id, value, is_enabled, show_on_card)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![pv.id, pv.node_id, pv.param_def_id, pv.value, pv.is_enabled as i64, pv.show_on_card as i64],
            )?;
        }
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
    }

    fetch_node(conn, &node.id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_node(node: GloNode, state: State<PmState>) -> Result<GloNode, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    restore_node_inner(conn, &node)
}

#[tauri::command]
pub fn delete_node(id: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM nodes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_node_positions(
    positions: Vec<NodePosition>,
    state: State<PmState>,
) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let inner = || -> rusqlite::Result<()> {
        for pos in &positions {
            conn.execute(
                "UPDATE nodes SET x=?2, y=?3 WHERE id=?1",
                params![pos.id, pos.x, pos.y],
            )?;
        }
        Ok(())
    };
    match inner() {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string()),
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); Err(e.to_string()) }
    }
}

#[tauri::command]
pub fn add_node_link(input: AddLinkInput, state: State<PmState>) -> Result<NodeLink, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO node_links (id, node_id, url, label) VALUES (?1, ?2, ?3, ?4)",
        params![id, input.node_id, input.url, input.label],
    ).map_err(|e| e.to_string())?;
    Ok(NodeLink { id, node_id: input.node_id, url: input.url, label: input.label })
}

#[tauri::command]
pub fn delete_node_link(id: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM node_links WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn add_node_media(input: AddMediaInput, state: State<PmState>) -> Result<NodeMedia, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let sort_order: i64 = conn.query_row(
        "SELECT COALESCE(MAX(sort_order), -1) + 1 FROM node_media WHERE node_id = ?1",
        params![input.node_id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO node_media (id, node_id, label, src, src_type, media_type, sort_order, show_on_card)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, input.node_id, input.label, input.src, input.src_type, input.media_type, sort_order, input.show_on_card as i64],
    ).map_err(|e| e.to_string())?;
    Ok(NodeMedia {
        id, node_id: input.node_id, label: input.label, src: input.src,
        src_type: input.src_type, media_type: input.media_type,
        sort_order, show_on_card: input.show_on_card,
    })
}

#[tauri::command]
pub fn update_node_media(
    id: String,
    label: Option<String>,
    src: String,
    src_type: String,
    state: State<PmState>,
) -> Result<NodeMedia, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE node_media SET label=?2, src=?3, src_type=?4 WHERE id=?1",
        // `label` column is NOT NULL DEFAULT ''; coalesce a missing label to ''
        // so a label-less media edit doesn't violate the constraint.
        params![id, label.unwrap_or_default(), src, src_type],
    ).map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card \
         FROM node_media WHERE id = ?1",
        params![id],
        |row| Ok(NodeMedia {
            id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
            src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
            sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
        }),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_node_media_show_on_card(id: String, show_on_card: bool, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE node_media SET show_on_card = ?2 WHERE id = ?1",
        params![id, show_on_card as i64],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_node_media_sort_order(id: String, sort_order: i64, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE node_media SET sort_order = ?2 WHERE id = ?1",
        params![id, sort_order],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_node_media(id: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM node_media WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_node_pinned(id: String, pinned: bool, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE nodes SET is_pinned=?2 WHERE id=?1",
        params![id, pinned as i64],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_node_expand_pinned(id: String, expand_pinned: bool, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE nodes SET is_expand_pinned=?2 WHERE id=?1",
        params![id, expand_pinned as i64],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_node_size(id: String, width: Option<f64>, height: Option<f64>, state: State<PmState>) -> Result<GloNode, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE nodes SET width=?2, height=?3 WHERE id=?1",
        params![id, width, height],
    ).map_err(|e| e.to_string())?;
    fetch_node(conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_node_render_markdown(id: String, render_markdown: bool, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE nodes SET render_markdown=?2 WHERE id=?1",
        params![id, render_markdown as i64],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_node_show_thumbnail(id: String, show_thumbnail: bool, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE nodes SET show_thumbnail=?2 WHERE id=?1",
        params![id, show_thumbnail as i64],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_node_z_order(id: String, z_order: i64, state: State<PmState>) -> Result<GloNode, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE nodes SET z_order=?2 WHERE id=?1",
        params![id, z_order],
    ).map_err(|e| e.to_string())?;
    fetch_node(conn, &id).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;
    use rusqlite::Connection;

    #[test]
    fn update_node_preserves_api_managed_external_id_and_data_source() {
        let conn = Connection::open_in_memory().unwrap();
        db::init_db(&conn).unwrap();

        // A node created via the HTTP API / SDK with script-set metadata.
        conn.execute(
            "INSERT INTO nodes
             (id, title, description, event_date, date_added, x, y, color,
              confidence, impact_magnitude, external_id, tags, data_source)
             VALUES ('n1','Original',NULL,NULL,'2026-05-30T00:00:00Z',0,0,NULL,NULL,NULL,
                     'ext-123','[]','{\"source\":\"sdk\"}')",
            [],
        ).unwrap();

        // A desktop edit — UpdateNodeInput has no external_id/data_source fields.
        let input = UpdateNodeInput {
            id: "n1".into(),
            title: "Renamed".into(),
            description: Some("new".into()),
            event_date: None,
            x: 50.0,
            y: 60.0,
            color: None,
            confidence: None,
            impact_magnitude: None,
            param_values: vec![],
            tags: vec!["t1".into()],
        };
        let updated = update_node_inner(&conn, &input).expect("update");

        assert_eq!(updated.title, "Renamed");
        assert_eq!(updated.x, 50.0);
        assert_eq!(updated.tags, vec!["t1".to_string()]);
        // Regression guard: a desktop edit used to wipe these API-set fields to NULL.
        assert_eq!(updated.external_id.as_deref(), Some("ext-123"));
        assert_eq!(
            updated.data_source.as_ref().map(|v| v.to_string()),
            Some("{\"source\":\"sdk\"}".to_string()),
        );
    }

    #[test]
    fn upsert_param_values_updates_in_place_instead_of_duplicating() {
        let conn = Connection::open_in_memory().unwrap();
        db::init_db(&conn).unwrap();

        conn.execute(
            "INSERT INTO nodes (id, title, date_added, x, y)
             VALUES ('n1','T','2026-05-30T00:00:00Z',0,0)",
            [],
        ).unwrap();
        // A param def for the value's FK (preset_id → the seeded active preset).
        conn.execute(
            "INSERT INTO node_param_defs (id, preset_id, display_name, param_type)
             VALUES ('d1', (SELECT value FROM app_settings WHERE key='active_preset_id'), 'Cat', 'select')",
            [],
        ).unwrap();

        // First call inserts the value.
        upsert_param_values(&conn, "n1", &[NodeParamValueInput {
            param_def_id: "d1".into(), value: Some("a".into()), is_enabled: true, show_on_card: true,
        }]).unwrap();
        let n = fetch_node(&conn, "n1").unwrap();
        assert_eq!(n.param_values.len(), 1);
        assert_eq!(n.param_values[0].value.as_deref(), Some("a"));

        // Second call for the same (node, def) must UPDATE the row, not add a second.
        upsert_param_values(&conn, "n1", &[NodeParamValueInput {
            param_def_id: "d1".into(), value: Some("b".into()), is_enabled: false, show_on_card: false,
        }]).unwrap();
        let n2 = fetch_node(&conn, "n1").unwrap();
        assert_eq!(n2.param_values.len(), 1, "upsert must update in place, not duplicate");
        assert_eq!(n2.param_values[0].value.as_deref(), Some("b"));
        assert!(!n2.param_values[0].is_enabled);
        assert!(!n2.param_values[0].show_on_card);
    }
}
