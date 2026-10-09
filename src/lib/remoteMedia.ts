// Where a Live Share GUEST fetches file-type media from. Host file media (and
// guest-uploaded files) live on the host, so the guest streams them over the
// session through the loopback TLS bridge. Set while a guest session is active;
// null for the host / solo (which renders its local files via Tauri's asset
// protocol). The token is passed in the query because <img>/<video>/<audio>
// can't send an Authorization header.
let base: string | null = null;
let token = '';

export function setRemoteMedia(b: string | null, t = ''): void {
  base = b;
  token = t;
}

/** The streaming URL for a file media item, or null when not in a guest session. */
export function remoteMediaFileUrl(mediaId: string): string | null {
  if (!base) return null;
  return `${base.replace(/\/+$/, '')}/api/media/${encodeURIComponent(mediaId)}/file?token=${encodeURIComponent(token)}`;
}
