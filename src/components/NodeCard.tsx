import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { GloNode, NodeMedia } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useGraphState, LOD_FULL, LOD_COMPACT, LOD_MINIMAL } from '../context/GraphStateContext';
import { mediaCacheBustParam } from '../lib/mediaCacheBust';
import { remoteMediaFileUrl } from '../lib/remoteMedia';
import { nodeDisplayLabel } from '../lib/nodeDisplay';
import { nodeObjectFor } from '../lib/graphObject';
import { renderMarkdown } from '../lib/markdown';
import FilePreview, { fileGlyph } from './FilePreview';
import { Link2, Image, ImageOff, Film, Music2, Play, Pause, Lock, Pin, PinOff, Maximize2, X, Volume2, VolumeX, StickyNote, ChevronsUpDown, ChevronsDownUp, Type, Pencil } from 'lucide-react';

type NodeCardProps = NodeProps & { data: GloNode };

function fmtTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function mediaSrc(item: NodeMedia) {
  let base: string;
  if (item.srcType === 'file') {
    // In a Live Share guest session, file media lives on the host — stream it
    // over the session (loopback TLS bridge); otherwise resolve the local file
    // through Tauri's asset protocol.
    base = remoteMediaFileUrl(item.id) ?? convertFileSrc(item.src);
  } else {
    base = item.src;
  }
  // Append the media's cache-bust token (bumped on add/edit) so the WebView
  // refetches rather than serving a cached image/video/audio.
  const cb = mediaCacheBustParam(item.id);
  if (!cb) return base;
  return base + (base.includes('?') ? '&' : '?') + cb;
}

function AudioPlayer({ item, onRegister }: { item: NodeMedia; onRegister?: (id: string, el: HTMLMediaElement | null) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Combined ref: keep our own handle AND register the element with the card so
  // it can pause/sync this player when the fullscreen modal takes over.
  const setRefs = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) { el.volume = volume; el.muted = muted; }
    onRegister?.(item.id, el);
  }, [item.id, onRegister, volume, muted]);

  // `volume`/`muted` are element properties (not reactive attributes), so push
  // them to the element whenever they change.
  useEffect(() => {
    const a = audioRef.current;
    if (a) { a.volume = volume; a.muted = muted; }
  }, [volume, muted]);

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    setMuted(m => !m);
  }

  function changeVolume(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const v = Number(e.target.value);
    setVolume(v);
    setMuted(v === 0);
  }

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    // Let the native play/pause events drive `playing` (so an external pause —
    // e.g. opening the expand modal — is reflected in this button too).
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setCurrentTime(t);
  }

  return (
    <div className="node-audio-player nodrag nopan">
      <audio
        ref={setRefs}
        src={mediaSrc(item)}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
      />
      {item.label && <span className="node-audio-player__label">{item.label}</span>}
      <div className="node-audio-player__controls">
        <button className="node-audio-player__btn" onClick={toggle} title={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={9} /> : <Play size={9} />}
        </button>
        <input
          type="range"
          className="node-audio-player__seek"
          min={0}
          max={duration || 100}
          value={currentTime}
          step={0.05}
          onChange={seek}
          onClick={e => e.stopPropagation()}
        />
        <span className="node-audio-player__time">
          {fmtTime(currentTime)}<span className="node-audio-player__dur">/{fmtTime(duration)}</span>
        </span>
        <div className="node-audio-player__volume nodrag nopan">
          <button className="node-audio-player__btn" onClick={toggleMute} title={muted || volume === 0 ? 'Unmute' : 'Mute'}>
            {muted || volume === 0 ? <VolumeX size={9} /> : <Volume2 size={9} />}
          </button>
          <input
            type="range"
            className="node-audio-player__vol"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={changeVolume}
            onClick={e => e.stopPropagation()}
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
}

// Shown on an audio item that has no source yet — the play button is disabled
// until the user sets one (per the item's intrinsic, non-removable media field).
function EmptyAudioPlayer() {
  return (
    <div className="node-audio-player node-audio-player--empty nodrag nopan">
      <div className="node-audio-player__controls">
        <button className="node-audio-player__btn" disabled title="No audio source yet">
          <Play size={9} />
        </button>
        <input type="range" className="node-audio-player__seek" min={0} max={100} value={0} disabled readOnly />
        <span className="node-audio-player__time">0:00<span className="node-audio-player__dur">/0:00</span></span>
      </div>
    </div>
  );
}

function ImageMedia({ item }: { item: NodeMedia }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  return (
    <div className="node-media-wrap">
      {status === 'loading' && <div className="node-media-placeholder" />}
      {status === 'error' && <div className="node-media-error">⚠ Failed to load</div>}
      <img
        src={mediaSrc(item)}
        alt={item.label || ''}
        className="node-media-img"
        draggable={false}
        style={status !== 'ok' ? { display: 'none' } : undefined}
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}

function VideoMedia({ item, onRegister }: { item: NodeMedia; onRegister?: (id: string, el: HTMLMediaElement | null) => void }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const setRef = useCallback((el: HTMLVideoElement | null) => {
    onRegister?.(item.id, el);
  }, [item.id, onRegister]);
  return (
    <div className="node-media-wrap">
      {status === 'loading' && <div className="node-media-placeholder" />}
      {status === 'error' && <div className="node-media-error">⚠ Failed to load</div>}
      <video
        ref={setRef}
        src={mediaSrc(item)}
        className="node-media-video nodrag nopan"
        controls
        preload="metadata"
        draggable={false}
        style={status !== 'ok' ? { display: 'none' } : undefined}
        onCanPlay={() => setStatus('ok')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}

// Inline-editable note body — type directly on the card; commits on blur.
// `nodrag`/`nowheel` keep typing, selecting, and scrolling from panning/zooming
// the canvas (and prevent a node-drag); a single click still selects the node
// (so its resize handles appear). Only dblclick is stopped, so double-clicking a
// word doesn't also open the detail panel.
// Wheel over a note body scrolls its text only when it can actually scroll in
// that direction; otherwise the wheel falls through to React Flow and zooms the
// canvas. (We drop the blanket `nowheel` so zoom works over short notes and at the
// scroll boundaries, and stop propagation only while the text is really scrolling.)
function attachScrollOrZoom(el: HTMLElement) {
  const onWheel = (e: WheelEvent) => {
    const oy = getComputedStyle(el).overflowY;
    if (oy !== 'auto' && oy !== 'scroll') return; // not scrollable → let RF zoom
    const canDown = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
    const canUp = el.scrollTop > 1;
    if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) e.stopPropagation();
  };
  el.addEventListener('wheel', onWheel);
  return () => el.removeEventListener('wheel', onWheel);
}

function EditableNote({ id, value, onCommit, autoFocus, onBlurDone }: {
  id: string;
  value: string;
  onCommit: (id: string, text: string) => void;
  autoFocus?: boolean;
  onBlurDone?: () => void;
}) {
  const [text, setText] = useState(value);
  const focusedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Load the note's text when a different note is shown (always).
  useEffect(() => { setText(value); }, [id]);
  // Pick up external changes (undo / API), but never while the user is typing here
  // — our own debounced commit echoes back as a `value` change and would otherwise
  // clobber in-progress input.
  useEffect(() => { if (!focusedRef.current) setText(value); }, [value]);
  // Flush a pending debounce if the card unmounts mid-edit.
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);
  // When opened from the rendered view (click-to-edit), focus + place caret at end.
  useEffect(() => {
    if (!autoFocus) return;
    const el = taRef.current;
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }, [autoFocus]);
  // Scroll the textarea when it overflows; otherwise the wheel zooms the canvas.
  useEffect(() => { const el = taRef.current; return el ? attachScrollOrZoom(el) : undefined; }, []);

  return (
    <textarea
      ref={taRef}
      className="node-card__note-edit nodrag"
      value={text}
      placeholder="Write a note…"
      onFocus={() => { focusedRef.current = true; }}
      onChange={e => {
        const next = e.target.value;
        setText(next);
        // Debounced commit-on-type so the body propagates as you write (sidebar
        // search, exports, the API); blur still flushes immediately below.
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onCommit(id, next), 400);
      }}
      onBlur={() => {
        focusedRef.current = false;
        if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
        onCommit(id, text);
        onBlurDone?.();
      }}
      onDoubleClick={e => e.stopPropagation()}
    />
  );
}

// Note body: with markdown styling on, render the body and flip to a raw textarea
// on click (click-to-edit). With it off, the body is the always-editable textarea.
function NoteBody({ id, value, markdownOn, editing, setEditing, onCommit }: {
  id: string;
  value: string;
  markdownOn: boolean;
  // Editing is owned by NodeCard (so the title-row edit button can drive it too).
  editing: boolean;
  setEditing: (v: boolean) => void;
  onCommit: (id: string, text: string) => void;
}) {
  const lastClickRef = useRef({ t: 0, x: 0, y: 0 });
  const viewRef = useRef<HTMLDivElement>(null);

  // Double-click to edit. A plain `onDoubleClick` on the card can't be used:
  // clicking a note selects it, and React Flow re-renders/reorders the node
  // between the two clicks, so the *second* click (and even the native `dblclick`,
  // in some webviews) lands on `.react-flow__pane`, not the note. So we detect the
  // double-click ourselves from two ordinary `click` events: a capture-phase
  // document listener arms when a click falls within this note's bounds, then fires
  // when a second click lands near the first within the window — geometry, not the
  // event target, so it survives the churn. The triggering click is swallowed so it
  // can't deselect the note. The title-row edit (pencil) button is the explicit path.
  useEffect(() => {
    if (editing) return;
    function onDocClick(e: MouseEvent) {
      const el = viewRef.current;
      if (!el) return;
      const last = lastClickRef.current;
      const near = Date.now() - last.t < 500 && Math.abs(e.clientX - last.x) < 6 && Math.abs(e.clientY - last.y) < 6;
      if (near) {
        e.preventDefault();
        e.stopPropagation();
        lastClickRef.current = { t: 0, x: 0, y: 0 };
        setEditing(true);
        return;
      }
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) lastClickRef.current = { t: Date.now(), x: e.clientX, y: e.clientY };
    }
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, [editing, setEditing]);

  // Wheel scrolls the note text only when it overflows; otherwise it zooms the
  // canvas (re-runs when the read view (re)mounts, i.e. on the editing toggle).
  useEffect(() => {
    if (editing) return;
    const el = viewRef.current;
    return el ? attachScrollOrZoom(el) : undefined;
  }, [editing]);

  if (editing) {
    return (
      <EditableNote
        id={id}
        value={value}
        onCommit={onCommit}
        autoFocus
        onBlurDone={() => setEditing(false)}
      />
    );
  }
  // Read view — a single click just selects the note (like any node); a
  // double-click starts inline text editing (see the effect above). Rendered as
  // markdown when the toggle is on, otherwise the raw text.
  return (
    <div
      ref={viewRef}
      className={`node-card__note-body nodrag${markdownOn ? ' node-card__note-rendered' : ''}`}
      title="Double-click to edit"
    >
      {value.trim()
        ? (markdownOn ? renderMarkdown(value, { onLink: url => { void openUrl(url); } }) : value)
        : <span className="node-card__note-empty">Write a note…</span>}
    </div>
  );
}

function NodeCard({ data, selected }: NodeCardProps) {
  const { getNodeColor, getNodeBadge, activeParamDefs, expandNodesByDefault } = useSettings();
  const { capturedIds, highlightedNodeIds, traceNodeIds, traceSeedId, edgeCountByNodeId, hoveredEndpointIds, pinnedNodeIds, connectingFromNodeId, pinnedExpandIds, expandOverrides, togglePinnedExpand, togglePin, flashingNodeId, updateNoteText, toggleRenderMarkdown, toggleShowThumbnail, resizeNode, lodTier, readOnly } = useGraphState();
  // An active trace dims everything it doesn't reach; the seed and reached nodes
  // get distinct accents. Falls back to the Select-Connected highlight dimming.
  const traceActive = traceNodeIds.size > 0;
  const isTraceSeed = traceSeedId === data.id;
  const isTraced = traceActive && !isTraceSeed && traceNodeIds.has(data.id);
  const dimmed = traceActive
    ? !traceNodeIds.has(data.id)
    : highlightedNodeIds.size > 0 && !highlightedNodeIds.has(data.id);
  const isFlashing = flashingNodeId === data.id;
  const isConnectingSource = connectingFromNodeId === data.id;
  const edgeCount = edgeCountByNodeId.get(data.id) ?? 0;
  const isEndpoint = hoveredEndpointIds.has(data.id);
  const isPinned = pinnedNodeIds.has(data.id);
  const isPinnedOpen = pinnedExpandIds.has(data.id);
  const expandOverride = expandOverrides.get(data.id); // boolean | undefined
  // Effective at-rest expansion: an explicit Expand/Collapse-shortcut override wins;
  // otherwise the per-card pin or the global "Expand nodes by default" preference.
  const effExpanded = expandOverride !== undefined ? expandOverride : (isPinnedOpen || expandNodesByDefault);
  const [modalItem, setModalItem] = useState<NodeMedia | null>(null);
  // Inline note editing (notes only). Owned here so the title-row edit button and
  // the in-body double-click both drive it. Per-node (NodeCard is keyed by id).
  const [noteEditing, setNoteEditing] = useState(false);
  // Live handles to the card's audio/video elements (registered by AudioPlayer /
  // VideoMedia), the playback position handed to the modal on open, and the
  // modal media element so we can read its position back on close.
  const cardMediaRefs = useRef<Map<string, HTMLMediaElement>>(new Map());
  const mediaStartRef = useRef(0);
  const modalMediaRef = useRef<HTMLMediaElement | null>(null);

  const registerMedia = useCallback((id: string, el: HTMLMediaElement | null) => {
    if (el) cardMediaRefs.current.set(id, el);
    else cardMediaRefs.current.delete(id);
  }, []);

  // Open the fullscreen viewer: pause the card's player and carry its position
  // into the modal so only one element ever plays (fixes duplicate playback).
  const openModal = useCallback((item: NodeMedia) => {
    const el = cardMediaRefs.current.get(item.id);
    mediaStartRef.current = el ? el.currentTime : 0;
    el?.pause();
    setModalItem(item);
  }, []);

  // Close the viewer: hand the modal's final position back to the card player
  // (it stays paused — the user can resume on the card).
  const closeModal = useCallback(() => {
    setModalItem(prev => {
      if (prev) {
        const el = cardMediaRefs.current.get(prev.id);
        const m = modalMediaRef.current;
        if (el && m && isFinite(m.currentTime)) el.currentTime = m.currentTime;
      }
      modalMediaRef.current = null;
      return null;
    });
  }, []);

  useEffect(() => {
    if (!modalItem) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalItem, closeModal]);

  const stripeColor = getNodeColor(data);
  const badge = getNodeBadge(data);

  const descPreview =
    data.description && data.description.length > 80
      ? data.description.slice(0, 80) + '…'
      : data.description;

  const cardParams = activeParamDefs
    .filter(def => {
      const pv = data.paramValues.find(p => p.paramDefId === def.id);
      return pv?.showOnCard && pv.value != null && pv.value !== '';
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(def => {
      const pv = data.paramValues.find(p => p.paramDefId === def.id)!;
      let display = pv.value ?? '';
      if (def.paramType === 'select_color' || def.paramType === 'select') {
        display = def.options.find(o => o.valueSlug === pv.value)?.label ?? pv.value ?? '';
      } else if (def.paramType === 'boolean') {
        display = pv.value === 'true' ? 'Yes' : 'No';
      }
      return { def, display };
    });

  const captured = capturedIds.has(data.id);

  const allMedia = data.media ?? [];
  const media = allMedia.filter(m => m.showOnCard !== false);
  const imgCount = media.filter(m => m.mediaType === 'image').length;
  const vidCount = media.filter(m => m.mediaType === 'video').length;
  const audCount = media.filter(m => m.mediaType === 'audio').length;
  const hasMetaRow = captured || data.links.length > 0 || imgCount > 0 || vidCount > 0 || audCount > 0 || data.confidence != null || edgeCount > 0;

  // ── Graph-item variants (see specs/GRAPH_ITEMS_DESIGN.md) ──────────────────
  // The graph-object subtype owns how it renders: notes are text-first, media
  // items media-first (both with primary content always visible), standard nodes
  // compact-by-default. The card asks the object rather than switching on kind.
  const gobj = nodeObjectFor(data);
  const layout = gobj.cardLayout();
  const isNote = layout === 'text-first';
  const isMediaKind = layout === 'media-first';
  const isFile = layout === 'file';
  const primaryMedia = (isMediaKind || isFile) ? gobj.primaryMedia() : undefined;
  // Notes render their body as markdown by default; per-note toggle (absent → on).
  const markdownOn = data.renderMarkdown !== false;
  // File nodes show a thumbnail/first-page preview by default; per-file toggle (absent → on).
  const thumbnailOn = data.showThumbnail !== false;
  // LOD: only the FULL tier renders media (img/video/audio are the heaviest per-card
  // cost); zoomed out, cards fall back to title + chrome. `lodClass` lets CSS thin
  // them further at the minimal tier (a near-rectangle).
  const showMedia = lodTier >= LOD_FULL;
  const lodClass =
    lodTier === LOD_MINIMAL ? ' node-card--lod-min'
    : lodTier === LOD_COMPACT ? ' node-card--lod-compact'
    : '';
  // Image/video/note/file are stretchable on the canvas (audio is a fixed control bar).
  const isResizable = data.kind === 'note' || data.kind === 'image' || data.kind === 'video' || data.kind === 'file';
  // Per-kind glyph shown before the title so items read as their own element type.
  const kindIcon =
    data.kind === 'note'  ? <StickyNote size={10} /> :
    data.kind === 'image' ? <Image size={10} /> :
    data.kind === 'video' ? <Film size={10} /> :
    data.kind === 'audio' ? <Music2 size={10} /> :
    data.kind === 'file'  ? fileGlyph(primaryMedia ? (primaryMedia.label || primaryMedia.src) : 'file', 10) : null;

  const renderMediaSlot = (item: NodeMedia) => {
    // Key on src so a changed source remounts the element (fresh load state).
    const key = `${item.id}:${item.src}`;
    return (
      <div key={key} className="node-media-slot">
        {item.mediaType === 'image' && <ImageMedia item={item} />}
        {item.mediaType === 'video' && <VideoMedia item={item} onRegister={registerMedia} />}
        {item.mediaType === 'audio' && <AudioPlayer item={item} onRegister={registerMedia} />}
        <button
          className="node-media-expand nodrag nopan"
          title="Expand"
          onClick={e => { e.stopPropagation(); openModal(item); }}
          onMouseDown={e => e.stopPropagation()}
        >
          <Maximize2 size={11} />
        </button>
      </div>
    );
  };

  return (
    <div className={`node-card ${selected ? 'node-card--selected' : ''} ${dimmed ? 'node-card--dimmed' : ''} ${isTraceSeed ? 'node-card--trace-seed' : ''} ${isTraced ? 'node-card--traced' : ''} ${isEndpoint ? 'node-card--endpoint' : ''} ${isConnectingSource ? 'node-card--connecting' : ''} ${effExpanded ? 'node-card--expand-default' : ''} ${expandOverride === false ? 'node-card--force-collapsed' : ''} ${isFlashing ? 'node-card--flash' : ''} ${isNote ? 'node-card--note' : ''} ${isMediaKind ? 'node-card--media' : ''} ${isFile ? 'node-card--media node-card--file' : ''} ${isResizable ? 'node-card--resizable' : ''} ${isPinned ? 'node-card--pinned' : ''}${lodClass}`}>
      {isResizable && !readOnly && (
        <NodeResizer
          isVisible={selected}
          minWidth={120}
          minHeight={60}
          onResizeEnd={(_e, p) => resizeNode(data.id, p.x, p.y, p.width, p.height)}
        />
      )}
      <Handle type="source" id="top"    position={Position.Top}    className="node-handle" title="Drag to connect" />
      <Handle type="source" id="bottom" position={Position.Bottom} className="node-handle" title="Drag to connect" />
      <Handle type="source" id="left"   position={Position.Left}   className="node-handle" title="Drag to connect" />
      <Handle type="source" id="right"  position={Position.Right}  className="node-handle" title="Drag to connect" />

      <div className="node-card__stripe" style={{ background: stripeColor }} />

      <div className="node-card__body">
        <div className="node-card__title-row">
          {kindIcon && <span className="node-card__kind-icon" aria-hidden>{kindIcon}</span>}
          <p className="node-card__title" title={nodeDisplayLabel(data)}>{nodeDisplayLabel(data)}</p>
          {isNote && !readOnly && !noteEditing && (
            <button
              className="node-card__edit-toggle nodrag nopan"
              onClick={e => { e.stopPropagation(); setNoteEditing(true); }}
              onMouseDown={e => e.stopPropagation()}
              title="Edit note text"
            >
              <Pencil size={9} />
            </button>
          )}
          {isNote && !readOnly && (
            <button
              className={`node-card__md-toggle nodrag nopan${markdownOn ? ' node-card__md-toggle--active' : ''}`}
              onClick={e => { e.stopPropagation(); toggleRenderMarkdown(data.id); }}
              onMouseDown={e => e.stopPropagation()}
              title={markdownOn ? 'Markdown styling on — click for raw text' : 'Markdown styling off — click to style'}
            >
              <Type size={9} />
            </button>
          )}
          {isFile && !readOnly && (
            <button
              className={`node-card__md-toggle nodrag nopan${thumbnailOn ? ' node-card__md-toggle--active' : ''}`}
              onClick={e => { e.stopPropagation(); toggleShowThumbnail(data.id); }}
              onMouseDown={e => e.stopPropagation()}
              title={thumbnailOn ? 'Preview on — click to show icon only' : 'Preview off — click to show thumbnail'}
            >
              {thumbnailOn ? <Image size={9} /> : <ImageOff size={9} />}
            </button>
          )}
          <button
            className={`node-card__pin-toggle nodrag nopan${isPinned ? ' node-card__pin-toggle--active' : ''}`}
            onClick={e => { e.stopPropagation(); togglePin(data.id); }}
            onMouseDown={e => e.stopPropagation()}
            title={isPinned ? 'Unpin position (allow dragging)' : 'Pin position (prevent dragging)'}
          >
            {isPinned ? <PinOff size={9} /> : <Pin size={9} />}
          </button>
          <button
            className={`node-card__expand-toggle nodrag nopan${isPinnedOpen ? ' node-card__expand-toggle--active' : ''}`}
            onClick={e => { e.stopPropagation(); togglePinnedExpand(data.id); }}
            onMouseDown={e => e.stopPropagation()}
            title={isPinnedOpen ? 'Collapse on mouse-out' : 'Keep expanded'}
          >
            {isPinnedOpen ? <ChevronsDownUp size={9} /> : <ChevronsUpDown size={9} />}
          </button>
        </div>

        {/* Graph-item primary content — always visible (not hover-gated).
            With no source yet: image/video show a placeholder icon; audio shows
            a disabled player (the intrinsic media field is non-removable). */}
        {isMediaKind && showMedia && (
          primaryMedia ? (
            // An image is static, so dragging it moves the node (only its Maximize
            // button opts out). Video/audio carry interactive controls, so their
            // media area stays `nodrag` and you move them via the title row.
            <div className={`node-card__item-media${data.kind === 'image' ? '' : ' nodrag'}`}>{renderMediaSlot(primaryMedia)}</div>
          ) : data.kind === 'audio' ? (
            <div className="node-card__item-media nodrag"><EmptyAudioPlayer /></div>
          ) : (
            <div className="node-card__item-media node-card__item-placeholder nodrag" title="No source yet">
              {data.kind === 'video' ? <Film size={28} /> : <Image size={28} />}
            </div>
          )
        )}
        {isNote && (
          <NoteBody id={data.id} value={data.description ?? ''} markdownOn={markdownOn} editing={noteEditing} setEditing={setNoteEditing} onCommit={updateNoteText} />
        )}
        {isFile && showMedia && (
          primaryMedia ? (
            <div className="node-card__item-media nodrag">
              <FilePreview item={primaryMedia} resolvedSrc={mediaSrc(primaryMedia)} showThumbnail={thumbnailOn} />
            </div>
          ) : (
            <div className="node-card__item-media node-card__item-placeholder nodrag" title="No file yet — add one in the panel or drop a file here">
              {fileGlyph('file', 28)}
            </div>
          )
        )}

        <div className="node-card__details">
          {(badge || data.eventDate) && (
            <div className="node-card__header">
              {badge && (
                <span className="node-card__badge" style={{ color: badge.color }}>
                  {badge.label}
                </span>
              )}
              {data.eventDate && (
                <span className="node-card__date">{data.eventDate}</span>
              )}
            </div>
          )}

          {!isNote && descPreview && (
            <p className="node-card__desc">{descPreview}</p>
          )}

          {cardParams.length > 0 && (
            <div className="node-card__params">
              {cardParams.map(({ def, display }) => (
                <div key={def.id} className="node-card__param">
                  <span className="node-card__param-label">{def.displayName}</span>
                  <span className="node-card__param-value">{display}</span>
                </div>
              ))}
            </div>
          )}

          {data.tags && data.tags.length > 0 && (
            <div className="node-card__tags">
              {data.tags.map(tag => (
                <span key={tag} className="node-tag">{tag}</span>
              ))}
            </div>
          )}

          {hasMetaRow && (
            <div className="node-card__meta">
              {data.links.length > 0 && (
                <span className="node-card__meta-item">
                  <Link2 size={10} />
                  {data.links.length}
                </span>
              )}
              {imgCount > 0 && (
                <span className="node-card__meta-item">
                  <Image size={10} />
                  {imgCount}
                </span>
              )}
              {vidCount > 0 && (
                <span className="node-card__meta-item">
                  <Film size={10} />
                  {vidCount}
                </span>
              )}
              {audCount > 0 && (
                <span className="node-card__meta-item">
                  <Music2 size={10} />
                  {audCount}
                </span>
              )}
              {edgeCount > 0 && (
                <span className="node-card__meta-item" title={`${edgeCount} connection${edgeCount !== 1 ? 's' : ''}`}>
                  ⇄ {edgeCount}
                </span>
              )}
              {data.confidence != null && (
                <span className="node-card__meta-item node-card__meta-item--confidence">
                  {data.confidence}%
                </span>
              )}
              {captured && (
                <span className="node-card__meta-item node-card__meta-item--captured" title="Captured by locked region">
                  <Lock size={9} />
                </span>
              )}
            </div>
          )}

          {/* Media-kind items show their single media as the always-visible
              primary content above, so skip the hover-details media loop; a file
              node likewise shows its file via FilePreview, not as `node_media`. */}
          {!isMediaKind && !isFile && showMedia && media.length > 0 && (
            // `nodrag` keeps grabbing media from dragging the node, but we no
            // longer block wheel/pan here — so zooming and panning still work
            // with the cursor over media. Interactive controls (video/audio)
            // carry their own nopan so their scrubbers aren't hijacked (wheel still
            // bubbles to the canvas so zoom works while hovering them).
            <div className="node-card__media nodrag">
              {media.map(renderMediaSlot)}
            </div>
          )}

          {modalItem && createPortal(
            <div
              className="media-modal-overlay"
              onClick={closeModal}
              onMouseDown={e => e.stopPropagation()}
            >
              <div className="media-modal" onClick={e => e.stopPropagation()}>
                <button className="media-modal__close" title="Close (Esc)" onClick={closeModal}>
                  <X size={16} />
                </button>
                {modalItem.mediaType === 'image' && (
                  <img src={mediaSrc(modalItem)} alt={modalItem.label || ''} className="media-modal__media" />
                )}
                {modalItem.mediaType === 'video' && (
                  <video
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    ref={el => { modalMediaRef.current = el; }}
                    src={mediaSrc(modalItem)}
                    className="media-modal__media"
                    controls
                    autoPlay
                    onLoadedMetadata={e => { e.currentTarget.currentTime = mediaStartRef.current; }}
                  />
                )}
                {modalItem.mediaType === 'audio' && (
                  <div className="media-modal__audio">
                    {modalItem.label && <div className="media-modal__audio-label">{modalItem.label}</div>}
                    <audio
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      ref={el => { modalMediaRef.current = el; }}
                      src={mediaSrc(modalItem)}
                      controls
                      autoPlay
                      onLoadedMetadata={e => { e.currentTarget.currentTime = mediaStartRef.current; }}
                    />
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(NodeCard);
