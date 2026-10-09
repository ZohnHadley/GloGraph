// Shim for @tauri-apps/plugin-opener. URLs open in a new tab; local file paths
// can't be opened from a browser, so that's a no-op in the demo.
export async function openUrl(url: string): Promise<void> {
  let u = url;
  if (!/^https?:\/\//i.test(u) && !u.startsWith('mailto:')) u = 'https://' + u;
  window.open(u, '_blank', 'noopener,noreferrer');
}
export async function openPath(_path: string): Promise<void> { /* no-op in the browser */ }
export async function revealItemInDir(_path: string): Promise<void> {}
