use axum::{
    Json, Router,
    extract::{Path, Query, Request, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tower_http::cors::{self, CorsLayer};
use uuid::Uuid;
use chrono::Utc;

use crate::commands::edges::{fetch_edge, list_all_edges, resolve_handles_if_absent};
use crate::commands::graph::{build_export, do_import};
use crate::commands::nodes::{data_source_to_json, fetch_node, list_all_nodes, tags_to_json, upsert_param_values};
use crate::commands::regions::{fetch_region, list_all_regions};
use crate::commands::settings::load_settings;
use crate::core::trace::{compute_trace, TraceDirection, TraceEdge, TraceResult};
use crate::events::ChangeEvent;
use crate::models::*;
use crate::{PmState, TabMeta};

#[derive(Clone)]
pub struct AppState {
    pub pm: PmState,
    pub app: AppHandle,
    /// Broadcast bus for the SSE change-event stream (`GET /api/events`).
    pub events: tokio::sync::broadcast::Sender<ChangeEvent>,
    /// Presence relay for `GET /ws` (cursors/selections). `Some` only on the
    /// hosted-session server; the local API leaves it `None`.
    pub presence: Option<tokio::sync::broadcast::Sender<String>>,
}

impl AppState {
    fn notify(&self) {
        let _ = self.app.emit("api:graph-changed", ());
    }
}

/// Derive a change event from a successful mutating request. Returns `None` for
/// reads and anything that doesn't map to a graph mutation. Centralizing this in
/// one middleware (rather than threading an event through ~25 handlers) keeps the
/// handlers untouched and the mapping in a single readable place.
fn derive_event(method: &axum::http::Method, path: &str) -> Option<ChangeEvent> {
    use axum::http::Method;
    let action = match *method {
        Method::POST => "created",
        Method::PUT | Method::PATCH => "updated",
        Method::DELETE => "deleted",
        _ => return None,
    };
    let p = path.strip_prefix("/api/")?;
    let seg0 = p.split('/').next().unwrap_or("");
    let kind = match seg0 {
        "import" => return Some(ChangeEvent::of("graph", "reloaded")),
        "settings" => return Some(ChangeEvent::of("settings", "updated")),
        "tabs" => {
            if p.contains("/activate") { return Some(ChangeEvent::of("tab", "activated")); }
            "tab"
        }
        "nodes" if p.contains("/links") => "link",
        "nodes" if p.contains("/media") => "media",
        "nodes" => "node",
        "edges" => "edge",
        "regions" => "region",
        "links" => "link",
        "media" => "media",
        _ => return None,
    };
    Some(ChangeEvent::of(kind, action))
}

/// Middleware: after a successful (2xx) mutating request, broadcast a typed
/// `ChangeEvent` to SSE subscribers. Runs inside `auth_layer`, so only
/// authorized/enabled requests can produce events.
async fn event_layer(
    State(state): State<AppState>,
    req: Request,
    next: Next,
) -> Response {
    let method = req.method().clone();
    let path = req.uri().path().to_string();
    let resp = next.run(req).await;
    if resp.status().is_success() {
        if let Some(ev) = derive_event(&method, &path) {
            let _ = state.events.send(ev); // Err only means no subscribers — fine.
        }
    }
    resp
}

/// `GET /api/events` — Server-Sent Events stream of `ChangeEvent`s. One-way
/// (server→subscriber); clients still mutate via the normal HTTP endpoints.
/// Keeps the SDK dependency-free (plain line-reading) and works with browser
/// `EventSource`. Auth-gated like the rest of the API.
async fn get_events(
    State(state): State<AppState>,
) -> axum::response::sse::Sse<impl tokio_stream::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>> {
    use axum::response::sse::{Event, KeepAlive, Sse};
    use tokio_stream::StreamExt;
    let rx = state.events.subscribe();
    let stream = tokio_stream::wrappers::BroadcastStream::new(rx)
        .filter_map(|res| res.ok())
        .map(|ev| Ok(Event::default().json_data(ev).unwrap_or_else(|_| Event::default().comment("serialize error"))));
    Sse::new(stream).keep_alive(KeepAlive::default())
}

// ── Error type ────────────────────────────────────────────────────────────────

struct ApiError(StatusCode, String);

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        #[derive(Serialize)]
        struct Body { error: String }
        (self.0, Json(Body { error: self.1 })).into_response()
    }
}

impl From<String> for ApiError {
    fn from(s: String) -> Self { ApiError(StatusCode::INTERNAL_SERVER_ERROR, s) }
}

// ── DB helper (runs closure on blocking thread) ───────────────────────────────

async fn db<T, F>(state: &AppState, f: F) -> Result<T, ApiError>
where
    T: Send + 'static,
    F: FnOnce(&Connection) -> Result<T, String> + Send + 'static,
{
    let pm = state.pm.clone();
    tokio::task::spawn_blocking(move || {
        let pm = pm.lock().map_err(|_| "DB lock poisoned".to_string())?;
        let conn = pm.active_conn()?;
        f(conn)
    })
    .await
    .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .map_err(ApiError::from)
}

/// Like `db`, but maps a `None` result from the closure to a `404 Not Found`.
/// Lets a handler distinguish "resource doesn't exist" (404) from a real failure
/// (500) without the `db` helper having to carry a status code: the closure
/// returns `Ok(None)` when the row is absent, `Err(..)` for an actual error.
async fn db_find<T, F>(state: &AppState, not_found: String, f: F) -> Result<T, ApiError>
where
    T: Send + 'static,
    F: FnOnce(&Connection) -> Result<Option<T>, String> + Send + 'static,
{
    db(state, f).await?.ok_or(ApiError(StatusCode::NOT_FOUND, not_found))
}

// ── Settings helper ───────────────────────────────────────────────────────────

fn get_setting(conn: &Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT value FROM app_settings WHERE key = ?1",
        params![key],
        |row| row.get(0),
    ).ok()
}

// ── Auth middleware ───────────────────────────────────────────────────────────

/// The only browser origins allowed to call the loopback API: the Tauri webview's
/// own origin (which in practice uses IPC, not this HTTP API, but allow it
/// defensively). Any other `Origin` means a real web page is calling us.
fn is_trusted_local_origin(origin: &str) -> bool {
    matches!(origin, "http://tauri.localhost" | "https://tauri.localhost" | "tauri://localhost")
}

/// Constant-time byte-equality for comparing auth/session tokens, so a timing
/// side-channel can't reveal how many leading bytes matched. (Length inequality
/// still short-circuits — token length isn't the secret; our tokens are
/// fixed-length anyway.)
fn ct_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}

async fn auth_layer(
    State(state): State<AppState>,
    headers: HeaderMap,
    req: Request,
    next: Next,
) -> Response {
    // Block browser cross-origin requests outright. The local API is for
    // programmatic clients (the SDK / curl / agents), which send no `Origin`
    // header; a website fetching http://127.0.0.1:57321 always carries its own
    // Origin. This stops a page the user merely visits from reading their graph or
    // issuing mutations against the loopback API (localhost-CSRF / data-exfil) —
    // and runs before the diagnostics bypass below, so even ping/tabs/stats are
    // protected from the browser.
    if let Some(origin) = headers.get(axum::http::header::ORIGIN).and_then(|v| v.to_str().ok()) {
        if !is_trusted_local_origin(origin) {
            return ApiError(
                StatusCode::FORBIDDEN,
                "Cross-origin requests are not allowed on the local API.".to_string(),
            ).into_response();
        }
    }

    let path = req.uri().path();
    // Diagnostics bypass auth/enabled — but only as GET reads. Mutations on the
    // same paths (e.g. POST /api/tabs) must still pass the auth layer.
    if req.method() == axum::http::Method::GET
        && (path == "/api/ping" || path == "/api/tabs" || path == "/api/stats")
    {
        return next.run(req).await;
    }

    // Enable flag + token are global (server-wide), not per-project — so the API
    // doesn't flip on/off as the user creates or switches projects.
    let (enabled, token) = tokio::task::block_in_place(|| {
        let pm = state.pm.lock().unwrap_or_else(|e| e.into_inner());
        let cfg = crate::load_api_config(&pm.projects_dir);
        (cfg.enabled, cfg.token)
    });

    if !enabled {
        return ApiError(
            StatusCode::SERVICE_UNAVAILABLE,
            "API is disabled. Enable it in Preferences -> API.".to_string(),
        ).into_response();
    }

    if !token.is_empty() {
        let provided = headers
            .get("authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "))
            .unwrap_or("");
        if !ct_eq(provided.as_bytes(), token.as_bytes()) {
            return ApiError(
                StatusCode::UNAUTHORIZED,
                "Invalid or missing Bearer token".to_string(),
            ).into_response();
        }
    }

    next.run(req).await
}

// ── Query param structs ───────────────────────────────────────────────────────

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct NodeListQuery {
    external_id: Option<String>,
    tag: Option<String>,
    search: Option<String>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct EdgeListQuery {
    source_id: Option<String>,
    target_id: Option<String>,
    external_id: Option<String>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct NeighborsQuery {
    direction: Option<String>, // "in" | "out" | "both" (default)
}

// ── /api/ping ─────────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct PingResponse { status: &'static str, version: &'static str }

async fn ping() -> Json<PingResponse> {
    Json(PingResponse { status: "ok", version: "1.0" })
}

// ── /api/tabs ─────────────────────────────────────────────────────────────────

async fn get_tabs_route(State(state): State<AppState>) -> Json<Vec<TabMeta>> {
    let pm = state.pm.clone();
    let tabs = tokio::task::spawn_blocking(move || {
        let mut pm = pm.lock().unwrap_or_else(|e| e.into_inner());
        // Recompute the active tab's dirty here so an API client that writes then
        // reads the tab list sees an accurate flag without depending on the desktop
        // window's (debounced) recheck.
        pm.recompute_active_dirty();
        pm.tab_metas()
    })
    .await
    .unwrap_or_default();
    Json(tabs)
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct CreateTabBody {
    name: Option<String>,
    /// Built-in preset id to seed the new project's schema. Defaults to the
    /// "Blank" preset (no params). See NewProjectDialog for the id table.
    preset_id: Option<String>,
}

const BLANK_PRESET_ID: &str = "00000000-0000-0000-0000-000000000005";

/// `POST /api/tabs` — create a new project tab and make it active (so subsequent
/// API writes land in it). Lets a script or AI agent provision a fresh project
/// rather than only operating on whatever tab the user has focused. Returns the
/// updated tab list (mirrors the Tauri `create_tab`); `201 Created`.
async fn post_tab(
    State(state): State<AppState>,
    Json(body): Json<CreateTabBody>,
) -> Result<(StatusCode, Json<Vec<TabMeta>>), ApiError> {
    let pm_state = state.pm.clone();
    let name = body.name.clone().unwrap_or_else(|| "Untitled Project".to_string());
    let preset_id = body.preset_id.clone().unwrap_or_else(|| BLANK_PRESET_ID.to_string());
    let metas = tokio::task::spawn_blocking(move || -> Result<Vec<TabMeta>, String> {
        let mut pm = pm_state.lock().map_err(|e| e.to_string())?;
        // Same code path as the desktop New Project flow — see
        // ProjectManager::create_project_tab.
        pm.create_project_tab(name, preset_id)?;
        Ok(pm.tab_metas())
    })
    .await
    .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .map_err(ApiError::from)?;
    let _ = state.app.emit("tabs:changed", &metas);
    state.notify(); // the active project changed → refresh the canvas
    Ok((StatusCode::CREATED, Json(metas)))
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct DeleteTabQuery {
    /// Also delete the project's on-disk SQLite files. Default false (the tab is
    /// removed from the session but the `.db` stays on disk, reopenable by path).
    delete_db: Option<bool>,
}

/// `DELETE /api/tabs/{id}` — close a project tab (mirrors the Tauri `close_tab`).
/// `?deleteDb=true` also removes its on-disk database. If the closed tab was
/// active, the lowest-ordered remaining tab becomes active (or none, which sends
/// the desktop UI to the Start screen). Idempotent — deleting an unknown id is a
/// no-op. Returns the updated tab list.
async fn delete_tab(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(q): Query<DeleteTabQuery>,
) -> Result<Json<Vec<TabMeta>>, ApiError> {
    let pm_state = state.pm.clone();
    let delete_db = q.delete_db.unwrap_or(false);
    let metas = tokio::task::spawn_blocking(move || -> Result<Vec<TabMeta>, String> {
        let mut pm = pm_state.lock().map_err(|e| e.to_string())?;
        // Same code path as the desktop Close Tab flow — see
        // ProjectManager::close_project_tab.
        pm.close_project_tab(&id, delete_db)?;
        Ok(pm.tab_metas())
    })
    .await
    .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .map_err(ApiError::from)?;
    let _ = state.app.emit("tabs:changed", &metas);
    state.notify();
    Ok(Json(metas))
}

/// `POST /api/tabs/{id}/activate` — switch the active project. Subsequent API
/// reads/writes target it. `404` if the tab id is unknown.
async fn post_tab_activate(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<TabMeta>>, ApiError> {
    let pm_state = state.pm.clone();
    let id2 = id.clone();
    let metas = tokio::task::spawn_blocking(move || -> Result<Option<Vec<TabMeta>>, String> {
        let mut pm = pm_state.lock().map_err(|e| e.to_string())?;
        if !pm.tabs.contains_key(&id2) { return Ok(None); }
        pm.active_tab_id = id2;
        pm.save_tabs_json()?;
        Ok(Some(pm.tab_metas()))
    })
    .await
    .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .map_err(ApiError::from)?
    .ok_or(ApiError(StatusCode::NOT_FOUND, format!("Tab '{}' not found", id)))?;
    let _ = state.app.emit("tabs:changed", &metas);
    state.notify();
    Ok(Json(metas))
}

// ── /api/graph & /api/import ──────────────────────────────────────────────────

async fn get_graph(State(state): State<AppState>) -> Result<Json<GraphExport>, ApiError> {
    let export = db(&state, build_export).await?;
    Ok(Json(export))
}

async fn post_import(
    State(state): State<AppState>,
    Json(export): Json<GraphExport>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| do_import(conn, export)).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

// ── /api/settings ─────────────────────────────────────────────────────────────

async fn get_settings(State(state): State<AppState>) -> Result<Json<GraphSettings>, ApiError> {
    let settings = db(&state, |conn| {
        load_settings(conn).map_err(|e| e.to_string())
    }).await?;
    Ok(Json(settings))
}

// ── /api/nodes ────────────────────────────────────────────────────────────────

async fn list_nodes(
    State(state): State<AppState>,
    Query(q): Query<NodeListQuery>,
) -> Result<Json<Vec<GloNode>>, ApiError> {
    let nodes = db(&state, move |conn| {
        if let Some(ext_id) = &q.external_id {
            let id: Option<String> = conn.query_row(
                "SELECT id FROM nodes WHERE external_id = ?1",
                params![ext_id],
                |row| row.get(0),
            ).ok();
            return match id {
                Some(id) => fetch_node(conn, &id).map(|n| vec![n]).map_err(|e| e.to_string()),
                None => Ok(vec![]),
            };
        }
        let mut all = list_all_nodes(conn)?;
        if let Some(tag) = &q.tag {
            all.retain(|n| n.tags.contains(tag));
        }
        if let Some(search) = &q.search {
            let s = search.to_lowercase();
            all.retain(|n| {
                n.title.to_lowercase().contains(&s)
                    || n.description.as_deref().unwrap_or("").to_lowercase().contains(&s)
            });
        }
        Ok(all)
    }).await?;
    Ok(Json(nodes))
}

async fn post_node(
    State(state): State<AppState>,
    Json(input): Json<CreateNodeInput>,
) -> Result<(StatusCode, Json<GloNode>), ApiError> {
    let node = db(&state, move |conn| {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let tags_json = tags_to_json(&input.tags);
        let ds_json = data_source_to_json(input.data_source.as_ref());

        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        let inner = || -> rusqlite::Result<()> {
            conn.execute(
                "INSERT INTO nodes
                 (id, title, description, event_date, date_added, x, y, color,
                  confidence, impact_magnitude, external_id, tags, data_source, kind,
                  width, height, render_markdown, show_thumbnail)
                 VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18)",
                params![id, input.title, input.description, input.event_date, now,
                        input.x, input.y, input.color, input.confidence, input.impact_magnitude,
                        input.external_id, tags_json, ds_json, input.kind,
                        input.width, input.height, input.render_markdown as i64, input.show_thumbnail as i64],
            )?;
            upsert_param_values(conn, &id, &input.param_values)?;
            Ok(())
        };
        match inner() {
            Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
            Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
        }
        fetch_node(conn, &id).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(node)))
}

async fn post_nodes_batch(
    State(state): State<AppState>,
    Json(inputs): Json<Vec<CreateNodeInput>>,
) -> Result<(StatusCode, Json<Vec<GloNode>>), ApiError> {
    let nodes = db(&state, move |conn| {
        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        let mut ids = Vec::new();
        let mut inner = || -> rusqlite::Result<()> {
            for input in &inputs {
                let id = Uuid::new_v4().to_string();
                let now = Utc::now().to_rfc3339();
                let tags_json = tags_to_json(&input.tags);
                let ds_json = data_source_to_json(input.data_source.as_ref());
                conn.execute(
                    "INSERT INTO nodes
                     (id, title, description, event_date, date_added, x, y, color,
                      confidence, impact_magnitude, external_id, tags, data_source, kind,
                      width, height, render_markdown, show_thumbnail)
                     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18)",
                    params![id, input.title, input.description, input.event_date, now,
                            input.x, input.y, input.color, input.confidence, input.impact_magnitude,
                            input.external_id, tags_json, ds_json, input.kind,
                            input.width, input.height, input.render_markdown as i64, input.show_thumbnail as i64],
                )?;
                upsert_param_values(conn, &id, &input.param_values)?;
                ids.push(id);
            }
            Ok(())
        };
        match inner() {
            Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
            Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
        }
        ids.iter()
            .map(|id| fetch_node(conn, id).map_err(|e| e.to_string()))
            .collect()
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(nodes)))
}

/// `PUT /api/nodes` — upsert by `externalId`. If a node with that external id
/// exists it is PATCH-merged (omitted fields, including x/y, are preserved — so
/// re-streaming data doesn't reset a user's layout); otherwise a new node is
/// created. Returns 200 on update, 201 on create. Idempotent — safe to re-run.
async fn put_node(
    State(state): State<AppState>,
    Json(patch): Json<PatchNodeBody>,
) -> Result<(StatusCode, Json<GloNode>), ApiError> {
    let ext = match patch.external_id.clone() {
        Some(e) if !e.is_empty() => e,
        _ => return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "PUT /api/nodes upserts by externalId — include a non-empty externalId".to_string(),
        )),
    };
    let (created, node) = db(&state, move |conn| {
        let existing: Option<String> = conn
            .query_row("SELECT id FROM nodes WHERE external_id = ?1", params![ext], |r| r.get(0))
            .optional()
            .map_err(|e| e.to_string())?;
        match existing {
            // Update: PATCH-merge so unspecified fields stay as they were.
            Some(id) => {
                let cur = fetch_node(conn, &id).map_err(|e| e.to_string())?;
                let tags = patch.tags.clone().unwrap_or(cur.tags);
                let tags_json = tags_to_json(&tags);
                let ds_json = data_source_to_json(patch.data_source.as_ref().or(cur.data_source.as_ref()));
                conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
                if let Err(e) = conn.execute(
                    "UPDATE nodes SET title=?2, description=?3, event_date=?4, x=?5, y=?6,
                     color=?7, confidence=?8, impact_magnitude=?9, tags=?10, data_source=?11,
                     kind=?12, width=?13, height=?14, render_markdown=?15, show_thumbnail=?16 WHERE id=?1",
                    params![
                        id,
                        patch.title.clone().unwrap_or(cur.title),
                        patch.description.clone().or(cur.description),
                        patch.event_date.clone().or(cur.event_date),
                        patch.x.unwrap_or(cur.x),
                        patch.y.unwrap_or(cur.y),
                        patch.color.clone().or(cur.color),
                        patch.confidence.or(cur.confidence),
                        patch.impact_magnitude.or(cur.impact_magnitude),
                        tags_json,
                        ds_json,
                        patch.kind.clone().unwrap_or(cur.kind),
                        patch.width.or(cur.width),
                        patch.height.or(cur.height),
                        patch.render_markdown.unwrap_or(cur.render_markdown) as i64,
                        patch.show_thumbnail.unwrap_or(cur.show_thumbnail) as i64,
                    ],
                ) {
                    let _ = conn.execute_batch("ROLLBACK");
                    return Err(e.to_string());
                }
                if let Some(pvs) = &patch.param_values {
                    if let Err(e) = upsert_param_values(conn, &id, pvs) {
                        let _ = conn.execute_batch("ROLLBACK");
                        return Err(e.to_string());
                    }
                }
                conn.execute_batch("COMMIT").map_err(|e| e.to_string())?;
                let n = fetch_node(conn, &id).map_err(|e| e.to_string())?;
                Ok((false, n))
            }
            // Create: insert with provided fields + sensible defaults.
            None => {
                let id = Uuid::new_v4().to_string();
                let now = Utc::now().to_rfc3339();
                let tags = patch.tags.clone().unwrap_or_default();
                let tags_json = tags_to_json(&tags);
                let ds_json = data_source_to_json(patch.data_source.as_ref());
                conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
                let inner = || -> rusqlite::Result<()> {
                    conn.execute(
                        "INSERT INTO nodes
                         (id, title, description, event_date, date_added, x, y, color,
                          confidence, impact_magnitude, external_id, tags, data_source, kind, width, height,
                          render_markdown, show_thumbnail)
                         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18)",
                        params![
                            id, patch.title.clone().unwrap_or_default(), patch.description.clone(),
                            patch.event_date.clone(), now, patch.x.unwrap_or(0.0), patch.y.unwrap_or(0.0),
                            patch.color.clone(), patch.confidence, patch.impact_magnitude,
                            ext, tags_json, ds_json,
                            patch.kind.clone().unwrap_or_else(|| "standard".to_string()),
                            patch.width, patch.height,
                            patch.render_markdown.unwrap_or(true) as i64,
                            patch.show_thumbnail.unwrap_or(true) as i64
                        ],
                    )?;
                    if let Some(pvs) = &patch.param_values {
                        upsert_param_values(conn, &id, pvs)?;
                    }
                    Ok(())
                };
                match inner() {
                    Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
                    Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
                }
                let n = fetch_node(conn, &id).map_err(|e| e.to_string())?;
                Ok((true, n))
            }
        }
    }).await?;
    state.notify();
    Ok((if created { StatusCode::CREATED } else { StatusCode::OK }, Json(node)))
}

async fn get_node(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<GloNode>, ApiError> {
    let id2 = id.clone();
    let node = db_find(&state, format!("Node '{}' not found", id), move |conn| {
        Ok(fetch_node(conn, &id2).ok())
    }).await?;
    Ok(Json(node))
}

async fn patch_node(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(patch): Json<PatchNodeBody>,
) -> Result<Json<GloNode>, ApiError> {
    let id2 = id.clone();
    let node = db_find(&state, format!("Node '{}' not found", id), move |conn| {
        let cur = match fetch_node(conn, &id2) { Ok(c) => c, Err(_) => return Ok(None) };
        let tags = patch.tags.as_ref().unwrap_or(&cur.tags);
        let tags_json = tags_to_json(tags);
        let ds_json = data_source_to_json(patch.data_source.as_ref().or(cur.data_source.as_ref()));

        // UPDATE + param upsert in one transaction (matches the Tauri update_node_inner).
        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        if let Err(e) = conn.execute(
            "UPDATE nodes SET title=?2, description=?3, event_date=?4, x=?5, y=?6,
             color=?7, confidence=?8, impact_magnitude=?9, external_id=?10,
             tags=?11, data_source=?12, kind=?13, width=?14, height=?15,
             is_pinned=?16, is_expand_pinned=?17, z_order=?18, render_markdown=?19, show_thumbnail=?20 WHERE id=?1",
            params![
                id2,
                patch.title.unwrap_or(cur.title),
                patch.description.or(cur.description),
                patch.event_date.or(cur.event_date),
                patch.x.unwrap_or(cur.x),
                patch.y.unwrap_or(cur.y),
                patch.color.or(cur.color),
                patch.confidence.or(cur.confidence),
                patch.impact_magnitude.or(cur.impact_magnitude),
                patch.external_id.or(cur.external_id),
                tags_json,
                ds_json,
                patch.kind.unwrap_or(cur.kind),
                patch.width.or(cur.width),
                patch.height.or(cur.height),
                patch.is_pinned.unwrap_or(cur.is_pinned) as i64,
                patch.is_expand_pinned.unwrap_or(cur.is_expand_pinned) as i64,
                patch.z_order.unwrap_or(cur.z_order),
                patch.render_markdown.unwrap_or(cur.render_markdown) as i64,
                patch.show_thumbnail.unwrap_or(cur.show_thumbnail) as i64,
            ],
        ) {
            let _ = conn.execute_batch("ROLLBACK");
            return Err(e.to_string());
        }

        if let Some(pvs) = patch.param_values {
            if let Err(e) = upsert_param_values(conn, &id2, &pvs) {
                let _ = conn.execute_batch("ROLLBACK");
                return Err(e.to_string());
            }
        }
        conn.execute_batch("COMMIT").map_err(|e| e.to_string())?;

        fetch_node(conn, &id2).map(Some).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(Json(node))
}

async fn delete_node_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| {
        conn.execute("DELETE FROM nodes WHERE id=?1", params![id])
            .map(|_| ())
            .map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

async fn get_node_edges(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<GloEdge>>, ApiError> {
    let edges = db(&state, move |conn| {
        let all = list_all_edges(conn)?;
        Ok(all.into_iter().filter(|e| e.source_id == id || e.target_id == id).collect())
    }).await?;
    Ok(Json(edges))
}

async fn get_node_neighbors(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(q): Query<NeighborsQuery>,
) -> Result<Json<Vec<GloNode>>, ApiError> {
    let nodes = db(&state, move |conn| {
        let direction = q.direction.as_deref().unwrap_or("both");
        let sql = match direction {
            "in"  => "SELECT DISTINCT source_id FROM edges WHERE target_id = ?1",
            "out" => "SELECT DISTINCT target_id FROM edges WHERE source_id = ?1",
            _     => "SELECT DISTINCT source_id FROM edges WHERE target_id = ?1
                      UNION SELECT DISTINCT target_id FROM edges WHERE source_id = ?1",
        };
        let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
        let ids: Vec<String> = stmt
            .query_map(params![id], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        ids.iter()
            .map(|nid| fetch_node(conn, nid).map_err(|e| e.to_string()))
            .collect()
    }).await?;
    Ok(Json(nodes))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PositionUpdate { id: String, x: f64, y: f64 }

async fn patch_nodes_positions(
    State(state): State<AppState>,
    Json(updates): Json<Vec<PositionUpdate>>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| {
        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        let r = (|| -> rusqlite::Result<()> {
            for u in &updates {
                conn.execute("UPDATE nodes SET x=?2, y=?3 WHERE id=?1", params![u.id, u.x, u.y])?;
            }
            Ok(())
        })();
        match r {
            Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string()),
            Err(e) => { let _ = conn.execute_batch("ROLLBACK"); Err(e.to_string()) }
        }
    }).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

// ── /api/stats ────────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct GraphStats { nodes: i64, edges: i64, regions: i64, links: i64, media: i64 }

async fn get_stats(State(state): State<AppState>) -> Result<Json<GraphStats>, ApiError> {
    let stats = db(&state, |conn| {
        let count = |sql: &str| -> Result<i64, String> {
            conn.query_row(sql, [], |r| r.get(0)).map_err(|e| e.to_string())
        };
        Ok(GraphStats {
            nodes:   count("SELECT COUNT(*) FROM nodes")?,
            edges:   count("SELECT COUNT(*) FROM edges")?,
            regions: count("SELECT COUNT(*) FROM regions")?,
            links:   count("SELECT COUNT(*) FROM node_links")?,
            media:   count("SELECT COUNT(*) FROM node_media")?,
        })
    }).await?;
    Ok(Json(stats))
}

// ── /api/edges ────────────────────────────────────────────────────────────────

async fn list_edges(
    State(state): State<AppState>,
    Query(q): Query<EdgeListQuery>,
) -> Result<Json<Vec<GloEdge>>, ApiError> {
    let edges = db(&state, move |conn| {
        let mut all = list_all_edges(conn)?;
        if let Some(sid) = &q.source_id { all.retain(|e| &e.source_id == sid); }
        if let Some(tid) = &q.target_id { all.retain(|e| &e.target_id == tid); }
        if let Some(ext) = &q.external_id { all.retain(|e| e.external_id.as_deref() == Some(ext.as_str())); }
        Ok(all)
    }).await?;
    Ok(Json(edges))
}

#[derive(Deserialize)]
struct TraceQuery {
    from: String,
    direction: Option<String>,
}

/// `GET /api/trace?from={nodeId}&direction=downstream|upstream` — reachability
/// over the active project's directed edges. Thin wrapper over the shared engine
/// `crate::core::trace::compute_trace` (same logic the local `trace` Tauri command
/// and the canvas overlay use), so all callers agree. Pure topology — it maps
/// relationships, it doesn't simulate them. `400` on a bad direction, `404` if
/// `from` is unknown. Read-only; does not emit `api:graph-changed`.
async fn get_trace(
    State(state): State<AppState>,
    Query(q): Query<TraceQuery>,
) -> Result<Json<TraceResult>, ApiError> {
    let direction = match q.direction.as_deref().unwrap_or("downstream") {
        "downstream" => TraceDirection::Downstream,
        "upstream" => TraceDirection::Upstream,
        _ => return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "direction must be 'downstream' or 'upstream'".to_string(),
        )),
    };
    let from = q.from.clone();
    let dbg = std::env::var("GLOGRAPH_DEBUG").is_ok();
    let resp = db_find(&state, format!("Node '{}' not found", q.from), move |conn| {
        // The seed must exist, otherwise the trace is meaningless → 404.
        let exists: Option<i64> = conn
            .query_row("SELECT 1 FROM nodes WHERE id = ?1", params![from], |r| r.get(0))
            .optional()
            .map_err(|e| e.to_string())?;
        if exists.is_none() {
            return Ok(None);
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
        let result = compute_trace(&from, &te, direction);
        if dbg {
            eprintln!(
                "[api trace] seed={} reached={} maxHop={}",
                from, result.reached_count, result.max_hop
            );
        }
        Ok(Some(result))
    })
    .await?;
    Ok(Json(resp))
}

async fn post_edge(
    State(state): State<AppState>,
    Json(input): Json<CreateEdgeInput>,
) -> Result<(StatusCode, Json<GloEdge>), ApiError> {
    let edge = db(&state, move |conn| {
        let mut input = input;
        resolve_handles_if_absent(conn, &mut input);
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO edges (id, source_id, target_id, source_handle, target_handle, external_id, color, created_at)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
            params![id, input.source_id, input.target_id, input.source_handle,
                    input.target_handle, input.external_id, input.color, now],
        ).map_err(|e| e.to_string())?;
        for pv in &input.param_values {
            let pv_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT OR REPLACE INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                 VALUES (?1,?2,?3,?4,?5)",
                params![pv_id, id, pv.param_def_id, pv.value, pv.is_enabled as i64],
            ).map_err(|e| e.to_string())?;
        }
        fetch_edge(conn, &id).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(edge)))
}

async fn post_edges_batch(
    State(state): State<AppState>,
    Json(inputs): Json<Vec<CreateEdgeInput>>,
) -> Result<(StatusCode, Json<Vec<GloEdge>>), ApiError> {
    let edges = db(&state, move |conn| {
        let mut inputs = inputs;
        // Pick closest handles for any edge that didn't specify them (read-only),
        // before opening the write transaction.
        for input in inputs.iter_mut() { resolve_handles_if_absent(conn, input); }
        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        let mut ids = Vec::new();
        let mut inner = || -> rusqlite::Result<()> {
            for input in &inputs {
                let id = Uuid::new_v4().to_string();
                let now = Utc::now().to_rfc3339();
                conn.execute(
                    "INSERT INTO edges (id, source_id, target_id, source_handle, target_handle, external_id, color, created_at)
                     VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
                    params![id, input.source_id, input.target_id, input.source_handle,
                            input.target_handle, input.external_id, input.color, now],
                )?;
                for pv in &input.param_values {
                    let pv_id = Uuid::new_v4().to_string();
                    conn.execute(
                        "INSERT OR REPLACE INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                         VALUES (?1,?2,?3,?4,?5)",
                        params![pv_id, id, pv.param_def_id, pv.value, pv.is_enabled as i64],
                    )?;
                }
                ids.push(id);
            }
            Ok(())
        };
        match inner() {
            Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
            Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e.to_string()); }
        }
        ids.iter()
            .map(|id| fetch_edge(conn, id).map_err(|e| e.to_string()))
            .collect()
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(edges)))
}

/// `PUT /api/edges` — upsert by `externalId`. Existing edge → its endpoints,
/// handles, colour and param values are replaced; otherwise a new edge is
/// created. Returns 200 on update, 201 on create. Idempotent.
async fn put_edge(
    State(state): State<AppState>,
    Json(input): Json<CreateEdgeInput>,
) -> Result<(StatusCode, Json<GloEdge>), ApiError> {
    let ext = match input.external_id.clone() {
        Some(e) if !e.is_empty() => e,
        _ => return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "PUT /api/edges upserts by externalId — include a non-empty externalId".to_string(),
        )),
    };
    let (created, edge) = db(&state, move |conn| {
        let mut input = input;
        // Upsert without handles → connect from the nearest sides (insert and the
        // endpoint-replacing update both use the resolved handles below).
        resolve_handles_if_absent(conn, &mut input);
        let existing: Option<String> = conn
            .query_row("SELECT id FROM edges WHERE external_id = ?1", params![ext], |r| r.get(0))
            .optional()
            .map_err(|e| e.to_string())?;
        // Endpoint/colour update (or insert) + param replacement in one transaction.
        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        let r: Result<(String, bool), String> = (|| {
        let (eid, created) = match existing {
            Some(id) => {
                conn.execute(
                    "UPDATE edges SET source_id=?2, target_id=?3, source_handle=?4, target_handle=?5, color=?6 WHERE id=?1",
                    params![id, input.source_id, input.target_id, input.source_handle, input.target_handle, input.color],
                ).map_err(|e| e.to_string())?;
                conn.execute("DELETE FROM edge_param_values WHERE edge_id=?1", params![id])
                    .map_err(|e| e.to_string())?;
                (id, false)
            }
            None => {
                let id = Uuid::new_v4().to_string();
                let now = Utc::now().to_rfc3339();
                conn.execute(
                    "INSERT INTO edges (id, source_id, target_id, source_handle, target_handle, external_id, color, created_at)
                     VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
                    params![id, input.source_id, input.target_id, input.source_handle,
                            input.target_handle, ext, input.color, now],
                ).map_err(|e| e.to_string())?;
                (id, true)
            }
        };
        for pv in &input.param_values {
            let pv_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT OR REPLACE INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                 VALUES (?1,?2,?3,?4,?5)",
                params![pv_id, eid, pv.param_def_id, pv.value, pv.is_enabled as i64],
            ).map_err(|e| e.to_string())?;
        }
        Ok((eid, created))
        })();
        let (eid, created) = match r {
            Ok(v) => { conn.execute_batch("COMMIT").map_err(|e| e.to_string())?; v }
            Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e); }
        };
        let e = fetch_edge(conn, &eid).map_err(|e| e.to_string())?;
        Ok((created, e))
    }).await?;
    state.notify();
    Ok((if created { StatusCode::CREATED } else { StatusCode::OK }, Json(edge)))
}

async fn get_edge(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<GloEdge>, ApiError> {
    let id2 = id.clone();
    let edge = db_find(&state, format!("Edge '{}' not found", id), move |conn| {
        Ok(fetch_edge(conn, &id2).ok())
    }).await?;
    Ok(Json(edge))
}

async fn patch_edge(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(patch): Json<PatchEdgeBody>,
) -> Result<Json<GloEdge>, ApiError> {
    let id2 = id.clone();
    let edge = db_find(&state, format!("Edge '{}' not found", id), move |conn| {
        let exists = conn
            .query_row("SELECT 1 FROM edges WHERE id=?1", params![id2], |_| Ok(()))
            .optional()
            .map_err(|e| e.to_string())?
            .is_some();
        if !exists { return Ok(None); }

        // All field updates + the param replacement run in one transaction.
        conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;
        let w: Result<(), String> = (|| {
        if let Some(ext_id) = patch.external_id {
            conn.execute(
                "UPDATE edges SET external_id=?2 WHERE id=?1",
                params![id2, ext_id],
            ).map_err(|e| e.to_string())?;
        }
        if let Some(label) = patch.label {
            conn.execute(
                "UPDATE edges SET label=?2 WHERE id=?1",
                params![id2, label],
            ).map_err(|e| e.to_string())?;
        }
        if let Some(color) = patch.color {
            conn.execute(
                "UPDATE edges SET color=?2 WHERE id=?1",
                params![id2, color],
            ).map_err(|e| e.to_string())?;
        }
        // Reconnect: rewrite an endpoint (and its handle) together.
        if let Some(source_id) = patch.source_id {
            conn.execute(
                "UPDATE edges SET source_id=?2, source_handle=?3 WHERE id=?1",
                params![id2, source_id, patch.source_handle],
            ).map_err(|e| e.to_string())?;
        }
        if let Some(target_id) = patch.target_id {
            conn.execute(
                "UPDATE edges SET target_id=?2, target_handle=?3 WHERE id=?1",
                params![id2, target_id, patch.target_handle],
            ).map_err(|e| e.to_string())?;
        }
        if let Some(pvs) = patch.param_values {
            conn.execute("DELETE FROM edge_param_values WHERE edge_id=?1", params![id2])
                .map_err(|e| e.to_string())?;
            for pv in &pvs {
                let pv_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO edge_param_values (id, edge_id, param_def_id, value, is_enabled)
                     VALUES (?1,?2,?3,?4,?5)",
                    params![pv_id, id2, pv.param_def_id, pv.value, pv.is_enabled as i64],
                ).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
        })();
        match w {
            Ok(()) => conn.execute_batch("COMMIT").map_err(|e| e.to_string())?,
            Err(e) => { let _ = conn.execute_batch("ROLLBACK"); return Err(e); }
        }
        fetch_edge(conn, &id2).map(Some).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(Json(edge))
}

async fn delete_edge_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| {
        conn.execute("DELETE FROM edges WHERE id=?1", params![id])
            .map(|_| ())
            .map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

// ── /api/regions ──────────────────────────────────────────────────────────────

async fn list_regions(State(state): State<AppState>) -> Result<Json<Vec<GloRegion>>, ApiError> {
    let regions = db(&state, list_all_regions).await?;
    Ok(Json(regions))
}

async fn post_region(
    State(state): State<AppState>,
    Json(input): Json<CreateRegionInput>,
) -> Result<(StatusCode, Json<GloRegion>), ApiError> {
    let region = db(&state, move |conn| {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO regions (id, title, x, y, width, height, color, created_at)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
            params![id, input.title, input.x, input.y, input.width, input.height, input.color, now],
        ).map_err(|e| e.to_string())?;
        fetch_region(conn, &id).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(region)))
}

async fn get_region_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<GloRegion>, ApiError> {
    let id2 = id.clone();
    let region = db_find(&state, format!("Region '{}' not found", id), move |conn| {
        Ok(fetch_region(conn, &id2).ok())
    }).await?;
    Ok(Json(region))
}

async fn patch_region(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(patch): Json<PatchRegionBody>,
) -> Result<Json<GloRegion>, ApiError> {
    let id2 = id.clone();
    let region = db_find(&state, format!("Region '{}' not found", id), move |conn| {
        let cur = match fetch_region(conn, &id2) { Ok(c) => c, Err(_) => return Ok(None) };
        conn.execute(
            "UPDATE regions SET title=?2, x=?3, y=?4, width=?5, height=?6, color=?7,
             is_locked=?8, is_minimized=?9, z_order=?10 WHERE id=?1",
            params![
                id2,
                patch.title.unwrap_or(cur.title),
                patch.x.unwrap_or(cur.x),
                patch.y.unwrap_or(cur.y),
                patch.width.unwrap_or(cur.width),
                patch.height.unwrap_or(cur.height),
                patch.color.or(cur.color),
                patch.is_locked.unwrap_or(cur.is_locked) as i64,
                patch.is_minimized.unwrap_or(cur.is_minimized) as i64,
                patch.z_order.unwrap_or(cur.z_order),
            ],
        ).map_err(|e| e.to_string())?;
        fetch_region(conn, &id2).map(Some).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(Json(region))
}

async fn delete_region_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| {
        conn.execute("DELETE FROM regions WHERE id=?1", params![id])
            .map(|_| ())
            .map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

// ── /api/nodes/{id}/links ────────────────────────────────────────────────────

async fn list_node_links(
    State(state): State<AppState>,
    Path(node_id): Path<String>,
) -> Result<Json<Vec<NodeLink>>, ApiError> {
    let links = db(&state, move |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, node_id, url, label FROM node_links WHERE node_id = ?1 ORDER BY rowid ASC",
        ).map_err(|e| e.to_string())?;
        let v: Vec<NodeLink> = stmt.query_map(params![node_id], |row| {
            Ok(NodeLink { id: row.get(0)?, node_id: row.get(1)?, url: row.get(2)?, label: row.get(3)? })
        }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
        Ok(v)
    }).await?;
    Ok(Json(links))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateLinkBody { url: String, label: Option<String> }

async fn post_node_link(
    State(state): State<AppState>,
    Path(node_id): Path<String>,
    Json(body): Json<CreateLinkBody>,
) -> Result<(StatusCode, Json<NodeLink>), ApiError> {
    let link = db(&state, move |conn| {
        let id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO node_links (id, node_id, url, label) VALUES (?1, ?2, ?3, ?4)",
            params![id, node_id, body.url, body.label],
        ).map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT id, node_id, url, label FROM node_links WHERE id = ?1",
            params![id],
            |row| Ok(NodeLink { id: row.get(0)?, node_id: row.get(1)?, url: row.get(2)?, label: row.get(3)? }),
        ).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(link)))
}

async fn delete_link_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| {
        conn.execute("DELETE FROM node_links WHERE id = ?1", params![id])
            .map(|_| ()).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PatchLinkBody { url: Option<String>, label: Option<String> }

async fn patch_link_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(patch): Json<PatchLinkBody>,
) -> Result<Json<NodeLink>, ApiError> {
    let id2 = id.clone();
    let link = db_find(&state, format!("Link '{}' not found", id), move |conn| {
        let cur: NodeLink = match conn.query_row(
            "SELECT id, node_id, url, label FROM node_links WHERE id = ?1",
            params![id2],
            |row| Ok(NodeLink { id: row.get(0)?, node_id: row.get(1)?, url: row.get(2)?, label: row.get(3)? }),
        ).optional().map_err(|e| e.to_string())? {
            Some(l) => l,
            None => return Ok(None),
        };
        conn.execute(
            "UPDATE node_links SET url=?2, label=?3 WHERE id=?1",
            params![id2, patch.url.unwrap_or(cur.url), patch.label.or(cur.label)],
        ).map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT id, node_id, url, label FROM node_links WHERE id = ?1",
            params![id2],
            |row| Ok(NodeLink { id: row.get(0)?, node_id: row.get(1)?, url: row.get(2)?, label: row.get(3)? }),
        ).map(Some).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(Json(link))
}

// ── /api/nodes/{id}/media ────────────────────────────────────────────────────

async fn list_node_media(
    State(state): State<AppState>,
    Path(node_id): Path<String>,
) -> Result<Json<Vec<NodeMedia>>, ApiError> {
    let media = db(&state, move |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card
             FROM node_media WHERE node_id = ?1 ORDER BY sort_order ASC",
        ).map_err(|e| e.to_string())?;
        let v: Vec<NodeMedia> = stmt.query_map(params![node_id], |row| {
            Ok(NodeMedia {
                id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
                src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
                sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
            })
        }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
        Ok(v)
    }).await?;
    Ok(Json(media))
}

async fn post_node_media(
    State(state): State<AppState>,
    Path(node_id): Path<String>,
    Json(input): Json<AddMediaInput>,
) -> Result<(StatusCode, Json<NodeMedia>), ApiError> {
    // On a shared session a guest must never name a host file path (it would be
    // readable via GET .../file). File media is added by uploading bytes instead.
    if state.presence.is_some() && input.src_type == "file" {
        return Err(ApiError(StatusCode::FORBIDDEN,
            "In a shared session, upload local files via POST /api/nodes/{id}/media/file.".to_string()));
    }
    let media = db(&state, move |conn| {
        let id = Uuid::new_v4().to_string();
        let sort_order: i64 = conn.query_row(
            "SELECT COALESCE(MAX(sort_order)+1, 0) FROM node_media WHERE node_id=?1",
            params![node_id],
            |row| row.get(0),
        ).unwrap_or(0);
        conn.execute(
            "INSERT INTO node_media (id, node_id, label, src, src_type, media_type, sort_order, show_on_card)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
            params![id, node_id, input.label, input.src, input.src_type,
                    input.media_type, sort_order, input.show_on_card as i64],
        ).map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card
             FROM node_media WHERE id = ?1",
            params![id],
            |row| Ok(NodeMedia {
                id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
                src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
                sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
            }),
        ).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(media)))
}

async fn delete_media_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    db(&state, move |conn| {
        conn.execute("DELETE FROM node_media WHERE id = ?1", params![id])
            .map(|_| ()).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PatchMediaBody {
    label: Option<String>, show_on_card: Option<bool>, sort_order: Option<i64>,
    // `src`/`src_type` let a client switch a media item to a URL. A file `src` is
    // rejected on a shared session (guests upload via .../file instead).
    src: Option<String>, src_type: Option<String>,
}

async fn patch_media_route(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(patch): Json<PatchMediaBody>,
) -> Result<Json<NodeMedia>, ApiError> {
    if state.presence.is_some() && patch.src_type.as_deref() == Some("file") {
        return Err(ApiError(StatusCode::FORBIDDEN,
            "In a shared session, replace a file via POST /api/media/{id}/file.".to_string()));
    }
    let id2 = id.clone();
    let media = db_find(&state, format!("Media '{}' not found", id), move |conn| {
        let cur: NodeMedia = match conn.query_row(
            "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card
             FROM node_media WHERE id = ?1",
            params![id2],
            |row| Ok(NodeMedia {
                id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
                src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
                sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
            }),
        ).optional().map_err(|e| e.to_string())? {
            Some(m) => m,
            None => return Ok(None),
        };
        conn.execute(
            "UPDATE node_media SET label=?2, show_on_card=?3, sort_order=?4, src=?5, src_type=?6 WHERE id=?1",
            params![
                id2,
                patch.label.unwrap_or(cur.label),
                patch.show_on_card.unwrap_or(cur.show_on_card) as i64,
                patch.sort_order.unwrap_or(cur.sort_order),
                patch.src.clone().unwrap_or(cur.src),
                patch.src_type.clone().unwrap_or(cur.src_type),
            ],
        ).map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card
             FROM node_media WHERE id = ?1",
            params![id2],
            |row| Ok(NodeMedia {
                id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
                src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
                sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
            }),
        ).map(Some).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(Json(media))
}

// ── Media files over a Live Share session ──────────────────────────────────────
// Lets guests SEE the host's file-type media (the host streams the bytes) and SET
// media to a URL or an uploaded local file (saved into the host's session-media
// store). Security: a guest can never name a host file path — file media is added
// only via the upload endpoints (the host generates the path), and `post_node_media`
// / `patch_media_route` reject a guest-supplied file `src` (otherwise a guest could
// point media at any host file and read it back via `GET .../file`).

fn content_type_for(path: &str) -> &'static str {
    let ext = std::path::Path::new(path)
        .extension().and_then(|e| e.to_str()).unwrap_or("").to_ascii_lowercase();
    match ext.as_str() {
        "png" => "image/png", "jpg" | "jpeg" => "image/jpeg", "gif" => "image/gif",
        "webp" => "image/webp", "svg" => "image/svg+xml", "bmp" => "image/bmp",
        "mp4" | "m4v" => "video/mp4", "webm" => "video/webm", "mov" => "video/quicktime", "ogv" => "video/ogg",
        "mp3" => "audio/mpeg", "wav" => "audio/wav", "ogg" => "audio/ogg", "m4a" => "audio/mp4", "flac" => "audio/flac",
        _ => "application/octet-stream",
    }
}

/// `GET /api/media/{id}/file` — stream a file-type media item's bytes (the host's
/// local file, or a guest-uploaded one). Read-only; on the session server it's
/// available to both roles so guests can view host media. URL media isn't served
/// here (the client uses the URL directly).
async fn media_file_route(State(state): State<AppState>, Path(id): Path<String>) -> Result<Response, ApiError> {
    let (bytes, ctype) = db_find(&state, format!("Media '{}' not found", id), move |conn| {
        let row: Option<(String, String)> = conn.query_row(
            "SELECT src, src_type FROM node_media WHERE id=?1",
            params![id],
            |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)),
        ).optional().map_err(|e| e.to_string())?;
        let (src, src_type) = match row { Some(x) => x, None => return Ok(None) };
        if src_type != "file" {
            return Err("Not a file-type media item".to_string());
        }
        let data = std::fs::read(&src).map_err(|e| format!("read media file: {}", e))?;
        Ok(Some((data, content_type_for(&src))))
    }).await?;
    Ok(([(axum::http::header::CONTENT_TYPE, ctype)], bytes).into_response())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MediaUploadQuery {
    #[serde(default)] label: Option<String>,
    #[serde(default)] media_type: Option<String>,
    #[serde(default)] show_on_card: Option<bool>,
    #[serde(default)] ext: Option<String>,
}

/// Save uploaded bytes into the host's session-media store under `{media_id}.{ext}`
/// and return the saved path. The host owns the path (guests never supply one).
fn save_session_media(state: &AppState, media_id: &str, ext: &str, bytes: &[u8]) -> Result<String, String> {
    let dir = {
        let pm = state.pm.lock().map_err(|e| e.to_string())?;
        pm.projects_dir.join("session-media")
    };
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let safe_ext: String = ext.chars().filter(|c| c.is_ascii_alphanumeric()).take(8).collect::<String>().to_ascii_lowercase();
    let name = if safe_ext.is_empty() { media_id.to_string() } else { format!("{}.{}", media_id, safe_ext) };
    let path = dir.join(name);
    std::fs::write(&path, bytes).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

fn media_row(conn: &Connection, id: &str) -> rusqlite::Result<NodeMedia> {
    conn.query_row(
        "SELECT id, node_id, label, src, src_type, media_type, sort_order, show_on_card
         FROM node_media WHERE id=?1",
        params![id],
        |row| Ok(NodeMedia {
            id: row.get(0)?, node_id: row.get(1)?, label: row.get(2)?,
            src: row.get(3)?, src_type: row.get(4)?, media_type: row.get(5)?,
            sort_order: row.get(6)?, show_on_card: row.get::<_, i64>(7)? != 0,
        }),
    )
}

/// `POST /api/nodes/{id}/media/file` — guest uploads a local file; the host saves
/// it and ADDS a new file-type media item to the node. Editor sessions only.
async fn post_node_media_file(
    State(state): State<AppState>,
    Path(node_id): Path<String>,
    Query(q): Query<MediaUploadQuery>,
    bytes: axum::body::Bytes,
) -> Result<(StatusCode, Json<NodeMedia>), ApiError> {
    let media_id = Uuid::new_v4().to_string();
    let src = save_session_media(&state, &media_id, q.ext.as_deref().unwrap_or(""), &bytes)
        .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let media_type = q.media_type.unwrap_or_else(|| "image".to_string());
    let label = q.label.unwrap_or_default();
    let show = q.show_on_card.unwrap_or(true);
    let media = db(&state, move |conn| {
        let sort_order: i64 = conn.query_row(
            "SELECT COALESCE(MAX(sort_order)+1, 0) FROM node_media WHERE node_id=?1",
            params![node_id], |row| row.get(0),
        ).unwrap_or(0);
        conn.execute(
            "INSERT INTO node_media (id, node_id, label, src, src_type, media_type, sort_order, show_on_card)
             VALUES (?1,?2,?3,?4,'file',?5,?6,?7)",
            params![media_id, node_id, label, src, media_type, sort_order, show as i64],
        ).map_err(|e| e.to_string())?;
        media_row(conn, &media_id).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok((StatusCode::CREATED, Json(media)))
}

/// `POST /api/media/{id}/file` — guest replaces an existing media item's source
/// with an uploaded local file (keeps the id). Editor sessions only.
async fn put_media_file(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(q): Query<MediaUploadQuery>,
    bytes: axum::body::Bytes,
) -> Result<Json<NodeMedia>, ApiError> {
    let src = save_session_media(&state, &id, q.ext.as_deref().unwrap_or(""), &bytes)
        .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let id2 = id.clone();
    let media = db_find(&state, format!("Media '{}' not found", id), move |conn| {
        let exists = conn.query_row("SELECT 1 FROM node_media WHERE id=?1", params![id2], |_| Ok(()))
            .optional().map_err(|e| e.to_string())?.is_some();
        if !exists { return Ok(None); }
        conn.execute("UPDATE node_media SET src=?2, src_type='file' WHERE id=?1", params![id2, src])
            .map_err(|e| e.to_string())?;
        media_row(conn, &id2).map(Some).map_err(|e| e.to_string())
    }).await?;
    state.notify();
    Ok(Json(media))
}

// ── /api/settings/app ────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct AppSettingQuery { key: String }

#[derive(Serialize)]
struct AppSettingResponse { key: String, value: Option<String> }

async fn get_app_setting_route(
    State(state): State<AppState>,
    Query(q): Query<AppSettingQuery>,
) -> Result<Json<AppSettingResponse>, ApiError> {
    let key = q.key.clone();
    // The global api_* keys live in api_config.json, not the active project.
    if crate::GLOBAL_API_KEYS.contains(&key.as_str()) {
        let value = tokio::task::block_in_place(|| {
            let pm = state.pm.lock().unwrap_or_else(|e| e.into_inner());
            let cfg = crate::load_api_config(&pm.projects_dir);
            Some(match key.as_str() {
                "api_enabled" => cfg.enabled.to_string(),
                "api_token" => cfg.token,
                _ => cfg.port.to_string(),
            })
        });
        return Ok(Json(AppSettingResponse { key, value }));
    }
    let value = db(&state, move |conn| {
        Ok(get_setting(conn, &q.key))
    }).await?;
    Ok(Json(AppSettingResponse { key, value }))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetAppSettingBody { key: String, value: String }

/// App settings a script may write via the API. Deliberately excludes the
/// security-sensitive `api_enabled` / `api_token` / `api_port` (a client must
/// not be able to disable the API or rotate its own auth) and migration flags.
const WRITABLE_APP_SETTINGS: &[&str] = &[
    "edge_routing_mode",
    "snap_to_grid",
    "graph_notes",
    "canvas_bookmarks",
];

async fn set_app_setting_route(
    State(state): State<AppState>,
    Json(body): Json<SetAppSettingBody>,
) -> Result<StatusCode, ApiError> {
    if !WRITABLE_APP_SETTINGS.contains(&body.key.as_str()) {
        return Err(ApiError(
            StatusCode::FORBIDDEN,
            format!(
                "App setting '{}' is not writable via the API. Allowed keys: {}.",
                body.key,
                WRITABLE_APP_SETTINGS.join(", "),
            ),
        ));
    }
    db(&state, move |conn| {
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?1, ?2)",
            params![body.key, body.value],
        ).map(|_| ()).map_err(|e| e.to_string())
    }).await?;
    Ok(StatusCode::NO_CONTENT)
}

// ── /api/search/semantic ────────────────────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SemanticQuery {
    query: String,
    #[serde(default)]
    limit: Option<usize>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SemanticHit {
    id: String,
    title: String,
    summary: Option<String>,
    score: f32,
}

/// Rank nodes by semantic similarity to `query` using a pluggable embeddings
/// provider (configured in `embed_config.json`; off by default). Vectors are
/// cached per node and re-embedded lazily when title/description (or the model)
/// change. `503` if not configured, `502` if the provider is unreachable.
async fn post_semantic_search(
    State(state): State<AppState>,
    Json(q): Json<SemanticQuery>,
) -> Result<Json<Vec<SemanticHit>>, ApiError> {
    use crate::embeddings as emb;
    let cfg = {
        let pm = state.pm.lock().map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        emb::load_embed_config(&pm.projects_dir)
    };
    if !cfg.enabled {
        return Err(ApiError(StatusCode::SERVICE_UNAVAILABLE,
            "Semantic search is off. In embed_config.json set \"enabled\": true (it defaults to a local Ollama at :11434).".to_string()));
    }
    let limit = q.limit.unwrap_or(10).clamp(1, 200);
    let model = cfg.model.clone();

    // 1. Read nodes + any cached vector for the current model.
    let model_read = model.clone();
    // One row of the embeddings query: (id, title, description, src_hash, cached vec).
    type EmbedRow = (String, String, String, Option<String>, Option<Vec<u8>>);
    let rows: Vec<EmbedRow> = db(&state, move |conn| {
        let mut stmt = conn.prepare(
            "SELECT n.id, n.title, COALESCE(n.description,''), e.src_hash, e.vec
             FROM nodes n LEFT JOIN node_embeddings e ON e.node_id = n.id AND e.model = ?1",
        ).map_err(|e| e.to_string())?;
        let out = stmt.query_map(params![model_read], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?,
                r.get::<_, Option<String>>(3)?, r.get::<_, Option<Vec<u8>>>(4)?))
        }).map_err(|e| e.to_string())?.filter_map(|x| x.ok()).collect();
        Ok(out)
    }).await?;

    struct Item { id: String, title: String, desc: String, hash: String, vec: Option<Vec<f32>> }
    let mut items: Vec<Item> = Vec::with_capacity(rows.len());
    let mut stale: Vec<usize> = Vec::new();
    for (id, title, desc, stored_hash, vec_bytes) in rows {
        let hash = emb::src_hash(&model, &title, &desc);
        let vec = vec_bytes.map(|b| emb::bytes_to_vec(&b));
        let fresh = stored_hash.as_deref() == Some(hash.as_str()) && vec.is_some();
        if !fresh { stale.push(items.len()); }
        items.push(Item { id, title, desc, hash, vec });
    }

    // 2. Embed the query + the stale node texts in one provider call.
    let mut texts: Vec<String> = Vec::with_capacity(stale.len() + 1);
    texts.push(q.query.clone());
    for &i in &stale { texts.push(format!("{}\n{}", items[i].title, items[i].desc)); }
    let cfg2 = cfg.clone();
    let embeds = tokio::task::spawn_blocking(move || emb::embed_texts(&cfg2, &texts)).await
        .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .map_err(|e| ApiError(StatusCode::BAD_GATEWAY, e))?;
    let query_vec = match embeds.first() {
        Some(v) => v.clone(),
        None => return Err(ApiError(StatusCode::BAD_GATEWAY, "embeddings provider returned no data".to_string())),
    };
    for (k, &i) in stale.iter().enumerate() {
        if let Some(v) = embeds.get(k + 1) { items[i].vec = Some(v.clone()); }
    }

    // 3. Persist the new vectors (best-effort cache).
    let to_store: Vec<(String, String, i64, Vec<u8>)> = stale.iter().filter_map(|&i| {
        items[i].vec.as_ref().map(|v| (items[i].id.clone(), items[i].hash.clone(), v.len() as i64, emb::vec_to_bytes(v)))
    }).collect();
    if !to_store.is_empty() {
        let model_w = model.clone();
        let _ = db(&state, move |conn| {
            for (id, hash, dim, bytes) in &to_store {
                conn.execute(
                    "INSERT OR REPLACE INTO node_embeddings (node_id, model, src_hash, dim, vec) VALUES (?1,?2,?3,?4,?5)",
                    params![id, model_w, hash, dim, bytes],
                ).map_err(|e| e.to_string())?;
            }
            Ok(())
        }).await;
    }

    // 4. Rank by cosine similarity.
    let mut hits: Vec<SemanticHit> = items.into_iter().filter_map(|it| {
        let score = match it.vec.as_ref() { Some(v) => emb::cosine(&query_vec, v), None => return None };
        Some(SemanticHit {
            id: it.id, title: it.title,
            summary: if it.desc.is_empty() { None } else { Some(it.desc) },
            score,
        })
    }).collect();
    hits.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    hits.truncate(limit);
    Ok(Json(hits))
}

// ── Server entry point ────────────────────────────────────────────────────────

pub async fn serve(
    pm: PmState,
    app_handle: AppHandle,
    port: u16,
    events_tx: tokio::sync::broadcast::Sender<ChangeEvent>,
) {
    let state = AppState { pm, app: app_handle, events: events_tx, presence: None };
    let app = Router::new()
        .route("/api/ping",                      get(ping))
        .route("/api/events",                    get(get_events))
        .route("/api/tabs",                      get(get_tabs_route).post(post_tab))
        .route("/api/tabs/{id}/activate",        post(post_tab_activate))
        .route("/api/tabs/{id}",                 axum::routing::delete(delete_tab))
        .route("/api/stats",                     get(get_stats))
        .route("/api/graph",                     get(get_graph))
        .route("/api/import",                    post(post_import))
        .route("/api/settings",                  get(get_settings))
        .route("/api/settings/app",              get(get_app_setting_route).put(set_app_setting_route))
        .route("/api/nodes",                     get(list_nodes).post(post_node).put(put_node))
        .route("/api/nodes/batch",               post(post_nodes_batch))
        .route("/api/nodes/batch-positions",     axum::routing::patch(patch_nodes_positions))
        .route("/api/nodes/{id}",                get(get_node).patch(patch_node).delete(delete_node_route))
        .route("/api/nodes/{id}/edges",          get(get_node_edges))
        .route("/api/nodes/{id}/neighbors",      get(get_node_neighbors))
        .route("/api/nodes/{id}/links",          get(list_node_links).post(post_node_link))
        .route("/api/nodes/{id}/media",          get(list_node_media).post(post_node_media))
        .route("/api/links/{id}",                axum::routing::delete(delete_link_route).patch(patch_link_route))
        .route("/api/media/{id}",                axum::routing::delete(delete_media_route).patch(patch_media_route))
        .route("/api/edges",                     get(list_edges).post(post_edge).put(put_edge))
        .route("/api/edges/batch",               post(post_edges_batch))
        .route("/api/edges/{id}",                get(get_edge).patch(patch_edge).delete(delete_edge_route))
        .route("/api/trace",                     get(get_trace))
        .route("/api/search/semantic",           post(post_semantic_search))
        .route("/api/regions",                   get(list_regions).post(post_region))
        .route("/api/regions/{id}",              get(get_region_route).patch(patch_region).delete(delete_region_route))
        // event_layer is added before auth_layer, so auth_layer is the outer wrap:
        // requests pass auth first, then event_layer observes the response.
        .layer(middleware::from_fn_with_state(state.clone(), event_layer))
        .layer(middleware::from_fn_with_state(state.clone(), auth_layer))
        // No CORS layer: the loopback API is for non-browser clients, and
        // `auth_layer` rejects browser Origins. Omitting CORS means a web page
        // can't read any response cross-origin even if a request slipped through.
        .with_state(state);

    let addr = format!("127.0.0.1:{}", port);
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(l) => l,
        Err(e) => {
            eprintln!("[GloGraph API] Failed to bind on {}: {}", addr, e);
            return;
        }
    };
    eprintln!("[GloGraph API] Listening on http://{}", addr);
    if let Err(e) = axum::serve(listener, app).await {
        eprintln!("[GloGraph API] Server error: {}", e);
    }
}

// ── Live Share session server (Phase 1 part B) ──────────────────────────────
// A SEPARATE server, bound to the LAN (0.0.0.0) on a dedicated port, started only
// while the host is sharing. It exposes the read endpoints a spectator needs
// (ping, graph snapshot, the SSE change stream), gated by the **join token**, and
// shares the same PmState + event bus as the local API — so a spectator sees the
// host's GUI edits live (via part A). Phase 1 is **read-only** (no mutation routes).

/// Session auth: require the join token via `Authorization: Bearer <token>` or a
/// `?token=` query param (so a browser `EventSource`, which can't set headers,
/// still works). No diagnostic bypass — a network server gates everything.
async fn session_auth(State(token): State<String>, req: Request, next: Next) -> Response {
    let from_header = req.headers().get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "))
        .map(|s| s.to_string());
    let from_query = req.uri().query().and_then(|q| {
        q.split('&').find_map(|kv| kv.strip_prefix("token=")).map(|s| s.to_string())
    });
    let provided = from_header.or(from_query).unwrap_or_default();
    if token.is_empty() || !ct_eq(provided.as_bytes(), token.as_bytes()) {
        return ApiError(StatusCode::UNAUTHORIZED, "Valid session token required.".to_string()).into_response();
    }
    next.run(req).await
}

/// `GET /ws` — presence relay (Phase 2). Each connected peer's text message is
/// rebroadcast to all the others (cursors, selections, viewports). The server is a
/// dumb relay; clients shape the JSON and ignore their own messages by id. Auth is
/// the session token via `?token=` (the upgrade is a GET). `404` if presence isn't
/// enabled (i.e. the local API, not a session).
async fn ws_presence(ws: axum::extract::ws::WebSocketUpgrade, State(state): State<AppState>) -> Response {
    match state.presence.clone() {
        Some(tx) => ws.on_upgrade(move |socket| relay_presence(socket, tx)),
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

/// Deterministic cursor/selection colour for a server-assigned id. Mirrors the
/// client palette in `src/lib/presence.ts` so colours look the same everywhere.
fn presence_color(id: &str) -> String {
    const PALETTE: [&str; 8] = ["#e0566a", "#4ea1d3", "#5fb878", "#c98bdb", "#e0934e", "#56c2c2", "#b0b04e", "#d36aa1"];
    let mut h: u32 = 0;
    for b in id.bytes() { h = h.wrapping_mul(31).wrapping_add(b as u32); }
    PALETTE[(h as usize) % PALETTE.len()].to_string()
}

async fn relay_presence(socket: axum::extract::ws::WebSocket, tx: tokio::sync::broadcast::Sender<String>) {
    use axum::extract::ws::Message;
    use futures_util::{SinkExt, StreamExt};
    let (mut sink, mut stream) = socket.split();

    // Server-assigned identity (anti-spoof): the server picks this connection's id +
    // colour and STAMPS them onto every message this peer sends, overwriting whatever
    // the client claims — so a client can't impersonate another peer's cursor or
    // selection by sending their id. The client learns its id from the `welcome` so
    // it can ignore its own echo.
    let conn_id = Uuid::new_v4().to_string();
    let color = presence_color(&conn_id);
    let welcome = serde_json::json!({ "type": "welcome", "id": conn_id }).to_string();
    if sink.send(Message::Text(welcome.into())).await.is_err() {
        return;
    }

    let mut rx = tx.subscribe();
    // Forward every relayed message to this peer.
    let send_task = tokio::spawn(async move {
        while let Ok(m) = rx.recv().await {
            if sink.send(Message::Text(m.into())).await.is_err() { break; }
        }
    });
    // Relay this peer's messages to everyone (including itself; clients drop their own by id).
    // Cap message size — presence payloads (cursors/selections) are tiny, so anything larger
    // is malformed or abusive; drop it rather than amplify it to every peer.
    const MAX_PRESENCE_MSG: usize = 8 * 1024;
    while let Some(Ok(msg)) = stream.next().await {
        if let Message::Text(t) = msg {
            if t.len() > MAX_PRESENCE_MSG { continue; }
            if let Ok(mut v) = serde_json::from_str::<serde_json::Value>(&t) {
                if let Some(o) = v.as_object_mut() {
                    o.insert("id".into(), serde_json::Value::String(conn_id.clone()));
                    o.insert("color".into(), serde_json::Value::String(color.clone()));
                    let _ = tx.send(v.to_string());
                }
            }
        }
    }
    send_task.abort();
}

// ── Restore (a guest's Ctrl+Z of a delete) over the session — reuse the same inner
// fns as the Tauri restore commands so the entity comes back with its ORIGINAL ids
// (and cascaded children). Mounted only on editor sessions; each notifies + the
// event_layer broadcasts, so the host and other guests converge. ──
async fn restore_node_route(State(state): State<AppState>, Json(node): Json<GloNode>) -> Result<Json<GloNode>, ApiError> {
    let restored = db(&state, move |conn| crate::commands::nodes::restore_node_inner(conn, &node)).await?;
    state.notify();
    Ok(Json(restored))
}

async fn restore_edge_route(State(state): State<AppState>, Json(edge): Json<GloEdge>) -> Result<Json<GloEdge>, ApiError> {
    let restored = db(&state, move |conn| crate::commands::edges::restore_edge_inner(conn, &edge)).await?;
    state.notify();
    Ok(Json(restored))
}

async fn restore_region_route(State(state): State<AppState>, Json(region): Json<GloRegion>) -> Result<Json<GloRegion>, ApiError> {
    let restored = db(&state, move |conn| crate::commands::regions::restore_region_inner(conn, &region)).await?;
    state.notify();
    Ok(Json(restored))
}

/// Run a hosted session's server on an already-bound `listener` until `shutdown`
/// flips to true. The caller binds (so bind failures are reported synchronously).
/// Reuses the existing handlers + the shared `AppState`.
///
/// `role` is the session-wide default for joiners: `"editor"` additionally mounts
/// the graph **mutation** routes (so guests can write through to the host's
/// project), otherwise the session is read-only. Mutations run the same
/// `event_layer` as the local API, so a guest edit broadcasts a `ChangeEvent` to
/// every spectator's `GET /api/events` stream (and `notify()` refreshes the host
/// GUI). Per-user roles are a later phase; today the role is uniform per session.
pub async fn serve_session(
    state: AppState,
    listener: std::net::TcpListener,
    token: String,
    role: String,
    cert_der: Vec<u8>,
    key_der: Vec<u8>,
) {
    let editor = role == "editor";
    // `/api/session` lets a guest discover the session's role (to enable/disable
    // editing in its UI) without guessing from 401/404s.
    let role_for_info = role.clone();
    // GET a media file is available to BOTH roles (guests view host media); POST
    // (replace an item's source with an upload) is editor-only.
    let media_file = if editor { get(media_file_route).post(put_media_file) } else { get(media_file_route) };
    let mut app = Router::new()
        .route("/api/ping",    get(ping))
        .route("/api/graph",   get(get_graph))
        .route("/api/events",  get(get_events))
        .route("/api/session", get(move || {
            let role = role_for_info.clone();
            async move { Json(serde_json::json!({ "role": role })) }
        }))
        .route("/ws",          get(ws_presence))
        .route("/api/media/{id}/file", media_file);

    if editor {
        use axum::routing::patch;
        app = app
            .route("/api/nodes",                 post(post_node).put(put_node))
            .route("/api/nodes/batch",           post(post_nodes_batch))
            .route("/api/nodes/batch-positions", patch(patch_nodes_positions))
            .route("/api/nodes/{id}",            patch(patch_node).delete(delete_node_route))
            .route("/api/nodes/{id}/links",      post(post_node_link))
            .route("/api/links/{id}",            patch(patch_link_route).delete(delete_link_route))
            .route("/api/edges",                 post(post_edge).put(put_edge))
            .route("/api/edges/batch",           post(post_edges_batch))
            .route("/api/edges/{id}",            patch(patch_edge).delete(delete_edge_route))
            .route("/api/regions",               post(post_region))
            .route("/api/regions/{id}",          patch(patch_region).delete(delete_region_route))
            // Restore (a guest's Ctrl+Z of a delete) — full entity in the body, original ids preserved.
            .route("/api/nodes/restore",         post(restore_node_route))
            .route("/api/edges/restore",         post(restore_edge_route))
            .route("/api/regions/restore",       post(restore_region_route))
            // Media: guests add by URL (post_node_media, file `src` rejected) or by
            // uploading a local file (.../media/file → host stores it), replace an
            // item's source (POST /api/media/{id}/file, mounted above), edit
            // label/visibility (patch), or delete.
            .route("/api/nodes/{id}/media",      post(post_node_media))
            .route("/api/nodes/{id}/media/file", post(post_node_media_file))
            .route("/api/media/{id}",            patch(patch_media_route).delete(delete_media_route));
        // NOTE: `/api/import` is deliberately NOT mounted for guests. It is a
        // destructive replace-all (wipes nodes/edges/regions AND swaps the preset
        // schema), which "everyone can edit" should not grant — a single guest
        // could erase the host's project. Guests edit via the per-entity routes
        // above; whole-graph import stays host-only (the local API / desktop UI).
    }

    // CORS for the guest webview (cross-origin: tauri.localhost → LAN host). NOTE:
    // `Authorization` must be allowed EXPLICITLY — a `*` wildcard in
    // Access-Control-Allow-Headers does not cover it (Fetch spec), so
    // `CorsLayer::permissive()` (which sends `*`) makes the browser block the
    // Bearer-token `GET /api/graph` + every editor mutation while SSE (`?token=`,
    // no header, no preflight) still connects — "live" but blank.
    let cors = CorsLayer::new()
        .allow_origin(cors::Any)
        .allow_methods(cors::Any)
        .allow_headers([axum::http::header::AUTHORIZATION, axum::http::header::CONTENT_TYPE]);
    let app = app
        .layer(middleware::from_fn_with_state(state.clone(), event_layer))
        .layer(middleware::from_fn_with_state(token, session_auth))
        .layer(cors)
        // Allow media uploads (default is 2 MB).
        .layer(axum::extract::DefaultBodyLimit::max(64 * 1024 * 1024))
        .with_state(state);

    let addr = listener.local_addr().map(|a| a.to_string()).unwrap_or_default();
    // TLS: serve the session over HTTPS/WSS with the per-session self-signed cert.
    // Guests pin it by fingerprint (see src/tls.rs + the loopback bridge), so a LAN
    // sniffer can't read the graph or the token.
    let config = match axum_server::tls_rustls::RustlsConfig::from_der(vec![cert_der], key_der).await {
        Ok(c) => c,
        Err(e) => { eprintln!("[GloGraph session] TLS config error: {}", e); return; }
    };
    eprintln!("[GloGraph session] Hosting ({}, TLS) on {}", if editor { "editor" } else { "read-only" }, addr);
    // No graceful-shutdown wait: the host stops the session by aborting this task
    // (session::stop_host_session), which drops the server and frees the port
    // immediately — even with long-lived SSE/WS connections still open.
    let _ = axum_server::from_tcp_rustls(listener, config)
        .serve(app.into_make_service())
        .await;
    eprintln!("[GloGraph session] Stopped");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ct_eq_matches_only_identical() {
        assert!(ct_eq(b"abc", b"abc"));
        assert!(ct_eq(b"", b""));
        assert!(!ct_eq(b"abc", b"abd"));   // same length, differs
        assert!(!ct_eq(b"abc", b"ab"));    // length differs
        assert!(!ct_eq(b"", b"x"));
    }

    #[test]
    fn only_tauri_origins_are_trusted_on_local_api() {
        assert!(is_trusted_local_origin("http://tauri.localhost"));
        assert!(is_trusted_local_origin("https://tauri.localhost"));
        assert!(is_trusted_local_origin("tauri://localhost"));
        // A real web page (the localhost-CSRF / exfil threat) must be rejected.
        assert!(!is_trusted_local_origin("https://evil.example"));
        assert!(!is_trusted_local_origin("http://localhost:5173"));
        assert!(!is_trusted_local_origin("null"));
        assert!(!is_trusted_local_origin(""));
    }
}

