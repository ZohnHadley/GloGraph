// Lean, dependency-free markdown renderer for note cards.
//
// Deliberately a *subset* (matches the industrial workstation aesthetic and keeps
// the bundle lean): headings, bold/italic/strikethrough, inline code, fenced code
// blocks, unordered/ordered lists, blockquotes, horizontal rules, and links.
//
// Safe by construction: it builds React elements from text (React escapes text
// nodes), never `dangerouslySetInnerHTML`, so note content can't inject HTML/JS.
// Link hrefs are restricted to http(s)/mailto; anything else renders as plain text.

import type { ReactNode } from 'react';

export interface MarkdownOptions {
  /** Called when a link is activated (e.g. open in the OS browser via the opener). */
  onLink?: (url: string) => void;
}

const SAFE_URL = /^(https?:|mailto:)/i;
const H_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

// Does a line start a non-paragraph block? Used to terminate paragraph runs.
function isBlockStart(line: string): boolean {
  return (
    /^```/.test(line) ||
    /^\s*([-*_])\1\1+\s*$/.test(line) ||
    /^#{1,6}\s/.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line)
  );
}

// Parse inline spans (code / bold / italic / strike / link) within a line of text.
function parseInline(text: string, keyBase: string, opts?: MarkdownOptions): ReactNode[] {
  const out: ReactNode[] = [];
  let plain = '';
  let i = 0;
  let k = 0;
  const flush = () => { if (plain) { out.push(plain); plain = ''; } };

  while (i < text.length) {
    const rest = text.slice(i);
    let m: RegExpExecArray | null;

    if ((m = /^`([^`]+)`/.exec(rest))) {
      flush();
      out.push(<code key={`${keyBase}-c${k++}`} className="md-code">{m[1]}</code>);
      i += m[0].length; continue;
    }
    if ((m = /^\*\*([^*]+?)\*\*/.exec(rest)) || (m = /^__([^_]+?)__/.exec(rest))) {
      flush();
      out.push(<strong key={`${keyBase}-b${k++}`}>{parseInline(m[1], `${keyBase}-b${k}`, opts)}</strong>);
      i += m[0].length; continue;
    }
    if ((m = /^~~([^~]+?)~~/.exec(rest))) {
      flush();
      out.push(<del key={`${keyBase}-s${k++}`}>{parseInline(m[1], `${keyBase}-s${k}`, opts)}</del>);
      i += m[0].length; continue;
    }
    if ((m = /^\*([^*\n]+?)\*/.exec(rest)) || (m = /^_([^_\n]+?)_/.exec(rest))) {
      flush();
      out.push(<em key={`${keyBase}-i${k++}`}>{parseInline(m[1], `${keyBase}-i${k}`, opts)}</em>);
      i += m[0].length; continue;
    }
    if ((m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest))) {
      const [whole, label, url] = m;
      if (SAFE_URL.test(url)) {
        flush();
        const href = url;
        out.push(
          <a
            key={`${keyBase}-l${k++}`}
            href={href}
            className="md-link"
            onClick={e => { e.preventDefault(); e.stopPropagation(); opts?.onLink?.(href); }}
          >
            {label}
          </a>
        );
      } else {
        plain += whole; // unsafe scheme → leave as literal text
      }
      i += whole.length; continue;
    }

    plain += text[i];
    i += 1;
  }
  flush();
  return out;
}

/**
 * Render a markdown source string to React nodes. Wrapped in a `.md` container so
 * the note-card CSS can scope its element styling.
 */
export function renderMarkdown(src: string, opts?: MarkdownOptions): ReactNode {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    // Fenced code block ``` … ```
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i += 1; }
      i += 1; // consume closing fence (if present)
      blocks.push(<pre key={key++} className="md-pre"><code>{buf.join('\n')}</code></pre>);
      continue;
    }

    // Horizontal rule (---, ***, ___)
    if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="md-hr" />);
      i += 1; continue;
    }

    // ATX heading
    const hm = /^(#{1,6})\s+(.*)$/.exec(line);
    if (hm) {
      const lvl = hm[1].length;
      const Tag = H_TAGS[lvl - 1];
      blocks.push(<Tag key={key++} className={`md-h md-h${lvl}`}>{parseInline(hm[2], `h${key}`, opts)}</Tag>);
      i += 1; continue;
    }

    // Blockquote (consume consecutive `>` lines, render recursively)
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i += 1; }
      blocks.push(<blockquote key={key++} className="md-quote">{renderMarkdown(buf.join('\n'), opts)}</blockquote>);
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/, '')); i += 1; }
      blocks.push(
        <ul key={key++} className="md-ul">
          {items.map((it, j) => <li key={j}>{parseInline(it, `ul${key}-${j}`, opts)}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i += 1; }
      blocks.push(
        <ol key={key++} className="md-ol">
          {items.map((it, j) => <li key={j}>{parseInline(it, `ol${key}-${j}`, opts)}</li>)}
        </ol>
      );
      continue;
    }

    // Paragraph: gather consecutive non-blank, non-block lines; soft-wrap with <br>.
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { para.push(lines[i]); i += 1; }
    const parsed: ReactNode[] = [];
    para.forEach((p, j) => {
      if (j) parsed.push(<br key={`br${key}-${j}`} />);
      parsed.push(...parseInline(p, `p${key}-${j}`, opts));
    });
    blocks.push(<p key={key++} className="md-p">{parsed}</p>);
  }

  return <div className="md">{blocks}</div>;
}
