//! Closest-handle heuristic: given the vector from the source node's center to
//! the target's, pick which sides the connecting edge should leave and enter so
//! it uses the nearest-facing pair. Pure — no SQLite, axum, or Tauri. The single
//! source of truth for "which handles when none are specified": the Tauri
//! `create_edge` command, the HTTP edge handlers, and the web demo's JS mirror
//! (`src/lib/handles.ts`) all defer to the behaviour pinned here (see
//! `tests/fixtures/handle_cases.json`).

/// `(dx, dy)` is the target node's center minus the source node's center. Returns
/// `(source_handle, target_handle)`, each `"top" | "right" | "bottom" | "left"`.
/// The dominant axis selects the side pair; its sign selects which side faces the
/// other. Horizontal wins ties (`|dx| >= |dy|`), matching the GUI auto-wire.
pub fn closest_handles(dx: f64, dy: f64) -> (&'static str, &'static str) {
    if dx.abs() >= dy.abs() {
        if dx >= 0.0 { ("right", "left") } else { ("left", "right") }
    } else if dy >= 0.0 {
        ("bottom", "top")
    } else {
        ("top", "bottom")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Deserialize;

    #[derive(Deserialize)]
    struct Case {
        name: String,
        dx: f64,
        dy: f64,
        source: String,
        target: String,
    }

    /// Pins the Rust heuristic to the shared contract. The same JSON drives the
    /// TypeScript mirror (`src/lib/handles.test.ts`) used by the web demo, so the
    /// two can't diverge.
    #[test]
    fn matches_shared_fixture() {
        let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../tests/fixtures/handle_cases.json");
        let raw = std::fs::read_to_string(path).expect("read handle fixture");
        let cases: Vec<Case> = serde_json::from_str(&raw).expect("parse handle fixture");
        assert!(!cases.is_empty(), "fixture has no cases");
        for c in &cases {
            let (s, t) = closest_handles(c.dx, c.dy);
            assert_eq!(s, c.source, "source mismatch: {}", c.name);
            assert_eq!(t, c.target, "target mismatch: {}", c.name);
        }
    }
}
