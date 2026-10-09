use crate::models::{CreateEdgeInput, EdgeParamValue, GloEdge, UpdateEdgeInput, UpdateEdgeWaypointsInput, WaypointPoint};
use crate::PmState;
use rusqlite::params;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

// Node card default footprint (flow units) — mirrors the frontend NODE_W/NODE_H
// (src/lib/regionMembership.ts). Used to find node centers for handle picking.
const NODE_W: f64 = 200.0;
const NODE_H: f64 = 80.0;

/// Fill in `source_handle`/`target_handle` from the two nodes' positions when the
/// caller left **both** unset, so an edge created without explicit handles
/// connects from the nearest-facing sides. The single backend entry point for
/// this — used by the Tauri `create_edge` command (GUI auto-wire / Tab
/// quick-connect, which now send null handles) and by every HTTP edge-create
/// handler. The side maths lives once in `crate::core::handles::closest_handles`.
/// No-op when a handle is already set (an explicit GUI drag is respected) or a
/// node can't be located.
pub(crate) fn resolve_handles_if_absent(conn: &rusqlite::Connection, input: &mut CreateEdgeInput) {
    if input.source_handle.is_some() || input.target_handle.is_some() {
        return;
    }
    let center = |id: &str| -> Option<(f64, f64)> {
        conn.query_row(
            "SELECT x, y, width, height FROM nodes WHERE id=?1",
            params![id],
            |row| {
                let x: f64 = row.get(0)?;
                let y: f64 = row.get(1)?;
                let w: f64 = row.get::<_, Option<f64>>(2)?.unwrap_or(NODE_W);
                let h: f64 = row.get::<_, Option<f64>>(3)?.unwrap_or(NODE_H);
                Ok((x + w / 2.0, y + h / 2.0))
            },
        ).ok()
    };
    let (scx, scy) = match center(&input.source_id) { Some(p) => p, None => return };
    let (tcx, tcy) = match center(&input.target_id) { Some(p) => p, None => return };
    let (s, t) = crate::core::handles::closest_handles(tcx - scx, tcy - scy);
    input.source_handle = Some(s.to_string());
    input.target_handle = Some(t.to_string());
}

pub fn fetch_edge(conn: &rusqlite::Connection, edge_id: &str) -> rusqlite::Result<GloEdge> {
    let (id, source_id, target_id, source_handle, target_handle, waypoints_json, external_id, label, color) =
        conn.query_row(
            "SELECT id, source_id, target_id, source_handle, target_handle, waypoints, external_id, label, color
             FROM edges WHERE id=?1",
            params![edge_id],
            |row| Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, Option<String>>(3)?,
                row.get::<_, Option<String>>(4)?,
                row.get::<_, Option<String>>(5)?,
                row.get::<_, Option<String>>(6)?,
                row.get::<_, Option<String>>(7)?,
                row.get::<_, Option<String>>(8)?,
            )),
        )?;

    let waypoints: Option<Vec<WaypointPoint>> = waypoints_json
        .as_deref()
        .and_then(|s| serde_json::from_str(s).ok());

    let mut pv_stmt = conn.prepare(
        "SELECT id, edge_id, param_def_id, value, is_enabled
         FROM edge_param_values WHERE edge_id=?1",
    )?;
    let param_values: Vec<EdgeParamValue> = pv_stmt
        .query_map(params![edge_id], |row| {
            Ok(EdgeParamValue {
                id:           row.get(0)?,
                edge_id:      row.get(1)?,
                param_def_id: row.get(2)?,
                value:        row.get(3)?,
                is_enabled:   row.get::<_, i64>(4)? != 0,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(GloEdge { id, source_id, target_id, source_handle, target_handle, param_values, waypoints, external_id, label, color })
}

pub(crate) fn list_all_edges(conn: &rusqlite::Connection) -> Result<Vec<GloEdge>, String> {
    // Batch load (mirrors list_all_nodes): one query for the edge rows + one for
    // all param values, joined in memory — avoids the per-edge N+1 of fetch_edge.
    let mut edges: Vec<GloEdge> = {
        let mut stmt = conn.prepare(
            "SELECT id, source_id, target_id, source_handle, target_handle, waypoints, external_id, label, color
             FROM edges ORDER BY created_at ASC",
        ).map_err(|e| e.to_string())?;
        let v: Vec<GloEdge> = stmt.query_map([], |row| {
            let waypoints_json: Option<String> = row.get(5)?;
            let waypoints = waypoints_json.as_deref().and_then(|s| serde_json::from_str(s).ok());
            Ok(GloEdge {
                id:            row.get(0)?,
                source_id:     row.get(1)?,
                target_id:     row.get(2)?,
                source_handle: row.get(3)?,
                target_handle: row.get(4)?,
                param_values:  vec![],
                waypoints,
                external_id:   row.get(6)?,
                label:         row.get(7)?,
                color:         row.get(8)?,
            })
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
        v
    };

    if edges.is_empty() {
        return Ok(edges);
    }

    let id_to_idx: std::collections::HashMap<String, usize> =
        edges.iter().enumerate().map(|(i, e)| (e.id.clone(), i)).collect();

    // All param values belong to a loaded edge (FK cascade guarantees no orphans).
    let mut stmt = conn.prepare(
        "SELECT id, edge_id, param_def_id, value, is_enabled FROM edge_param_values",
    ).map_err(|e| e.to_string())?;
    let pvs: Vec<EdgeParamValue> = stmt.query_map([], |row| {
        Ok(EdgeParamValue {
            id:           row.get(0)?,
            edge_id:      row.get(1)?,
            param_def_id: row.get(2)?,
            value:        row.get(3)?,
            is_enabled:   row.get::<_, i64>(4)? != 0,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();
    for pv in pvs {
        if let Some(&i) = id_to_idx.get(pv.edge_id.as_str()) {
            edges[i].param_values.push(pv);
        }
    }

    Ok(edges)
}

#[tauri::command]
pub fn get_all_edges(state: State<PmState>) -> Result<Vec<GloEdge>, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    list_all_edges(pm.active_conn()?)
}

#[tauri::command]
pub fn create_edge(mut input: CreateEdgeInput, state: State<PmState>) -> Result<GloEdge, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    // No explicit handles (GUI auto-wire / Tab quick-connect, and the default for
    // any caller) → connect from the closest sides. One source: core::handles.
    resolve_handles_if_absent(conn, &mut input);
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result = (|| -> rusqlite::Result<()> {
        conn.execute(
            "INSERT INTO edges (id, source_id, target_id, source_handle, target_handle, external_id, color, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![id, input.source_id, input.target_id, input.source_handle, input.target_handle, input.external_id, input.color, now],
        )?;
        for pv in &input.param_values {
            let pv_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT OR REPLACE INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![pv_id, id, pv.param_def_id, pv.value, pv.is_enabled as i64],
            )?;
        }
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
    }

    fetch_edge(conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_edge(input: UpdateEdgeInput, state: State<PmState>) -> Result<GloEdge, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;

    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result = (|| -> rusqlite::Result<()> {
        conn.execute(
            "UPDATE edges SET label=?1, color=?2 WHERE id=?3",
            params![input.label, input.color, input.id],
        )?;
        conn.execute(
            "DELETE FROM edge_param_values WHERE edge_id=?1",
            params![input.id],
        )?;
        for pv in &input.param_values {
            let pv_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![pv_id, input.id, pv.param_def_id, pv.value, pv.is_enabled as i64],
            )?;
        }
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
    }

    fetch_edge(conn, &input.id).map_err(|e| e.to_string())
}

/// Restore (INSERT OR REPLACE) an edge + its param values. Shared by the Tauri
/// command and HTTP `POST /api/edges/restore` (Live Share guest undo of a delete).
pub(crate) fn restore_edge_inner(conn: &rusqlite::Connection, edge: &GloEdge) -> Result<GloEdge, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let waypoints_str = edge.waypoints.as_ref()
        .and_then(|w| serde_json::to_string(w).ok());
    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
    let result = (|| -> rusqlite::Result<()> {
        conn.execute(
            "INSERT OR REPLACE INTO edges
             (id, source_id, target_id, source_handle, target_handle, waypoints, external_id, label, color, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![edge.id, edge.source_id, edge.target_id, edge.source_handle, edge.target_handle,
                    waypoints_str, edge.external_id, edge.label, edge.color, now],
        )?;
        for pv in &edge.param_values {
            let pv_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT OR REPLACE INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![pv_id, edge.id, pv.param_def_id, pv.value, pv.is_enabled as i64],
            )?;
        }
        Ok(())
    })();
    match result {
        Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
        Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
    }
    fetch_edge(conn, &edge.id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_edge(edge: GloEdge, state: State<PmState>) -> Result<GloEdge, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    restore_edge_inner(conn, &edge)
}

#[tauri::command]
pub fn reconnect_edge(
    id: String,
    source_id: String,
    target_id: String,
    source_handle: Option<String>,
    target_handle: Option<String>,
    state: State<PmState>,
) -> Result<GloEdge, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute(
        "UPDATE edges SET source_id=?1, target_id=?2, source_handle=?3, target_handle=?4 WHERE id=?5",
        params![source_id, target_id, source_handle, target_handle, id],
    ).map_err(|e| e.to_string())?;
    fetch_edge(conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_edge_waypoints(input: UpdateEdgeWaypointsInput, state: State<PmState>) -> Result<GloEdge, String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    let waypoints_str = input.waypoints.as_ref()
        .and_then(|w| serde_json::to_string(w).ok());
    conn.execute(
        "UPDATE edges SET waypoints=?1 WHERE id=?2",
        params![waypoints_str, input.id],
    ).map_err(|e| e.to_string())?;
    fetch_edge(conn, &input.id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_edge(id: String, state: State<PmState>) -> Result<(), String> {
    let pm = state.lock().map_err(|e| e.to_string())?;
    let conn = pm.active_conn()?;
    conn.execute("DELETE FROM edges WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;
    use rusqlite::Connection;

    fn mk_input(s: &str, t: &str) -> CreateEdgeInput {
        CreateEdgeInput {
            source_id: s.into(), target_id: t.into(),
            source_handle: None, target_handle: None,
            param_values: vec![], external_id: None, color: None,
        }
    }
    fn seed_node(conn: &Connection, id: &str, x: f64, y: f64) {
        conn.execute(
            "INSERT INTO nodes (id, title, date_added, x, y) VALUES (?1, '', '2026-01-01', ?2, ?3)",
            params![id, x, y],
        ).unwrap();
    }

    #[test]
    fn resolve_handles_picks_facing_sides_when_absent() {
        let conn = Connection::open_in_memory().unwrap();
        db::init_db(&conn).unwrap();
        seed_node(&conn, "a", 0.0, 0.0);
        seed_node(&conn, "right", 500.0, 0.0); // far to the right of a
        seed_node(&conn, "below", 0.0, 500.0); // far below a

        let mut e = mk_input("a", "right");
        resolve_handles_if_absent(&conn, &mut e);
        assert_eq!((e.source_handle.as_deref(), e.target_handle.as_deref()), (Some("right"), Some("left")));

        let mut e = mk_input("a", "below");
        resolve_handles_if_absent(&conn, &mut e);
        assert_eq!((e.source_handle.as_deref(), e.target_handle.as_deref()), (Some("bottom"), Some("top")));

        let mut e = mk_input("right", "a");
        resolve_handles_if_absent(&conn, &mut e);
        assert_eq!((e.source_handle.as_deref(), e.target_handle.as_deref()), (Some("left"), Some("right")));
    }

    #[test]
    fn resolve_handles_respects_explicit_handle() {
        let conn = Connection::open_in_memory().unwrap();
        db::init_db(&conn).unwrap();
        seed_node(&conn, "a", 0.0, 0.0);
        seed_node(&conn, "b", 500.0, 0.0);
        let mut e = mk_input("a", "b");
        e.source_handle = Some("top".into());
        resolve_handles_if_absent(&conn, &mut e);
        // A caller-specified handle is never overridden (target stays unset too).
        assert_eq!(e.source_handle.as_deref(), Some("top"));
        assert_eq!(e.target_handle, None);
    }

    #[test]
    fn fetch_edge_round_trips_param_values_and_waypoints() {
        let conn = Connection::open_in_memory().unwrap();
        db::init_db(&conn).unwrap();

        // Two endpoint nodes (FK targets).
        for id in ["a", "b"] {
            conn.execute(
                "INSERT INTO nodes (id, title, date_added, x, y)
                 VALUES (?1, 'T', '2026-05-30T00:00:00Z', 0, 0)",
                params![id],
            ).unwrap();
        }
        // An edge param def for the value's FK (preset_id → seeded active preset).
        conn.execute(
            "INSERT INTO edge_param_defs (id, preset_id, display_name, param_type)
             VALUES ('ed1', (SELECT value FROM app_settings WHERE key='active_preset_id'), 'Rel', 'select')",
            [],
        ).unwrap();
        // An edge carrying waypoints + a param value.
        conn.execute(
            "INSERT INTO edges (id, source_id, target_id, waypoints, created_at)
             VALUES ('e1', 'a', 'b', '[{\"x\":1.0,\"y\":2.0}]', '2026-05-30T00:00:00Z')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
             VALUES ('pv1', 'e1', 'ed1', 'caused_by', 1)",
            [],
        ).unwrap();

        let e = fetch_edge(&conn, "e1").unwrap();
        assert_eq!(e.source_id, "a");
        assert_eq!(e.target_id, "b");
        assert_eq!(e.param_values.len(), 1);
        assert_eq!(e.param_values[0].value.as_deref(), Some("caused_by"));
        let wps = e.waypoints.expect("waypoints parsed");
        assert_eq!(wps.len(), 1);
        assert_eq!((wps[0].x, wps[0].y), (1.0, 2.0));

        assert_eq!(list_all_edges(&conn).unwrap().len(), 1, "list_all_edges returns the edge");
    }
}
