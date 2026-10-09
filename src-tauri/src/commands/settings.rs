use crate::models::*;
use crate::PmState;
use rusqlite::{params, Connection};
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

// ── Helpers ───────────────────────────────────────────────────────────────────

pub fn load_settings(conn: &Connection) -> rusqlite::Result<GraphSettings> {
    let active_preset_id: String = conn.query_row(
        "SELECT value FROM app_settings WHERE key='active_preset_id'",
        [],
        |row| row.get(0),
    )?;

    let presets: Vec<Preset> = {
        let mut stmt = conn.prepare(
            "SELECT id, name, is_builtin, created_at FROM presets
             ORDER BY is_builtin DESC, created_at ASC",
        )?;
        let v: Vec<Preset> = stmt.query_map([], |row| {
            Ok(Preset {
                id: row.get(0)?,
                name: row.get(1)?,
                is_builtin: row.get::<_, i64>(2)? != 0,
                created_at: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        v
    };

    let mut param_defs: Vec<NodeParamDef> = {
        let mut stmt = conn.prepare(
            "SELECT id, preset_id, display_name, param_type, default_value, drives_color, show_on_card_default, sort_order
             FROM node_param_defs WHERE preset_id=?1 ORDER BY sort_order ASC",
        )?;
        let v: Vec<NodeParamDef> = stmt.query_map(params![active_preset_id], |row| {
            Ok(NodeParamDef {
                id: row.get(0)?,
                preset_id: row.get(1)?,
                display_name: row.get(2)?,
                param_type: row.get(3)?,
                default_value: row.get(4)?,
                drives_color: row.get::<_, i64>(5)? != 0,
                show_on_card_default: row.get::<_, i64>(6)? != 0,
                sort_order: row.get(7)?,
                options: vec![],
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        v
    };

    let all_node_options: Vec<NodeParamOption> = {
        let mut stmt = conn.prepare(
            "SELECT o.id, o.param_def_id, o.value_slug, o.label, o.color, o.sort_order
             FROM node_param_options o
             JOIN node_param_defs d ON o.param_def_id = d.id
             WHERE d.preset_id = ?1
             ORDER BY o.sort_order ASC",
        )?;
        let v: Vec<NodeParamOption> = stmt.query_map(params![active_preset_id], |row| {
            Ok(NodeParamOption {
                id: row.get(0)?,
                param_def_id: row.get(1)?,
                value_slug: row.get(2)?,
                label: row.get(3)?,
                color: row.get(4)?,
                sort_order: row.get(5)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        v
    };

    for def in &mut param_defs {
        def.options = all_node_options.iter()
            .filter(|o| o.param_def_id == def.id)
            .cloned()
            .collect();
    }

    let edge_param_defs = load_edge_param_defs(conn, &active_preset_id)?;

    Ok(GraphSettings {
        active_preset_id,
        presets,
        param_defs,
        edge_param_defs,
    })
}

fn load_edge_param_defs(conn: &Connection, preset_id: &str) -> rusqlite::Result<Vec<EdgeParamDef>> {
    let mut edge_param_defs: Vec<EdgeParamDef> = {
        let mut stmt = conn.prepare(
            "SELECT id, preset_id, display_name, param_type, default_value,
                    drives_arrow, drives_style, drives_color, drives_width, sort_order
             FROM edge_param_defs WHERE preset_id=?1 ORDER BY sort_order ASC",
        )?;
        let v: Vec<EdgeParamDef> = stmt.query_map(params![preset_id], |row| {
            Ok(EdgeParamDef {
                id: row.get(0)?,
                preset_id: row.get(1)?,
                display_name: row.get(2)?,
                param_type: row.get(3)?,
                default_value: row.get(4)?,
                drives_arrow: row.get::<_, i64>(5)? != 0,
                drives_style: row.get::<_, i64>(6)? != 0,
                drives_color: row.get::<_, i64>(7)? != 0,
                drives_width: row.get::<_, i64>(8)? != 0,
                sort_order: row.get(9)?,
                options: vec![],
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        v
    };

    let all_edge_options: Vec<EdgeParamOption> = {
        let mut stmt = conn.prepare(
            "SELECT o.id, o.param_def_id, o.value_slug, o.label, o.color, o.sort_order
             FROM edge_param_options o
             JOIN edge_param_defs d ON o.param_def_id = d.id
             WHERE d.preset_id = ?1
             ORDER BY o.sort_order ASC",
        )?;
        let v: Vec<EdgeParamOption> = stmt.query_map(params![preset_id], |row| {
            Ok(EdgeParamOption {
                id: row.get(0)?,
                param_def_id: row.get(1)?,
                value_slug: row.get(2)?,
                label: row.get(3)?,
                color: row.get(4)?,
                sort_order: row.get(5)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        v
    };

    for def in &mut edge_param_defs {
        def.options = all_edge_options.iter()
            .filter(|o| o.param_def_id == def.id)
            .cloned()
            .collect();
    }

    Ok(edge_param_defs)
}

fn to_slug(label: &str) -> String {
    let raw: String = label
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '_' })
        .collect();
    raw.split('_')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("_")
}

fn unique_option_slug(conn: &Connection, param_def_id: &str, base: &str) -> String {
    let slug = to_slug(base);
    let mut candidate = slug.clone();
    let mut n = 2usize;
    loop {
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM node_param_options WHERE param_def_id=?1 AND value_slug=?2",
                params![param_def_id, candidate],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if count == 0 { break; }
        candidate = format!("{}_{}", slug, n);
        n += 1;
    }
    candidate
}

fn unique_edge_option_slug(conn: &Connection, param_def_id: &str, base: &str) -> String {
    let slug = to_slug(base);
    let mut candidate = slug.clone();
    let mut n = 2usize;
    loop {
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM edge_param_options WHERE param_def_id=?1 AND value_slug=?2",
                params![param_def_id, candidate],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if count == 0 { break; }
        candidate = format!("{}_{}", slug, n);
        n += 1;
    }
    candidate
}

fn next_sort_order_param(conn: &Connection, preset_id: &str) -> i64 {
    conn.query_row(
        "SELECT COALESCE(MAX(sort_order)+1, 0) FROM node_param_defs WHERE preset_id=?1",
        params![preset_id],
        |row| row.get(0),
    ).unwrap_or(0)
}

fn next_sort_order_option(conn: &Connection, param_def_id: &str) -> i64 {
    conn.query_row(
        "SELECT COALESCE(MAX(sort_order)+1, 0) FROM node_param_options WHERE param_def_id=?1",
        params![param_def_id],
        |row| row.get(0),
    ).unwrap_or(0)
}

fn next_sort_order_edge_param(conn: &Connection, preset_id: &str) -> i64 {
    conn.query_row(
        "SELECT COALESCE(MAX(sort_order)+1, 0) FROM edge_param_defs WHERE preset_id=?1",
        params![preset_id],
        |row| row.get(0),
    ).unwrap_or(0)
}

fn next_sort_order_edge_option(conn: &Connection, param_def_id: &str) -> i64 {
    conn.query_row(
        "SELECT COALESCE(MAX(sort_order)+1, 0) FROM edge_param_options WHERE param_def_id=?1",
        params![param_def_id],
        |row| row.get(0),
    ).unwrap_or(0)
}

// ── Tauri commands ─────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_graph_settings(state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    load_settings(pm.active_conn()?).map_err(|e| e.to_string())
}

// ── Preset management ─────────────────────────────────────────────────────────

#[tauri::command]
pub fn set_active_preset(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE app_settings SET value=?1 WHERE key='active_preset_id'",
        params![id],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_preset(input: CreatePresetInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO presets (id, name, is_builtin, created_at) VALUES (?1, ?2, 0, ?3)",
        params![id, input.name, now],
    ).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE app_settings SET value=?1 WHERE key='active_preset_id'",
        params![id],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn duplicate_preset(input: DuplicatePresetInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let new_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Copy the whole preset (defs + options) and repoint the active preset in one
    // transaction, so a mid-copy failure can't leave a half-duplicated preset and
    // the active pointer aimed at it.
    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result: Result<(), String> = (|| {
    conn.execute(
        "INSERT INTO presets (id, name, is_builtin, created_at) VALUES (?1, ?2, 0, ?3)",
        params![new_id, input.new_name, now],
    ).map_err(|e| e.to_string())?;

    let old_node_param_ids: Vec<String> = {
        let mut stmt = conn.prepare(
            "SELECT id FROM node_param_defs WHERE preset_id=?1 ORDER BY sort_order ASC",
        ).map_err(|e| e.to_string())?;
        let v: Vec<String> = stmt.query_map(params![input.id], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        v
    };

    for old_def_id in &old_node_param_ids {
        let new_def_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO node_param_defs
             (id, preset_id, display_name, param_type, default_value, drives_color, show_on_card_default, sort_order)
             SELECT ?1, ?2, display_name, param_type, default_value, drives_color, show_on_card_default, sort_order
             FROM node_param_defs WHERE id=?3",
            params![new_def_id, new_id, old_def_id],
        ).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO node_param_options (id, param_def_id, value_slug, label, color, sort_order)
             SELECT lower(hex(randomblob(16))), ?1, value_slug, label, color, sort_order
             FROM node_param_options WHERE param_def_id=?2",
            params![new_def_id, old_def_id],
        ).map_err(|e| e.to_string())?;
    }

    let old_edge_param_ids: Vec<String> = {
        let mut stmt = conn.prepare(
            "SELECT id FROM edge_param_defs WHERE preset_id=?1 ORDER BY sort_order ASC",
        ).map_err(|e| e.to_string())?;
        let v: Vec<String> = stmt.query_map(params![input.id], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        v
    };

    for old_def_id in &old_edge_param_ids {
        let new_def_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO edge_param_defs
             (id, preset_id, display_name, param_type, default_value,
              drives_arrow, drives_style, drives_color, drives_width, sort_order)
             SELECT ?1, ?2, display_name, param_type, default_value,
                    drives_arrow, drives_style, drives_color, drives_width, sort_order
             FROM edge_param_defs WHERE id=?3",
            params![new_def_id, new_id, old_def_id],
        ).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO edge_param_options (id, param_def_id, value_slug, label, color, sort_order)
             SELECT lower(hex(randomblob(16))), ?1, value_slug, label, color, sort_order
             FROM edge_param_options WHERE param_def_id=?2",
            params![new_def_id, old_def_id],
        ).map_err(|e| e.to_string())?;
    }

    conn.execute(
        "UPDATE app_settings SET value=?1 WHERE key='active_preset_id'",
        params![new_id],
    ).map_err(|e| e.to_string())?;
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e); }
    }

    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_preset(input: RenamePresetInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE presets SET name=?2 WHERE id=?1",
        params![input.id, input.name],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_preset(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;

    let is_builtin: i64 = conn.query_row(
        "SELECT is_builtin FROM presets WHERE id=?1",
        params![id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    if is_builtin != 0 {
        return Err("Cannot delete the built-in preset.".into());
    }

    let preset_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM presets", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if preset_count <= 1 {
        return Err("Cannot delete the only preset.".into());
    }

    let active: String = conn.query_row(
        "SELECT value FROM app_settings WHERE key='active_preset_id'",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    if active == id {
        let fallback: String = conn.query_row(
            "SELECT id FROM presets WHERE id != ?1 ORDER BY is_builtin DESC LIMIT 1",
            params![id],
            |row| row.get(0),
        ).map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE app_settings SET value=?1 WHERE key='active_preset_id'",
            params![fallback],
        ).map_err(|e| e.to_string())?;
    }

    conn.execute("DELETE FROM presets WHERE id=?1", params![id])
        .map_err(|e| e.to_string())?;

    load_settings(conn).map_err(|e| e.to_string())
}

// ── Node param defs ────────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_node_param_def(input: CreateNodeParamDefInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let order = next_sort_order_param(conn, &input.preset_id);

    if input.drives_color {
        conn.execute(
            "UPDATE node_param_defs SET drives_color=0 WHERE preset_id=?1",
            params![input.preset_id],
        ).map_err(|e| e.to_string())?;
    }

    conn.execute(
        "INSERT INTO node_param_defs
         (id, preset_id, display_name, param_type, default_value, drives_color, show_on_card_default, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, input.preset_id, input.display_name, input.param_type,
                input.default_value, input.drives_color as i64, input.show_on_card_default as i64, order],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_node_param_def(input: UpdateNodeParamDefInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE node_param_defs SET display_name=?2, param_type=?3, default_value=?4, show_on_card_default=?5
         WHERE id=?1",
        params![input.id, input.display_name, input.param_type, input.default_value, input.show_on_card_default as i64],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_node_param_def(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM node_param_defs WHERE id=?1", params![id])
        .map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_drives_color(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;

    let preset_id: String = conn.query_row(
        "SELECT preset_id FROM node_param_defs WHERE id=?1",
        params![id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE node_param_defs SET drives_color=0 WHERE preset_id=?1",
        params![preset_id],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE node_param_defs SET drives_color=1 WHERE id=?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    load_settings(conn).map_err(|e| e.to_string())
}

// ── Node param options ────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_param_option(input: CreateNodeParamOptionInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let slug = unique_option_slug(conn, &input.param_def_id, &input.label);
    let order = next_sort_order_option(conn, &input.param_def_id);
    conn.execute(
        "INSERT INTO node_param_options (id, param_def_id, value_slug, label, color, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, input.param_def_id, slug, input.label, input.color, order],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_param_option(input: UpdateNodeParamOptionInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE node_param_options SET label=?2, color=?3 WHERE id=?1",
        params![input.id, input.label, input.color],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_param_option(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM node_param_options WHERE id=?1", params![id])
        .map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

// ── Edge param defs ────────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_edge_param_def(input: CreateEdgeParamDefInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let order = next_sort_order_edge_param(conn, &input.preset_id);

    if input.drives_arrow {
        conn.execute("UPDATE edge_param_defs SET drives_arrow=0 WHERE preset_id=?1", params![input.preset_id]).map_err(|e| e.to_string())?;
    }
    if input.drives_style {
        conn.execute("UPDATE edge_param_defs SET drives_style=0 WHERE preset_id=?1", params![input.preset_id]).map_err(|e| e.to_string())?;
    }
    if input.drives_color {
        conn.execute("UPDATE edge_param_defs SET drives_color=0 WHERE preset_id=?1", params![input.preset_id]).map_err(|e| e.to_string())?;
    }
    if input.drives_width {
        conn.execute("UPDATE edge_param_defs SET drives_width=0 WHERE preset_id=?1", params![input.preset_id]).map_err(|e| e.to_string())?;
    }

    conn.execute(
        "INSERT INTO edge_param_defs
         (id, preset_id, display_name, param_type, default_value,
          drives_arrow, drives_style, drives_color, drives_width, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            id, input.preset_id, input.display_name, input.param_type, input.default_value,
            input.drives_arrow as i64, input.drives_style as i64,
            input.drives_color as i64, input.drives_width as i64, order
        ],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_edge_param_def(input: UpdateEdgeParamDefInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE edge_param_defs SET display_name=?2, param_type=?3, default_value=?4
         WHERE id=?1",
        params![input.id, input.display_name, input.param_type, input.default_value],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_edge_param_def(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM edge_param_defs WHERE id=?1", params![id])
        .map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_edge_drive(id: String, drive: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;

    let preset_id: String = conn.query_row(
        "SELECT preset_id FROM edge_param_defs WHERE id=?1",
        params![id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    match drive.as_str() {
        "arrow" => {
            conn.execute("UPDATE edge_param_defs SET drives_arrow=0 WHERE preset_id=?1", params![preset_id]).map_err(|e| e.to_string())?;
            conn.execute("UPDATE edge_param_defs SET drives_arrow=1 WHERE id=?1", params![id]).map_err(|e| e.to_string())?;
        }
        "style" => {
            conn.execute("UPDATE edge_param_defs SET drives_style=0 WHERE preset_id=?1", params![preset_id]).map_err(|e| e.to_string())?;
            conn.execute("UPDATE edge_param_defs SET drives_style=1 WHERE id=?1", params![id]).map_err(|e| e.to_string())?;
        }
        "color" => {
            conn.execute("UPDATE edge_param_defs SET drives_color=0 WHERE preset_id=?1", params![preset_id]).map_err(|e| e.to_string())?;
            conn.execute("UPDATE edge_param_defs SET drives_color=1 WHERE id=?1", params![id]).map_err(|e| e.to_string())?;
        }
        "width" => {
            conn.execute("UPDATE edge_param_defs SET drives_width=0 WHERE preset_id=?1", params![preset_id]).map_err(|e| e.to_string())?;
            conn.execute("UPDATE edge_param_defs SET drives_width=1 WHERE id=?1", params![id]).map_err(|e| e.to_string())?;
        }
        _ => return Err(format!("Invalid drive type: {}", drive)),
    }

    load_settings(conn).map_err(|e| e.to_string())
}

// ── Edge param options ────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_edge_param_option(input: CreateEdgeParamOptionInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let slug = unique_edge_option_slug(conn, &input.param_def_id, &input.label);
    let order = next_sort_order_edge_option(conn, &input.param_def_id);
    conn.execute(
        "INSERT INTO edge_param_options (id, param_def_id, value_slug, label, color, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, input.param_def_id, slug, input.label, input.color, order],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_edge_param_option(input: UpdateEdgeParamOptionInput, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE edge_param_options SET label=?2, color=?3 WHERE id=?1",
        params![input.id, input.label, input.color],
    ).map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_edge_param_option(id: String, state: State<PmState>) -> Result<GraphSettings, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM edge_param_options WHERE id=?1", params![id])
        .map_err(|e| e.to_string())?;
    load_settings(conn).map_err(|e| e.to_string())
}

// ── App settings ──────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_app_setting(key: String, state: State<PmState>) -> Result<Option<String>, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    // api_enabled / api_token / api_port are global (the HTTP server is one global
    // service), stored in api_config.json — not the active project.
    if crate::GLOBAL_API_KEYS.contains(&key.as_str()) {
        let cfg = crate::load_api_config(&pm.projects_dir);
        return Ok(Some(match key.as_str() {
            "api_enabled" => cfg.enabled.to_string(),
            "api_token" => cfg.token,
            _ => cfg.port.to_string(),
        }));
    }
    let conn = pm.active_conn()?;
    let result: Option<String> = conn.query_row(
        "SELECT value FROM app_settings WHERE key=?1",
        params![key],
        |row| row.get(0),
    ).ok();
    Ok(result)
}

/// The user's display name (global, per-machine) — basis for identity/presence
/// in future shared sessions. Stored in `user_config.json`.
#[tauri::command]
pub fn get_display_name(state: State<PmState>) -> Result<String, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    Ok(crate::load_user_config(&pm.projects_dir).display_name)
}

#[tauri::command]
pub fn set_display_name(name: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let cfg = crate::UserConfig { display_name: name.trim().to_string() };
    crate::save_user_config(&pm.projects_dir, &cfg)
}

/// The machine's primary LAN address + the configured port — what a host shares
/// so others can reach them. Found via the standard UDP-connect trick (no packet
/// is sent; the OS just reveals which local interface would route outward). Falls
/// back to loopback when offline.
#[tauri::command]
pub fn get_lan_address() -> Result<String, String> {
    let ip = std::net::UdpSocket::bind("0.0.0.0:0")
        .and_then(|s| { s.connect("8.8.8.8:80")?; s.local_addr() })
        .map(|a| a.ip().to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string());
    // The session server (where guests connect), not the loopback API port.
    Ok(format!("{}:{}", ip, crate::session::SESSION_PORT))
}

#[tauri::command]
pub fn set_app_setting(key: String, value: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    if crate::GLOBAL_API_KEYS.contains(&key.as_str()) {
        let mut cfg = crate::load_api_config(&pm.projects_dir);
        match key.as_str() {
            "api_enabled" => {
                cfg.enabled = value == "true";
            }
            "api_token" => cfg.token = value,
            "api_port" => { if let Ok(p) = value.parse::<u16>() { cfg.port = p; } }
            _ => {}
        }
        return crate::save_api_config(&pm.projects_dir, &cfg);
    }
    let conn = pm.active_conn()?;
    conn.execute(
        "INSERT INTO app_settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        params![key, value],
    ).map_err(|e| e.to_string())?;
    Ok(())
}
