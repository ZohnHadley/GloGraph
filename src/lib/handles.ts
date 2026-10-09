// Closest-handle heuristic — the web demo's JS mirror of the Rust core
// (src-tauri/src/core/handles.rs). The DESKTOP app does NOT use this: it sends
// null handles and the Rust backend (create_edge) resolves them, so the logic
// lives in one place there. Only the demo's in-browser backend
// (src/demo/runtime.ts) has no Rust, so it needs this copy — kept honest by the
// shared fixture tests/fixtures/handle_cases.json (see handles.test.ts). Same
// "one allowed duplicate" arrangement as src/lib/trace.ts.

export type HandleSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * `(dx, dy)` is the target node's center minus the source node's center.
 * Returns `[sourceHandle, targetHandle]`. The dominant axis picks the side pair;
 * its sign picks which side faces the other. Horizontal wins ties.
 */
export function closestHandles(dx: number, dy: number): [HandleSide, HandleSide] {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
  }
  return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'];
}
