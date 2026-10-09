//! Pure graph-engine logic — **no I/O**: no SQLite, axum, or Tauri imports here.
//! This is the single source of truth for derived graph computations (trace
//! today; future propagation/analysis next). Thin wrappers — the Tauri commands,
//! the HTTP handlers, and eventually remote/Live-Share clients — call in here and
//! stay boring. The web demo's JS runtime mirrors this logic and is kept honest
//! by shared fixtures under `tests/fixtures/`.

pub mod trace;
pub mod handles;
