// Classify a file (by name/extension) for the file-node preview. "Accept all,
// degrade": anything we don't recognise renders as a plain file icon.
import { extOf } from './dropMedia';

export type FileCategory = 'image' | 'pdf' | 'text' | 'office' | 'other';

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'jfif', 'gif', 'webp', 'bmp', 'svg', 'avif', 'ico']);
const TEXT_EXT = new Set([
  'txt', 'text', 'md', 'markdown', 'mdx', 'rst', 'log', 'csv', 'tsv', 'json', 'jsonc', 'xml',
  'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env', 'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx',
  'py', 'rb', 'rs', 'go', 'java', 'kt', 'c', 'h', 'hpp', 'cpp', 'cc', 'cs', 'php', 'swift',
  'sh', 'bash', 'zsh', 'ps1', 'sql', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'tex', 'r',
]);
// OOXML (zip-based) Office files may embed a thumbnail we can extract; the old
// binary formats can't, so they fall back to an icon.
const OFFICE_OOXML_EXT = new Set(['docx', 'docm', 'pptx', 'pptm', 'xlsx', 'xlsm']);
const OFFICE_LEGACY_EXT = new Set(['doc', 'ppt', 'xls']);

export function fileCategory(nameOrPath: string): FileCategory {
  const ext = extOf(nameOrPath).toLowerCase();
  if (IMAGE_EXT.has(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (TEXT_EXT.has(ext)) return 'text';
  if (OFFICE_OOXML_EXT.has(ext) || OFFICE_LEGACY_EXT.has(ext)) return 'office';
  return 'other';
}

/** OOXML Office file → an embedded thumbnail may be extractable (best-effort). */
export function isOfficeOoxml(nameOrPath: string): boolean {
  return OFFICE_OOXML_EXT.has(extOf(nameOrPath).toLowerCase());
}

/** Render a text preview as markdown (vs plain monospace) for markdown files. */
export function isMarkdownExt(nameOrPath: string): boolean {
  const e = extOf(nameOrPath).toLowerCase();
  return e === 'md' || e === 'markdown' || e === 'mdx';
}

/** Short uppercase type label shown on the icon fallback (e.g. "PDF", "DOCX"). */
export function fileExtLabel(nameOrPath: string): string {
  return (extOf(nameOrPath) || 'file').toUpperCase().slice(0, 5);
}
