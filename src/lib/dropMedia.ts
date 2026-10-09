// Pure helpers for drag-and-drop media: map a file path or URL to a node-media
// kind (image/video/audio) by extension, and pull a usable URL out of a drag's
// dataTransfer. "Accept all common, degrade" — we recognise a broad set of
// extensions; formats the WebView can't actually play just render the existing
// media-error placeholder rather than being rejected on drop.

export type MediaKind = 'image' | 'video' | 'audio';

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'ico', 'heic', 'heif']);
const VIDEO_EXT = new Set(['mp4', 'm4v', 'webm', 'mov', 'mkv', 'avi', 'ogv', '3gp', '3g2', 'm2ts', 'mts', 'wmv', 'flv', 'mpg', 'mpeg']);
const AUDIO_EXT = new Set(['mp3', 'wav', 'm4a', 'aac', 'flac', 'opus', 'weba', 'oga', 'ogg', 'wma', 'aiff', 'aif', 'mid', 'midi']);

export function mediaKindForExt(ext: string): MediaKind | null {
  const e = ext.replace(/^\./, '').toLowerCase();
  if (IMAGE_EXT.has(e)) return 'image';
  if (VIDEO_EXT.has(e)) return 'video';
  if (AUDIO_EXT.has(e)) return 'audio';
  return null;
}

/** Extension (no dot) of a file path or URL — query/hash stripped first. */
export function extOf(pathOrUrl: string): string {
  const clean = pathOrUrl.split(/[?#]/)[0];
  const base = clean.split(/[\\/]/).pop() ?? clean;
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1) : '';
}

/** Filename of a path or URL, used as the media label. */
export function baseNameOf(pathOrUrl: string): string {
  const clean = pathOrUrl.split(/[?#]/)[0];
  const base = clean.split(/[\\/]/).pop() ?? clean;
  try { return decodeURIComponent(base); } catch { return base; }
}

export function mediaKindForPath(pathOrUrl: string): MediaKind | null {
  return mediaKindForExt(extOf(pathOrUrl));
}

/** First usable URL from a drag's dataTransfer (uri-list preferred, else plain
 *  text that looks like an http(s) URL). Only available during the `drop` event. */
export function urlFromDataTransfer(dt: DataTransfer | null): string | null {
  if (!dt) return null;
  const uriList = dt.getData('text/uri-list');
  if (uriList) {
    const first = uriList.split('\n').map(s => s.trim()).find(s => s && !s.startsWith('#'));
    if (first) return first;
  }
  const text = dt.getData('text/plain').trim();
  if (/^https?:\/\/\S+$/i.test(text)) return text;
  return null;
}
