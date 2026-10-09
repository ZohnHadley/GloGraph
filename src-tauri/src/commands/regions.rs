use crate::models::{CreateRegionInput, GloRegion, UpdateRegionInput};
use crate::PmState;
use rusqlite::params;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

pub fn fetch_region(conn: &rusqlite::Connection, id: &str) -> rusqlite::Result<GloRegion> {
    conn.query_row(
        "SELECT id, title, x, y, width, height, color, z_order, is_locked, is_minimized, created_at FROM regions WHERE id=?1",
        params![id],
        |row| Ok(GloRegion {
            id:           row.get(0)?,
            title:        row.get(1)?,
            x:            row.get(2)?,
            y:            row.get(3)?,
            width:        row.get(4)?,
            height:       row.get(5)?,
            color:        row.get(6)?,
            z_order:      row.get(7)?,
            is_locked:    row.get::<_, i64>(8)? != 0,
            is_minimized: row.get::<_, i64>(9)? != 0,
            created_at:   row.get(10)?,
        }),
    )
}

pub(crate) fn list_all_regions(conn: &rusqlite::Connection) -> Result<Vec<GloRegion>, String> {
    let mut stmt = conn.prepare(
        "SELECT id, title, x, y, width, height, color, z_order, is_locked, is_minimized, created_at FROM regions ORDER BY created_at ASC"
    ).map_err(|e| e.to_string())?;
    let regions: Vec<GloRegion> = stmt
        .query_map([], |row| Ok(GloRegion {
            id:           row.get(0)?,
            title:        row.get(1)?,
            x:            row.get(2)?,
            y:            row.get(3)?,
            width:        row.get(4)?,
            height:       row.get(5)?,
            color:        row.get(6)?,
            z_order:      row.get(7)?,
            is_locked:    row.get::<_, i64>(8)? != 0,
            is_minimized: row.get::<_, i64>(9)? != 0,
            created_at:   row.get(10)?,
        }))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(regions)
}

#[tauri::command]
pub fn get_all_regions(state: State<PmState>) -> Result<Vec<GloRegion>, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    list_all_regions(pm.active_conn()?)
}

#[tauri::command]
pub fn create_region(input: CreateRegionInput, state: State<PmState>) -> Result<GloRegion, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO regions (id, title, x, y, width, height, color, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, input.title, input.x, input.y, input.width, input.height, input.color, now],
    ).map_err(|e| e.to_string())?;
    fetch_region(conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_region(input: UpdateRegionInput, state: State<PmState>) -> Result<GloRegion, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE regions SET title=?2, x=?3, y=?4, width=?5, height=?6, color=?7 WHERE id=?1",
        params![input.id, input.title, input.x, input.y, input.width, input.height, input.color],
    ).map_err(|e| e.to_string())?;
    fetch_region(conn, &input.id).map_err(|e| e.to_string())
}

/// Restore (INSERT OR REPLACE) a region. Shared by the Tauri command and HTTP
/// `POST /api/regions/restore` (Live Share guest undo of a delete).
pub(crate) fn restore_region_inner(conn: &rusqlite::Connection, region: &crate::models::GloRegion) -> Result<crate::models::GloRegion, String> {
    conn.execute(
        "INSERT OR REPLACE INTO regions (id, title, x, y, width, height, color, z_order, is_locked, is_minimized, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            region.id, region.title, region.x, region.y,
            region.width, region.height, region.color, region.z_order,
            region.is_locked as i64, region.is_minimized as i64, region.created_at
        ],
    ).map_err(|e| e.to_string())?;
    fetch_region(conn, &region.id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_region(region: crate::models::GloRegion, state: State<PmState>) -> Result<crate::models::GloRegion, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    restore_region_inner(conn, &region)
}

#[tauri::command]
pub fn delete_region(id: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM regions WHERE id=?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_region_z_order(id: String, z_order: i64, state: State<PmState>) -> Result<GloRegion, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE regions SET z_order=?2 WHERE id=?1",
        params![id, z_order],
    ).map_err(|e| e.to_string())?;
    fetch_region(conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_region_locked(id: String, locked: bool, state: State<PmState>) -> Result<GloRegion, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE regions SET is_locked=?2 WHERE id=?1",
        params![id, locked as i64],
    ).map_err(|e| e.to_string())?;
    fetch_region(conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_region_minimized(id: String, minimized: bool, state: State<PmState>) -> Result<GloRegion, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE regions SET is_minimized=?2 WHERE id=?1",
        params![id, minimized as i64],
    ).map_err(|e| e.to_string())?;
    fetch_region(conn, &id).map_err(|e| e.to_string())
}
