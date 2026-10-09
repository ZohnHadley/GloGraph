// Shim for @tauri-apps/api/window. The browser has no native window lifecycle,
// so close-requests never fire and destroy() is a no-op.
type CloseHandler = (event: { preventDefault: () => void }) => void;

class DemoWindow {
  async onCloseRequested(_cb: CloseHandler): Promise<() => void> { return () => {}; }
  async setTitle(_t: string): Promise<void> {}
  destroy(): void {}
  async close(): Promise<void> {}
  async show(): Promise<void> {}
  async setFocus(): Promise<void> {}
  async unminimize(): Promise<void> {}
}

const w = new DemoWindow();
export function getCurrentWindow(): DemoWindow { return w; }
export function getCurrent(): DemoWindow { return w; }
