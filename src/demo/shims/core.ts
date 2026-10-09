// Shim for @tauri-apps/api/core in the web demo. `invoke` dispatches to the
// in-memory runtime; `convertFileSrc` is a no-op (URLs render; local file paths
// won't resolve in a browser — an accepted demo limitation).
export { invoke } from '../runtime';
export function convertFileSrc(filePath: string): string { return filePath; }
export function isTauri(): boolean { return false; }
