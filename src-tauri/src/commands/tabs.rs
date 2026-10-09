use crate::commands::graph::do_import;
use crate::models::GraphExport;
use crate::{ProjectManager, PmState, TabEntry, TabMeta};
use crate::{load_recent, push_recent, remove_recent};
use crate::db;
use rusqlite::Connection;
use tauri::{Emitter, State};
use uuid::Uuid;

fn next_order(pm: &ProjectManager) -> usize {
    pm.tabs.values().map(|e| e.order).max().map(|m| m + 1).unwrap_or(0)
}

#[tauri::command]
pub fn get_tabs(state: State<PmState>) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    // Authoritative dirty for the active tab on read, so a tab list fetched after
    // an out-of-band (API/SDK/Live Share) change reflects reality.
    pm.recompute_active_dirty();
    Ok(pm.tab_metas())
}

#[tauri::command]
pub fn create_tab(name: String, preset_id: String, state: State<PmState>, app: tauri::AppHandle) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    // Shared with the HTTP `POST /api/tabs` — see ProjectManager::create_project_tab.
    pm.create_project_tab(name, preset_id)?;
    let metas = pm.tab_metas();
    let _ = app.emit("tabs:changed", &metas);
    Ok(metas)
}

#[tauri::command]
pub fn switch_tab(id: String, state: State<PmState>, app: tauri::AppHandle) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    if !pm.tabs.contains_key(&id) {
        return Err(format!("Tab '{}' not found", id));
    }
    pm.active_tab_id = id;
    pm.save_tabs_json()?;
    let metas = pm.tab_metas();
    let _ = app.emit("tabs:changed", &metas);
    Ok(metas)
}

#[tauri::command]
pub fn close_tab(id: String, delete_db: bool, state: State<PmState>, app: tauri::AppHandle) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    // Shared with the HTTP `DELETE /api/tabs/{id}` — see ProjectManager::close_project_tab.
    pm.close_project_tab(&id, delete_db)?;
    let metas = pm.tab_metas();
    let _ = app.emit("tabs:changed", &metas);
    Ok(metas)
}

#[tauri::command]
pub fn set_tab_dirty(id: String, dirty: bool, state: State<PmState>) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    if let Some(entry) = pm.tabs.get_mut(&id) {
        entry.dirty = dirty;
    }
    // No `tabs:changed` emit — the caller updates its own tab list from the
    // returned metas. Avoids a re-render storm on every edit and any event loop.
    Ok(pm.tab_metas())
}

/// Recompute the active tab's dirty flag by comparing a content fingerprint of
/// the project to the fingerprint of its clean baseline (last save / open /
/// create). This is what lets "undo back to the saved state" clear the unsaved
/// dot: `dirty` reflects whether the content *actually differs* from baseline,
/// not merely that some edit occurred. The frontend calls this (debounced) after
/// edits settle. Like `set_tab_dirty`, it does NOT emit `tabs:changed` — the
/// caller applies the returned metas.
#[tauri::command]
pub fn recompute_active_tab_dirty(state: State<PmState>) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    pm.recompute_active_dirty();
    Ok(pm.tab_metas())
}

/// Recent project + whether its file still exists on disk (computed per-read,
/// not persisted to recent.json). The Start screen flags `missing` entries.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentProjectInfo {
    pub name: String,
    pub path: String,
    pub missing: bool,
}

#[tauri::command]
pub fn get_recent_projects(state: State<PmState>) -> Result<Vec<RecentProjectInfo>, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    Ok(load_recent(&pm.projects_dir)
        .into_iter()
        .map(|r| {
            let missing = !std::path::Path::new(&r.path).exists();
            RecentProjectInfo { name: r.name, path: r.path, missing }
        })
        .collect())
}

#[tauri::command]
pub fn record_recent_project(name: String, path: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    push_recent(&pm.projects_dir, &name, &path);
    Ok(())
}

/// Remove a recent-project entry (Start screen "Clear", or "Re-path" once the file
/// has been relocated). Idempotent — unknown paths are a no-op.
#[tauri::command]
pub fn remove_recent_project(path: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    remove_recent(&pm.projects_dir, &path);
    Ok(())
}

#[tauri::command]
pub fn open_path_as_tab(path: String, state: State<PmState>, app: tauri::AppHandle) -> Result<Vec<TabMeta>, String> {
    let name = std::path::Path::new(&path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Project")
        .to_string();
    let canonical = std::fs::canonicalize(&path).ok();

    let mut pm = state.lock().map_err(|e| e.to_string())?;

    // A project can only be open in one tab. If this file is already open, switch
    // to that tab instead of opening a duplicate — and don't re-import, so any
    // unsaved changes in the existing tab are preserved.
    let existing_id = pm.tabs.values().find(|e| {
        let sp = match &e.save_path { Some(p) => p, None => return false };
        sp.as_str() == path.as_str()
            || (canonical.is_some() && std::fs::canonicalize(sp).ok() == canonical)
    }).map(|e| e.id.clone());

    if let Some(id) = existing_id {
        pm.active_tab_id = id;
        push_recent(&pm.projects_dir, &name, &path);
        pm.save_tabs_json()?;
        let metas = pm.tab_metas();
        let _ = app.emit("tabs:changed", &metas);
        return Ok(metas);
    }

    // Not already open — read, parse, and import into a fresh tab.
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let export: GraphExport = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    let tab_id = Uuid::new_v4().to_string();
    let db_path = pm.projects_dir.join(format!("{}.db", tab_id));
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    db::init_db(&conn).map_err(|e| e.to_string())?;
    do_import(&conn, export).map_err(|e| e.to_string())?;

    push_recent(&pm.projects_dir, &name, &path);

    let order = next_order(&pm);
    // Baseline = the just-imported file content, so the tab opens clean and only
    // goes dirty once the user edits it.
    let saved_fingerprint = crate::commands::graph::compute_fingerprint(&conn).ok();
    pm.tabs.insert(tab_id.clone(), TabEntry {
        id: tab_id.clone(),
        name,
        save_path: Some(path),
        order,
        conn,
        dirty: false,
        saved_fingerprint,
    });
    pm.active_tab_id = tab_id;
    pm.save_tabs_json()?;
    let metas = pm.tab_metas();
    let _ = app.emit("tabs:changed", &metas);
    Ok(metas)
}

#[tauri::command]
pub fn rename_tab(id: String, name: String, state: State<PmState>, app: tauri::AppHandle) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    if let Some(entry) = pm.tabs.get_mut(&id) {
        entry.name = name;
    } else {
        return Err(format!("Tab '{}' not found", id));
    }
    pm.save_tabs_json()?;
    let metas = pm.tab_metas();
    let _ = app.emit("tabs:changed", &metas);
    Ok(metas)
}

#[tauri::command]
pub fn set_tab_save_path(id: String, path: Option<String>, state: State<PmState>, app: tauri::AppHandle) -> Result<Vec<TabMeta>, String> {
    let mut pm = state.lock().map_err(|e| e.to_string())?;
    // Enforce one-tab-per-file: if another open tab is already linked to this
    // path (e.g. Save As onto a file another tab has open), unlink that tab — the
    // tab that just saved now owns the file. Mirrors the dedupe in
    // `open_path_as_tab`, but for the Save As direction.
    if let Some(ref p) = path {
        let canonical = std::fs::canonicalize(p).ok();
        for (tid, entry) in pm.tabs.iter_mut() {
            if tid == &id { continue; }
            let matches = entry.save_path.as_ref().is_some_and(|sp| {
                sp == p || (canonical.is_some() && std::fs::canonicalize(sp).ok() == canonical)
            });
            if matches {
                entry.save_path = None;
            }
        }
    }
    if let Some(entry) = pm.tabs.get_mut(&id) {
        entry.save_path = path;
    } else {
        return Err(format!("Tab '{}' not found", id));
    }
    pm.save_tabs_json()?;
    let metas = pm.tab_metas();
    let _ = app.emit("tabs:changed", &metas);
    Ok(metas)
}

