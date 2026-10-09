// Shim for @tauri-apps/plugin-dialog. Save returns a pseudo-path (the runtime
// turns save into a browser download); Open shows a real file picker and returns
// an "upload://" pseudo-path the runtime can read back.
import { pickFile } from '../runtime';

interface SaveOpts { defaultPath?: string; filters?: any[]; }
export async function save(opts: SaveOpts = {}): Promise<string | null> {
  const base = opts.defaultPath ? String(opts.defaultPath) : 'graph';
  return base.toLowerCase().endsWith('.glograph') ? base : base + '.glograph';
}
export async function open(_opts: any = {}): Promise<string | null> {
  return pickFile();
}
export async function message(): Promise<void> {}
export async function ask(): Promise<boolean> { return false; }
export async function confirm(): Promise<boolean> { return false; }
