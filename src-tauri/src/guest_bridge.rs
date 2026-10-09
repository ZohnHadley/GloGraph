//! Live Share guest loopback TLS bridge.
//!
//! The guest webview can't trust the host's self-signed cert, and there's no JS
//! API to pin one — so instead of the webview talking HTTPS to the host directly,
//! it talks **plain HTTP/WS to 127.0.0.1** (same machine, nothing to sniff) and
//! this bridge forwards each request to the host's **HTTPS/WSS** session server
//! with the host cert **pinned by fingerprint** (`crate::tls`). The cross-machine
//! hop is encrypted + pinned; the webview's fetch/EventSource/WebSocket code is
//! unchanged (it just points at the loopback URL this returns).

use std::sync::{Arc, Mutex};

use axum::{
    body::Body,
    extract::{ws::{Message as AxumMsg, WebSocket, WebSocketUpgrade}, State},
    http::{header, HeaderMap, Method, StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::any,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use tauri::State as TauriState;
use tokio_tungstenite::tungstenite::{client::IntoClientRequest, Message as WsMsg};
use tower_http::cors::{self, CorsLayer};

#[derive(Clone)]
struct BridgeState {
    /// Host session server, e.g. "192.168.0.5:57400".
    host: String,
    client: reqwest::Client,
    ws_connector: tokio_tungstenite::Connector,
}

/// Holds the running bridge task so it can be torn down (aborting frees the
/// loopback port immediately). Tauri-managed, app-global — one bridge at a time.
#[derive(Default)]
pub struct GuestBridge(pub Mutex<Option<tauri::async_runtime::JoinHandle<()>>>);

/// Start the loopback bridge to `host` (pinning its cert by `fingerprint`) and
/// return the `http://127.0.0.1:<port>` base the guest should use. Tears down any
/// previous bridge first.
#[tauri::command]
pub async fn start_guest_bridge(
    host: String,
    fingerprint: String,
    bridge: TauriState<'_, GuestBridge>,
) -> Result<String, String> {
    if let Some(prev) = bridge.0.lock().map_err(|e| e.to_string())?.take() {
        prev.abort();
    }
    let host = host.trim().to_string();
    if host.is_empty() {
        return Err("Missing host address.".into());
    }
    let fp = fingerprint.trim().to_lowercase();
    if fp.is_empty() {
        return Err("Missing host certificate fingerprint.".into());
    }

    let client_config = crate::tls::pinned_client_config(&fp);
    let client = reqwest::Client::builder()
        .use_preconfigured_tls(client_config.clone())
        .build()
        .map_err(|e| e.to_string())?;
    let ws_connector = tokio_tungstenite::Connector::Rustls(Arc::new(client_config));

    let state = BridgeState { host, client, ws_connector };

    // The webview talks to the bridge cross-origin (tauri.localhost → 127.0.0.1),
    // so the bridge needs CORS. It's loopback-only and the real auth is the token
    // forwarded to the host, so allow any origin (+ the headers the client sends).
    let cors = CorsLayer::new()
        .allow_origin(cors::Any)
        .allow_methods(cors::Any)
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/ws", any(ws_proxy))
        .fallback(any(http_proxy))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(("127.0.0.1", 0)).await.map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    let task = tauri::async_runtime::spawn(async move {
        let _ = axum::serve(listener, app).await;
    });
    *bridge.0.lock().map_err(|e| e.to_string())? = Some(task);
    Ok(format!("http://127.0.0.1:{}", port))
}

/// Stop the loopback bridge (no-op if none). Aborting drops the server and frees
/// the loopback port immediately.
#[tauri::command]
pub fn stop_guest_bridge(bridge: TauriState<GuestBridge>) -> Result<(), String> {
    if let Some(t) = bridge.0.lock().map_err(|e| e.to_string())?.take() {
        t.abort();
    }
    Ok(())
}

/// Forward a non-WS request to the host over pinned TLS, streaming the response
/// back (so SSE `/api/events` streams through unbuffered).
async fn http_proxy(
    State(st): State<BridgeState>,
    method: Method,
    uri: Uri,
    headers: HeaderMap,
    body: Body,
) -> Response {
    let pq = uri.path_and_query().map(|p| p.as_str()).unwrap_or("/");
    let url = format!("https://{}{}", st.host, pq);

    // 64 MB cap — large enough for media uploads, matching the session server.
    let body_bytes = match axum::body::to_bytes(body, 64 * 1024 * 1024).await {
        Ok(b) => b,
        Err(_) => return (StatusCode::BAD_REQUEST, "bridge: request body too large").into_response(),
    };

    let mut req = st.client.request(method, &url);
    // Forward just the headers the session API uses (token + content negotiation).
    for name in ["authorization", "content-type", "accept"] {
        if let Some(v) = headers.get(name) {
            req = req.header(name, v);
        }
    }
    if !body_bytes.is_empty() {
        req = req.body(body_bytes.to_vec());
    }

    let resp = match req.send().await {
        Ok(r) => r,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("bridge: {}", e)).into_response(),
    };

    let mut out = Response::builder().status(resp.status());
    // Preserve content type + caching so JSON and the SSE stream render correctly.
    for name in ["content-type", "cache-control"] {
        if let Some(v) = resp.headers().get(name) {
            out = out.header(name, v);
        }
    }
    out.body(Body::from_stream(resp.bytes_stream()))
        .unwrap_or_else(|_| StatusCode::BAD_GATEWAY.into_response())
}

/// Upgrade the webview's WS and bridge it to the host's WSS `/ws` (pinned),
/// pumping frames both ways.
async fn ws_proxy(State(st): State<BridgeState>, ws: WebSocketUpgrade, uri: Uri) -> Response {
    let query = uri.query().map(|q| format!("?{}", q)).unwrap_or_default();
    ws.on_upgrade(move |client_ws| bridge_ws(client_ws, st, query))
}

async fn bridge_ws(client_ws: WebSocket, st: BridgeState, query: String) {
    let url = format!("wss://{}/ws{}", st.host, query);
    let req = match url.into_client_request() {
        Ok(r) => r,
        Err(_) => return,
    };
    let (host_ws, _resp) = match tokio_tungstenite::connect_async_tls_with_config(
        req,
        None,
        false,
        Some(st.ws_connector.clone()),
    ).await {
        Ok(x) => x,
        Err(_) => return,
    };

    let (mut client_tx, mut client_rx) = client_ws.split();
    let (mut host_tx, mut host_rx) = host_ws.split();

    // webview → host. Convert through owned String/Vec so the (separate) axum and
    // tungstenite byte types don't have to be identical.
    let c2h = async {
        while let Some(Ok(msg)) = client_rx.next().await {
            let out = match msg {
                AxumMsg::Text(t) => WsMsg::Text(t.as_str().to_owned().into()),
                AxumMsg::Binary(b) => WsMsg::Binary(b.to_vec().into()),
                AxumMsg::Close(_) => break,
                _ => continue, // ping/pong handled by the stacks
            };
            if host_tx.send(out).await.is_err() {
                break;
            }
        }
    };
    // host → webview.
    let h2c = async {
        while let Some(Ok(msg)) = host_rx.next().await {
            let out = match msg {
                WsMsg::Text(t) => AxumMsg::Text(t.as_str().to_owned().into()),
                WsMsg::Binary(b) => AxumMsg::Binary(b.to_vec().into()),
                WsMsg::Close(_) => break,
                _ => continue,
            };
            if client_tx.send(out).await.is_err() {
                break;
            }
        }
    };
    tokio::select! { _ = c2h => {}, _ = h2c => {} }
}
