// Client-only cache-bust tokens for media sources, keyed by media id.
//
// This lives OUTSIDE node/media React state on purpose: a node "Save" refetches
// the node (and its media) from the DB, which has no token — so a token stored
// on the media object would be wiped. Keeping it in this module-level registry
// means it survives refetches. It's bumped whenever a media source is added or
// edited, and appended to the media URL so the WebView refetches the resource
// instead of serving a cached image/video/audio.
const tokens = new Map<string, number>();

export function bumpMediaCacheBust(mediaId: string): void {
  tokens.set(mediaId, Date.now());
}

/** Returns `_cb=<token>` for the media id, or `''` if it has never been edited this session. */
export function mediaCacheBustParam(mediaId: string): string {
  const t = tokens.get(mediaId);
  return t == null ? '' : `_cb=${t}`;
}
