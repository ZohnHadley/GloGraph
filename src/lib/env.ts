// True only in the web demo build (`vite build --mode demo`). Used to gate the
// desktop-only / "pro" capabilities — the local HTTP API, the Python SDK, and
// Live Share — so the demo greys out access to them rather than pretending to
// offer them. Statically replaced by Vite at build time.
export const IS_DEMO = import.meta.env.MODE === 'demo';
