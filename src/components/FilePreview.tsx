import { useEffect, useState } from 'react';
import {
  File as FileIcon, FileText, FileImage, FileSpreadsheet, Presentation, FileArchive, ExternalLink,
} from 'lucide-react';
import { openPath, openUrl } from '@tauri-apps/plugin-opener';
import type { NodeMedia } from '../types';
import { api } from '../lib/api';
import { extOf, baseNameOf } from '../lib/dropMedia';
import { fileCategory, isOfficeOoxml, isMarkdownExt, fileExtLabel } from '../lib/fileType';
import { renderMarkdown } from '../lib/markdown';

/** Type-appropriate lucide glyph for a file (used in the icon fallback + title row). */
export function fileGlyph(name: string, size: number) {
  const e = extOf(name).toLowerCase();
  const cat = fileCategory(name);
  let Icon = FileIcon;
  if (cat === 'image') Icon = FileImage;
  else if (e === 'pdf') Icon = FileText;
  else if (['docx', 'docm', 'doc'].includes(e)) Icon = FileText;
  else if (['xlsx', 'xlsm', 'xls', 'csv', 'tsv'].includes(e)) Icon = FileSpreadsheet;
  else if (['pptx', 'pptm', 'ppt'].includes(e)) Icon = Presentation;
  else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(e)) Icon = FileArchive;
  else if (cat === 'text') Icon = FileText;
  return <Icon size={size} />;
}

/**
 * Body of a file node: a type-appropriate preview (image / PDF / text-or-markdown /
 * Office thumbnail) or a file-type icon, plus an "open" button that hands the file
 * to the OS. `resolvedSrc` is the already-resolved URL (asset protocol / Live Share
 * stream / plain URL) from the card's `mediaSrc`.
 *
 * Text and Office-thumbnail previews read the local file through Rust commands, so
 * they only run for **local** files. A Live Share guest or the web demo can't reach
 * the file, so the read fails and the preview degrades to the icon. Image/PDF use
 * `resolvedSrc`, which a guest gets streamed from the host.
 */
export default function FilePreview({ item, resolvedSrc, showThumbnail = true }: {
  item: NodeMedia;
  resolvedSrc: string;
  /** When false, always show the file-type icon instead of a thumbnail/preview. */
  showThumbnail?: boolean;
}) {
  const name = item.label || baseNameOf(item.src);
  const cat = fileCategory(name);
  const canReadLocal = item.srcType === 'file'; // a guest/demo read just fails → icon

  const [text, setText] = useState<string | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [pdfThumb, setPdfThumb] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  // Text / markdown preview — read the head of the local file.
  useEffect(() => {
    if (!showThumbnail || cat !== 'text' || !canReadLocal) return;
    let cancelled = false;
    api.readTextFileHead(item.src, 4000).then(t => { if (!cancelled) setText(t); }).catch(() => {});
    return () => { cancelled = true; };
  }, [showThumbnail, cat, canReadLocal, item.src]);

  // Office thumbnail — best-effort extract of the embedded thumbnail.
  useEffect(() => {
    if (!showThumbnail || cat !== 'office' || !canReadLocal || !isOfficeOoxml(name)) return;
    let cancelled = false;
    let url: string | null = null;
    api.extractOfficeThumbnail(item.src).then(bytes => {
      if (cancelled || !bytes || !bytes.length) return;
      url = URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
      setThumb(url);
    }).catch(() => {});
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [showThumbnail, cat, canReadLocal, name, item.src]);

  // PDF first-page thumbnail — render page 1 to a canvas with pdf.js (lazy-loaded).
  // Local files are read as bytes; a guest/URL renders straight from resolvedSrc.
  useEffect(() => {
    if (!showThumbnail || cat !== 'pdf') return;
    if (!canReadLocal && !resolvedSrc) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const source = canReadLocal
          ? { data: new Uint8Array(await api.readLocalFile(item.src)) }
          : { url: resolvedSrc };
        const task = pdfjs.getDocument(source);
        const doc = await task.promise;
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(2, 600 / base.width);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          if (!cancelled) setPdfThumb(canvas.toDataURL('image/png'));
        }
        await task.destroy();
      } catch { /* unreadable / unsupported → degrade to icon */ }
    })();
    return () => { cancelled = true; };
  }, [showThumbnail, cat, canReadLocal, item.src, resolvedSrc]);

  function open(e: React.MouseEvent) {
    e.stopPropagation();
    if (item.srcType === 'file') void openPath(item.src);
    else void openUrl(item.src);
  }

  let body: React.ReactNode;
  if (!showThumbnail) {
    body = null; // fall through to the icon below
  } else if (cat === 'image' && resolvedSrc && !imgFailed) {
    body = <img className="file-preview__img" src={resolvedSrc} alt={name} draggable={false} onError={() => setImgFailed(true)} />;
  } else if (cat === 'pdf' && pdfThumb) {
    // Static first-page thumbnail (page 1 only); the "open" button hands the
    // full document to the OS viewer.
    body = <img className="file-preview__img" src={pdfThumb} alt={name} draggable={false} />;
  } else if (cat === 'text' && text != null && text.trim()) {
    body = isMarkdownExt(name)
      ? <div className="file-preview__text node-card__note-rendered">{renderMarkdown(text)}</div>
      : <pre className="file-preview__text">{text}</pre>;
  } else if (cat === 'office' && thumb) {
    body = <img className="file-preview__img" src={thumb} alt={name} draggable={false} />;
  }
  if (body == null) {
    body = (
      <div className="file-preview__icon">
        {fileGlyph(name, 30)}
        <span className="file-preview__ext">{fileExtLabel(name)}</span>
      </div>
    );
  }

  return (
    <div className="file-preview">
      {body}
      <button
        className="node-media-expand nodrag nopan"
        title="Open file"
        onClick={open}
        onMouseDown={e => e.stopPropagation()}
      >
        <ExternalLink size={11} />
      </button>
    </div>
  );
}
