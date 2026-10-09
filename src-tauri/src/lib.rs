use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::Manager;
use uuid::Uuid;

mod commands;
mod core;
mod db;
mod embeddings;
mod events;
mod http_api;
mod models;
mod session;
mod tls;
mod guest_bridge;

// ── Project / tab types ───────────────────────────────────────────────────────

pub struct TabEntry {
    pub id: String,
    pub name: String,
    pub save_path: Option<String>,
    pub order: usize,
    pub conn: Connection,
    /// True when the tab's content differs from `saved_fingerprint` (its last
    /// saved / opened / created baseline). Session-only (not persisted to
    /// tabs.json) — only the active tab can be edited, so an inactive tab's flag
    /// reflects its state when last active. Used to decide whether closing the
    /// tab must prompt to save, and to drive the unsaved dot.
    pub dirty: bool,
    /// Content fingerprint of the clean baseline — the project as last saved to
    /// (or opened from) its `.glograph` file, or its empty initial state at
    /// creation. `dirty` is recomputed as `saved_fingerprint != Some(current)`
    /// (see `commands::graph::compute_fingerprint`), so undoing edits back to this
    /// state clears `dirty`. `None` means "no clean baseline" → always dirty.
    pub saved_fingerprint: Option<u64>,
}

pub struct ProjectManager {
    pub tabs: HashMap<String, TabEntry>,
    pub active_tab_id: String,
    pub projects_dir: PathBuf,
}

impl ProjectManager {
    pub fn active_conn(&self) -> Result<&Connection, String> {
        self.tabs
            .get(&self.active_tab_id)
            .map(|e| &e.conn)
            .ok_or_else(|| "No active tab".to_string())
    }

    pub fn tab_metas(&self) -> Vec<TabMeta> {
        let mut metas: Vec<TabMeta> = self
            .tabs
            .values()
            .map(|e| TabMeta {
                id: e.id.clone(),
                name: e.name.clone(),
                save_path: e.save_path.clone(),
                order: e.order,
                is_active: e.id == self.active_tab_id,
                dirty: e.dirty,
            })
            .collect();
        metas.sort_by_key(|m| m.order);
        metas
    }

    pub fn save_tabs_json(&self) -> Result<(), String> {
        let mut records: Vec<TabRecord> = self
            .tabs
            .values()
            .map(|e| TabRecord {
                id: e.id.clone(),
                name: e.name.clone(),
                save_path: e.save_path.clone(),
                order: e.order,
            })
            .collect();
        records.sort_by_key(|r| r.order);
        let data = TabsFile {
            active_tab_id: self.active_tab_id.clone(),
            tabs: records,
        };
        let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
        let path = self.projects_dir.join("tabs.json");
        std::fs::write(&path, json).map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Create a new project tab (its own SQLite DB seeded with `preset_id`), make
    /// it active, and persist tabs.json. The single source of truth for "new
    /// project" — shared by the desktop New Project flow (`create_tab`) and the
    /// HTTP `POST /api/tabs` so the two can't drift. Does **not** emit
    /// `tabs:changed`/notify; the caller owns those side effects. Returns the new
    /// tab's id.
    pub fn create_project_tab(&mut self, name: String, preset_id: String) -> Result<String, String> {
        let tab_id = Uuid::new_v4().to_string();
        let db_path = self.projects_dir.join(format!("{}.db", tab_id));
        let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
        db::init_db(&conn).map_err(|e| e.to_string())?;
        let _ = conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('active_preset_id', ?1)",
            rusqlite::params![preset_id],
        );
        let order = self.tabs.values().map(|e| e.order).max().map(|m| m + 1).unwrap_or(0);
        // Baseline = the empty, freshly-seeded project. So a brand-new project
        // starts clean and only becomes dirty once you actually add/change
        // something (and goes back to clean if you undo all of it) — and an empty,
        // untouched new project closes without a save prompt.
        let saved_fingerprint = crate::commands::graph::compute_fingerprint(&conn).ok();
        self.tabs.insert(tab_id.clone(), TabEntry {
            id: tab_id.clone(),
            name,
            save_path: None,
            order,
            conn,
            dirty: false,
            saved_fingerprint,
        });
        self.active_tab_id = tab_id.clone();
        self.save_tabs_json()?;
        Ok(tab_id)
    }

    /// Close a project tab: push a saved project back to Recents, drop the tab
    /// (closing its SQLite connection) before optionally deleting its on-disk
    /// files, and reassign the active tab to the lowest-ordered survivor (or none).
    /// The single source of truth for "close project" — shared by the desktop
    /// `close_tab` and the HTTP `DELETE /api/tabs/{id}`. Idempotent: an unknown id
    /// is a no-op. Does **not** emit events; the caller owns those. Persists
    /// tabs.json.
    pub fn close_project_tab(&mut self, id: &str, delete_db: bool) -> Result<(), String> {
        if let Some(entry) = self.tabs.get(id) {
            if let Some(path) = entry.save_path.clone() {
                let name = entry.name.clone();
                push_recent(&self.projects_dir, &name, &path);
            }
        }
        // Dropping the TabEntry closes its SQLite connection; do that before
        // deleting the on-disk DB so the files aren't locked.
        let db_path = self.projects_dir.join(format!("{}.db", id));
        self.tabs.remove(id);
        if delete_db {
            let _ = std::fs::remove_file(&db_path);
            let _ = std::fs::remove_file(db_path.with_extension("db-wal"));
            let _ = std::fs::remove_file(db_path.with_extension("db-shm"));
        }
        if self.active_tab_id == id {
            let next = self.tabs.values()
                .min_by_key(|e| e.order)
                .map(|e| e.id.clone())
                .unwrap_or_default();
            self.active_tab_id = next;
        }
        self.save_tabs_json()?;
        Ok(())
    }

    /// Recompute the active tab's `dirty` flag from a content fingerprint vs its
    /// clean baseline (`saved_fingerprint`). **Source-agnostic** — it reads the DB,
    /// so it reports the right answer no matter how the project changed: local GUI
    /// edits, HTTP API / SDK writes, or another participant's edits in a Live Share
    /// session. Call it from the dirty-recheck command and the tab-list read paths
    /// (so an API client reading `GET /api/tabs` sees an up-to-date flag without
    /// depending on the desktop window) — not per mutation (one export+hash each).
    /// On a compute error the flag is left unchanged (bias: don't drop a dirty).
    pub fn recompute_active_dirty(&mut self) {
        let active_id = self.active_tab_id.clone();
        if let Some(entry) = self.tabs.get_mut(&active_id) {
            if let Ok(fp) = crate::commands::graph::compute_fingerprint(&entry.conn) {
                entry.dirty = entry.saved_fingerprint != Some(fp);
            }
        }
    }
}

pub type PmState = Arc<Mutex<ProjectManager>>;

// ── Recent projects ───────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RecentProject {
    pub name: String,
    pub path: String,
}

pub fn load_recent(projects_dir: &Path) -> Vec<RecentProject> {
    let path = projects_dir.join("recent.json");
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_recent(projects_dir: &Path, list: &[RecentProject]) {
    if let Ok(json) = serde_json::to_string_pretty(list) {
        let _ = std::fs::write(projects_dir.join("recent.json"), json);
    }
}

pub fn push_recent(projects_dir: &Path, name: &str, path: &str) {
    let mut list = load_recent(projects_dir);
    list.retain(|r| r.path != path);
    list.insert(0, RecentProject { name: name.to_string(), path: path.to_string() });
    list.truncate(10);
    save_recent(projects_dir, &list);
}

/// Drop a single recent-project entry by path (e.g. the Start screen "Clear" /
/// "Re-path" actions on a missing file). No-op if the path isn't in the list.
pub fn remove_recent(projects_dir: &Path, path: &str) {
    let mut list = load_recent(projects_dir);
    let before = list.len();
    list.retain(|r| r.path != path);
    if list.len() != before {
        save_recent(projects_dir, &list);
    }
}

// ── Global API config ───────────────────────────────────────────────────────
// The embedded HTTP server is a single global service, so its enable flag, token,
// and port live globally in `projects_dir/api_config.json` — NOT per project.
// (They used to be per-project `app_settings`, which meant creating or switching
// to a project that hadn't enabled the API silently turned the whole server off.)
// `auth_layer`, the server startup, and the Preferences `get/set_app_setting`
// commands all read/write these keys through here.

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiConfig {
    pub enabled: bool,
    pub token: String,
    pub port: u16,
}

impl Default for ApiConfig {
    fn default() -> Self {
        // Enabled by default: the server binds 127.0.0.1 only (loopback — not
        // reachable off this machine), so the convenience outweighs the local-only
        // exposure. NETWORK exposure (Live Share / hosting a session) is a separate,
        // explicit opt-in that must require a join token — never governed by this.
        ApiConfig { enabled: true, token: String::new(), port: 57321 }
    }
}

/// The three app-setting keys that are global (server-wide), not per-project.
pub const GLOBAL_API_KEYS: &[&str] = &["api_enabled", "api_token", "api_port"];

pub fn load_api_config(projects_dir: &Path) -> ApiConfig {
    std::fs::read_to_string(projects_dir.join("api_config.json"))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_api_config(projects_dir: &Path, cfg: &ApiConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?;
    std::fs::write(projects_dir.join("api_config.json"), json).map_err(|e| e.to_string())
}

/// One-time migration: if the global config file is absent, seed it from any
/// open project that still carries the (formerly per-project) api_* settings, so
/// a user who had the API enabled keeps it enabled after upgrading.
pub fn ensure_api_config(pm: &ProjectManager) {
    if pm.projects_dir.join("api_config.json").exists() {
        return;
    }
    let read = |conn: &Connection, key: &str| -> Option<String> {
        conn.query_row("SELECT value FROM app_settings WHERE key=?1", rusqlite::params![key], |r| r.get::<_, String>(0)).ok()
    };
    let mut cfg = ApiConfig::default();
    for entry in pm.tabs.values() {
        if read(&entry.conn, "api_enabled").as_deref() == Some("true") {
            cfg.enabled = true;
        }
        if cfg.token.is_empty() {
            if let Some(t) = read(&entry.conn, "api_token") {
                if !t.is_empty() { cfg.token = t; }
            }
        }
        if let Some(p) = read(&entry.conn, "api_port").and_then(|s| s.parse().ok()) {
            cfg.port = p;
        }
    }
    let _ = save_api_config(&pm.projects_dir, &cfg);
}

// ── User config (identity) ──────────────────────────────────────────────────
// The user's display name is per-user/per-machine (one identity across all
// projects), so it lives globally in `user_config.json`, not per-project. It is
// the basis for presence/attribution in future shared sessions (Live Share) — a
// name must be prompted before hosting or joining.

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserConfig {
    pub display_name: String,
}

pub fn load_user_config(projects_dir: &Path) -> UserConfig {
    std::fs::read_to_string(projects_dir.join("user_config.json"))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_user_config(projects_dir: &Path, cfg: &UserConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?;
    std::fs::write(projects_dir.join("user_config.json"), json).map_err(|e| e.to_string())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TabMeta {
    pub id: String,
    pub name: String,
    pub save_path: Option<String>,
    pub order: usize,
    pub is_active: bool,
    pub dirty: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TabRecord {
    pub id: String,
    pub name: String,
    pub save_path: Option<String>,
    pub order: usize,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TabsFile {
    pub active_tab_id: String,
    pub tabs: Vec<TabRecord>,
}

// ── Build info ────────────────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BuildInfo {
    version: &'static str,
    build_date: &'static str,
}

#[tauri::command]
fn get_build_info() -> BuildInfo {
    BuildInfo {
        version: env!("CARGO_PKG_VERSION"),
        build_date: env!("GLOGRAPH_BUILD_DATE"),
    }
}

/// Append a frontend error to a local log file under AppData (no network/
/// telemetry). Called by the window error / unhandledrejection handlers.
#[tauri::command]
fn log_frontend_error(message: String, app: tauri::AppHandle) -> Result<(), String> {
    use std::io::Write;
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("logs");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let line = format!("[{}] {}\n", chrono::Utc::now().to_rfc3339(), message);
    let mut f = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(dir.join("frontend.log"))
        .map_err(|e| e.to_string())?;
    f.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

// ── App entry point ───────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Install the rustls crypto provider once, up front, so the Live Share TLS
    // server and the guest's pinned client share one provider (avoids the
    // "no process-default CryptoProvider" panic).
    tls::ensure_crypto_provider();
    tauri::Builder::default()
        // Single-instance must be registered first: a second launch focuses the
        // existing window and exits, rather than opening a duplicate (and a second
        // process fighting over the same per-tab SQLite files).
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.unminimize();
                let _ = w.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;

            // Local crash log — capture Rust panics to a file under AppData so a
            // crash leaves a breadcrumb, with no network/telemetry (local-first).
            {
                let log_dir = data_dir.join("logs");
                let _ = std::fs::create_dir_all(&log_dir);
                let crash_log = log_dir.join("crash.log");
                std::panic::set_hook(Box::new(move |info| {
                    let line = format!("[{}] {}\n", chrono::Utc::now().to_rfc3339(), info);
                    if let Ok(mut f) = std::fs::OpenOptions::new()
                        .create(true)
                        .append(true)
                        .open(&crash_log)
                    {
                        use std::io::Write;
                        let _ = f.write_all(line.as_bytes());
                    }
                    eprintln!("{line}");
                }));
            }

            let projects_dir = data_dir.join("projects");
            std::fs::create_dir_all(&projects_dir)?;

            let tabs_path = projects_dir.join("tabs.json");
            let old_db_path = data_dir.join("glograph.db");

            let tabs_file: TabsFile = if !tabs_path.exists() {
                let tab_id = Uuid::new_v4().to_string();
                let db_path = projects_dir.join(format!("{}.db", tab_id));

                if old_db_path.exists() {
                    std::fs::copy(&old_db_path, &db_path)?;
                } else {
                    let conn = Connection::open(&db_path)?;
                    db::init_db(&conn)?;
                }

                let tf = TabsFile {
                    active_tab_id: tab_id.clone(),
                    tabs: vec![TabRecord {
                        id: tab_id,
                        name: "Project 1".to_string(),
                        save_path: None,
                        order: 0,
                    }],
                };
                let json = serde_json::to_string_pretty(&tf)?;
                std::fs::write(&tabs_path, &json)?;
                tf
            } else {
                let json = std::fs::read_to_string(&tabs_path)?;
                serde_json::from_str(&json)
                    .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?
            };

            let mut tabs: HashMap<String, TabEntry> = HashMap::new();
            for record in &tabs_file.tabs {
                let db_path = projects_dir.join(format!("{}.db", record.id));
                let conn = Connection::open(&db_path)?;
                db::init_db(&conn)?;
                // Baseline = the tab's DB content as it is on disk at launch, so a
                // restored tab opens clean (matching prior behavior — dirty is not
                // persisted across runs). In-session edits then drive dirty via the
                // fingerprint recheck.
                let saved_fingerprint = crate::commands::graph::compute_fingerprint(&conn).ok();
                tabs.insert(
                    record.id.clone(),
                    TabEntry {
                        id: record.id.clone(),
                        name: record.name.clone(),
                        save_path: record.save_path.clone(),
                        order: record.order,
                        conn,
                        dirty: false,
                        saved_fingerprint,
                    },
                );
            }

            let active_tab_id = if tabs.contains_key(&tabs_file.active_tab_id) {
                tabs_file.active_tab_id.clone()
            } else {
                tabs.keys().next().cloned().unwrap_or_default()
            };

            let pm = ProjectManager {
                tabs,
                active_tab_id,
                projects_dir,
            };

            // Global API config (enable/token/port) — migrate from any project's
            // legacy per-project settings on first run, then read the port.
            ensure_api_config(&pm);
            let port: u16 = load_api_config(&pm.projects_dir).port;

            let pm_arc: PmState = Arc::new(Mutex::new(pm));
            app.manage(pm_arc.clone());

            // Shared graph-change bus: the HTTP server streams it on GET /api/events,
            // and the `publish_change` command lets the GUI publish its edits to it too.
            let (events_tx, _events_rx) = tokio::sync::broadcast::channel::<events::ChangeEvent>(256);
            app.manage(events::EventBus(events_tx.clone()));
            app.manage(session::SessionState::default());
            app.manage(guest_bridge::GuestBridge::default());

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                http_api::serve(pm_arc, app_handle, port, events_tx).await;
            });


            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_build_info,
            log_frontend_error,
            commands::nodes::get_all_nodes,
            commands::nodes::create_node,
            commands::nodes::update_node,
            commands::nodes::delete_node,
            commands::nodes::update_node_positions,
            commands::nodes::add_node_link,
            commands::nodes::delete_node_link,
            commands::nodes::add_node_media,
            commands::nodes::update_node_media,
            commands::nodes::update_node_media_show_on_card,
            commands::nodes::update_node_media_sort_order,
            commands::nodes::delete_node_media,
            commands::nodes::set_node_pinned,
            commands::nodes::set_node_expand_pinned,
            commands::nodes::set_node_z_order,
            commands::nodes::set_node_size,
            commands::nodes::set_node_render_markdown,
            commands::nodes::set_node_show_thumbnail,
            commands::edges::get_all_edges,
            commands::edges::create_edge,
            commands::edges::update_edge,
            commands::edges::update_edge_waypoints,
            commands::edges::reconnect_edge,
            commands::edges::restore_edge,
            commands::edges::delete_edge,
            commands::nodes::restore_node,
            commands::settings::get_graph_settings,
            commands::settings::set_active_preset,
            commands::settings::create_preset,
            commands::settings::duplicate_preset,
            commands::settings::rename_preset,
            commands::settings::delete_preset,
            commands::settings::create_node_param_def,
            commands::settings::update_node_param_def,
            commands::settings::delete_node_param_def,
            commands::settings::set_drives_color,
            commands::settings::create_param_option,
            commands::settings::update_param_option,
            commands::settings::delete_param_option,
            commands::settings::create_edge_param_def,
            commands::settings::update_edge_param_def,
            commands::settings::delete_edge_param_def,
            commands::settings::set_edge_drive,
            commands::settings::create_edge_param_option,
            commands::settings::update_edge_param_option,
            commands::settings::delete_edge_param_option,
            commands::settings::get_app_setting,
            commands::settings::set_app_setting,
            commands::settings::get_display_name,
            commands::settings::set_display_name,
            commands::settings::get_lan_address,
            commands::regions::get_all_regions,
            commands::regions::create_region,
            commands::regions::update_region,
            commands::regions::restore_region,
            commands::regions::delete_region,
            commands::regions::set_region_z_order,
            commands::regions::set_region_locked,
            commands::regions::set_region_minimized,
            events::publish_change,
            session::start_host_session,
            session::stop_host_session,
            guest_bridge::start_guest_bridge,
            guest_bridge::stop_guest_bridge,
            commands::graph::new_graph,
            commands::graph::trace,
            commands::graph::save_graph_to_path,
            commands::graph::write_text_file,
            commands::graph::write_binary_file,
            commands::graph::read_local_file,
            commands::graph::read_text_file_head,
            commands::graph::extract_office_thumbnail,
            commands::tabs::get_tabs,
            commands::tabs::create_tab,
            commands::tabs::switch_tab,
            commands::tabs::close_tab,
            commands::tabs::set_tab_dirty,
            commands::tabs::recompute_active_tab_dirty,
            commands::tabs::rename_tab,
            commands::tabs::set_tab_save_path,
            commands::tabs::get_recent_projects,
            commands::tabs::record_recent_project,
            commands::tabs::remove_recent_project,
            commands::tabs::open_path_as_tab,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
