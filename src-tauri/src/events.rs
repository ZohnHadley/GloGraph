//! Shared graph-change event bus. Both the HTTP `event_layer` (API writes) and the
//! Tauri `publish_change` command (GUI edits) publish `ChangeEvent`s here; the SSE
//! endpoint `GET /api/events` streams them. Phase-1 Live Share groundwork: making
//! the stream reflect **GUI edits**, not only HTTP-API writes, so a subscriber (or
//! a future spectator client) sees everything that changes the host's graph.

use serde::Serialize;
use tauri::State;
use tokio::sync::broadcast;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChangeEvent {
    /// "node" | "edge" | "region" | "link" | "media" | "settings" | "tab" | "graph"
    pub kind: String,
    /// "created" | "updated" | "deleted" | "activated" | "reloaded" | "changed"
    pub action: String,
}

impl ChangeEvent {
    pub fn of(kind: &str, action: &str) -> Self {
        ChangeEvent { kind: kind.to_string(), action: action.to_string() }
    }
}

/// Tauri-managed handle to the broadcast bus, so commands can publish to the same
/// channel the HTTP server streams from.
#[derive(Clone)]
pub struct EventBus(pub broadcast::Sender<ChangeEvent>);

impl EventBus {
    pub fn publish(&self, ev: ChangeEvent) {
        let _ = self.0.send(ev); // Err just means there are no subscribers.
    }
}

/// `publish_change` — the desktop UI calls this (coalesced) whenever its graph
/// changes, so GUI edits land on `GET /api/events` alongside HTTP-API writes. A
/// coarse "graph changed" is enough for a subscriber/spectator to refetch.
#[tauri::command]
pub fn publish_change(bus: State<EventBus>) {
    bus.publish(ChangeEvent::of("graph", "changed"));
}
