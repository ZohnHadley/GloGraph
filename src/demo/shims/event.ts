// Shim for @tauri-apps/api/event. Backed by the runtime's in-memory bus.
import { on } from '../runtime';
export type UnlistenFn = () => void;
export function listen<T = any>(event: string, handler: (e: { payload: T }) => void): Promise<UnlistenFn> {
  return Promise.resolve(on(event, handler as any));
}
export function once<T = any>(event: string, handler: (e: { payload: T }) => void): Promise<UnlistenFn> {
  const un = on(event, (e) => { un(); handler(e as any); });
  return Promise.resolve(un);
}
export function emit(): Promise<void> { return Promise.resolve(); }
