//! Live Share host-session lifecycle (Phase 1 part B). Starting a session spins up
//! the LAN-bound, token-gated, read-only server in `http_api::serve_session`;
//! stopping it triggers a graceful shutdown. The session is app-global state
//! (Tauri-managed), distinct from the always-loopback local API.

use crate::events::EventBus;
use crate::http_api::{serve_session, AppState};
use crate::PmState;
use std::sync::Mutex;
use tauri::{AppHandle, State};

/// Dedicated port for the session server (kept separate from the local API port
/// so the loopback API stays loopback-only).
pub const SESSION_PORT: u16 = 57400;

pub struct ActiveSession {
    /// The running server task. Aborting it drops the server and frees the LAN
    /// port immediately (even with open SSE/WS connections), so the host can
    /// re-host right away. (The token and role are owned by the task.)
    task: tauri::async_runtime::JoinHandle<()>,
}

#[derive(Default)]
pub struct SessionState(pub Mutex<Option<ActiveSession>>);

/// Returned to the host UI when a session starts: the port plus the TLS cert
/// fingerprint a guest must pin (shared alongside the address + join token).
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionInfo {
    pub port: u16,
    pub fingerprint: String,
}

/// Best-effort LAN IP via the standard UDP-connect trick (no packet sent; the OS
/// reveals which local interface would route outward). Falls back to loopback.
/// Used as the session cert's SAN so it matches the address guests dial.
fn local_ip() -> String {
    std::net::UdpSocket::bind("0.0.0.0:0")
        .and_then(|s| { s.connect("8.8.8.8:80")?; s.local_addr() })
        .map(|a| a.ip().to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string())
}

/// Start hosting: bind the session server to the LAN and require `token`.
/// Returns the port it's serving on. Errors (reported to the UI) if a session is
/// already running, the token is empty, or the port can't be bound.
#[tauri::command]
pub async fn start_host_session(
    token: String,
    role: String,
    pm: State<'_, PmState>,
    bus: State<'_, EventBus>,
    session: State<'_, SessionState>,
    app: AppHandle,
) -> Result<SessionInfo, String> {
    let token = token.trim().to_string();
    if token.is_empty() {
        return Err("A join token is required to host a session.".into());
    }
    {
        let guard = session.0.lock().map_err(|e| e.to_string())?;
        if guard.is_some() {
            return Err("A session is already running.".into());
        }
    } // drop the guard before awaiting (a std MutexGuard can't cross .await)
    // Generate this session's self-signed TLS cert for the LAN IP, so the cert
    // matches the address guests dial; the guest pins it by fingerprint (no CA).
    let cert = crate::tls::generate_self_signed(&local_ip())?;
    let fingerprint = cert.fingerprint.clone();
    // Bind here (a std listener, for axum-server's TLS serve) so a port conflict
    // surfaces synchronously to the UI.
    let listener = std::net::TcpListener::bind(("0.0.0.0", SESSION_PORT))
        .map_err(|e| format!("Couldn't start the session server on port {}: {}", SESSION_PORT, e))?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    // Presence relay for this session's WebSocket (cursors/selections).
    let (presence_tx, _presence_rx) = tokio::sync::broadcast::channel::<String>(256);
    let state = AppState {
        pm: pm.inner().clone(),
        app: app.clone(),
        events: bus.0.clone(),
        presence: Some(presence_tx),
    };
    let tok = token.clone();
    let session_role = role.clone();
    let task = tauri::async_runtime::spawn(async move {
        serve_session(state, listener, tok, session_role, cert.cert_der, cert.key_der).await;
    });
    *session.0.lock().map_err(|e| e.to_string())? =
        Some(ActiveSession { task });
    Ok(SessionInfo { port: SESSION_PORT, fingerprint })
}

/// Stop hosting: gracefully shut the session server down. No-op if none running.
#[tauri::command]
pub fn stop_host_session(session: State<SessionState>) -> Result<(), String> {
    let mut guard = session.0.lock().map_err(|e| e.to_string())?;
    if let Some(s) = guard.take() {
        // Abort drops the server (and all its connections), releasing port 57400
        // immediately so a fresh session can bind without "address in use".
        s.task.abort();
    }
    Ok(())
}
