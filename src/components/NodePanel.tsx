import { useEffect, useRef, useState } from 'react';
import { X, Trash2, Plus, ExternalLink, Loader, ChevronDown, ChevronRight, Film, Music2, Image as ImageIcon, File as FileIcon, FolderOpen, Pin, PinOff, Pencil, Check, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { open as dialogOpen } from '@tauri-apps/plugin-dialog';
import { openPath, openUrl } from '@tauri-apps/plugin-opener';
import { convertFileSrc } from '@tauri-apps/api/core';
import {
  GloNode, GloEdge, NodeMedia,
  CreateNodeInput, UpdateNodeInput, AddLinkInput, AddMediaInput,
  NodeParamValueInput,
} from '../types';
import { useSettings } from '../context/SettingsContext';
import { mediaCacheBustParam } from '../lib/mediaCacheBust';
import { nodeDisplayLabel } from '../lib/nodeDisplay';
import { SWATCH_COLORS } from '../lib/swatches';
import { baseNameOf } from '../lib/dropMedia';

interface NodePanelProps {
  node?: GloNode;
  defaultPosition?: { x: number; y: number };
  onClose: () => void;
  onSave: (input: CreateNodeInput | UpdateNodeInput) => Promise<void>;
  onDelete?: (id: string) => void;
  onAddLink?: (input: AddLinkInput) => void;
  onRemoveLink?: (linkId: string, nodeId: string) => void;
  onAddMedia?: (input: AddMediaInput) => Promise<NodeMedia>;
  onUpdateMedia?: (id: string, nodeId: string, label: string | null, src: string, srcType: string) => Promise<NodeMedia>;
  onUpdateMediaShowOnCard?: (id: string, nodeId: string, showOnCard: boolean) => void;
  onReorderMedia?: (nodeId: string, mediaId: string, direction: 'up' | 'down') => void;
  onRemoveMedia?: (id: string, nodeId: string) => void;
  edges?: GloEdge[];
  allNodes?: GloNode[];
  onNavigateToNode?: (node: GloNode) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  /** View-only guest: render the panel read-only (inputs disabled, no save/delete). */
  readOnly?: boolean;
}

// FieldId: fixed fields + one entry per param def ID + one entry per saved media item
type FixedFieldId = 'eventDate' | 'description' | 'color' | 'links';
type FieldId = FixedFieldId | `param:${string}` | `media:${string}`;

const FIXED_FIELDS: { id: FixedFieldId; label: string; editOnly?: boolean }[] = [
  { id: 'eventDate',       label: 'Event Date' },
  { id: 'description',     label: 'Description' },
  { id: 'color',           label: 'Accent Color', editOnly: true },
  { id: 'links',           label: 'Links',        editOnly: true },
];

function initVisibleFields(node: GloNode | undefined, paramDefIds: string[]): Set<FieldId> {
  // New node: surface the active preset's params up front so the form reflects
  // the current preset's schema (not an empty form). Generic fields stay opt-in.
  if (!node) return new Set(paramDefIds.map(id => `param:${id}` as FieldId));
  const v = new Set<FieldId>();
  // Notes are text-first: the body is edited inline on the card, so the panel does
  // NOT surface a Description field for them — one source of truth, no second editor.
  if (node.eventDate) v.add('eventDate');
  if (node.description && node.kind !== 'note') v.add('description');
  if (node.color) v.add('color');
  if (node.links?.length) v.add('links');
  for (const m of node.media ?? []) v.add(`media:${m.id}`);
  for (const defId of paramDefIds) {
    const pv = node.paramValues?.find(p => p.paramDefId === defId);
    if (pv?.value != null && pv.value !== '') v.add(`param:${defId}`);
  }
  return v;
}

export default function NodePanel({
  node,
  defaultPosition,
  onClose,
  onSave,
  onDelete,
  onAddLink,
  onRemoveLink,
  onAddMedia,
  onUpdateMedia,
  onUpdateMediaShowOnCard,
  onReorderMedia,
  onRemoveMedia,
  edges,
  allNodes,
  onNavigateToNode,
  isPinned,
  onTogglePin,
  readOnly,
}: NodePanelProps) {
  const { activeParamDefs } = useSettings();
  const isCreate = !node;
  const [idCopied, setIdCopied] = useState(false);

  const adjacentNodes: GloNode[] = (() => {
    if (isCreate || !node || !edges || !allNodes) return [];
    const seen = new Set<string>();
    const result: GloNode[] = [];
    for (const e of edges) {
      if (e.sourceId !== node.id && e.targetId !== node.id) continue;
      const otherId = e.sourceId === node.id ? e.targetId : e.sourceId;
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      const other = allNodes.find(n => n.id === otherId);
      if (other) result.push(other);
    }
    return result;
  })();

  const [title, setTitle] = useState(node?.title ?? '');
  const [description, setDescription] = useState(node?.description ?? '');
  const [eventDate, setEventDate] = useState(node?.eventDate ?? '');
  const [color, setColor] = useState(node?.color ?? '');
  const [paramValues, setParamValues] = useState<Record<string, { value: string; isEnabled: boolean; showOnCard: boolean }>>({});
  const [tags, setTags] = useState<string[]>(node?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [localMedia, setLocalMedia] = useState<NodeMedia[]>(node?.media ?? []);
  const [pendingMedia, setPendingMedia] = useState<{
    tempId: string;
    mediaType: 'image' | 'video' | 'audio' | 'file';
    srcType: 'file' | 'url';
    src: string;
    label: string;
  }[]>([]);
  const [expandedMediaId, setExpandedMediaId] = useState<string | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ src: string; srcType: 'file' | 'url'; label: string } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Set<FieldId>>(
    () => initVisibleFields(node, activeParamDefs.map(d => d.id))
  );
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [showConnected, setShowConnected] = useState(true);

  const titleRef = useRef<HTMLInputElement>(null);
  const addFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(node?.title ?? '');
    setDescription(node?.description ?? '');
    setEventDate(node?.eventDate ?? '');
    setColor(node?.color ?? '');

    const pv: Record<string, { value: string; isEnabled: boolean; showOnCard: boolean }> = {};
    for (const pval of node?.paramValues ?? []) {
      pv[pval.paramDefId] = { value: pval.value ?? '', isEnabled: pval.isEnabled, showOnCard: pval.showOnCard };
    }
    setParamValues(pv);
    setErrors([]);
    setVisibleFields(initVisibleFields(node, activeParamDefs.map(d => d.id)));
    setTags(node?.tags ?? []);
    setTagInput('');
    setLocalMedia(node?.media ?? []);
    setExpandedMediaId(null);
    setEditingMediaId(null);
    setEditForm(null);
    // A media/file item with no media yet auto-opens one pending slot of its
    // type, so creating an image/video/audio/file item lands straight on the picker.
    const mk = node?.kind;
    const wantsMediaSlot = (mk === 'image' || mk === 'video' || mk === 'audio' || mk === 'file') && (node?.media?.length ?? 0) === 0;
    setPendingMedia(wantsMediaSlot
      ? [{ tempId: crypto.randomUUID(), mediaType: mk, srcType: 'file', src: '', label: '' }]
      : []);
  }, [node?.id]);

  useEffect(() => {
    // Only auto-focus the title when creating a new node (type immediately).
    // Selecting an existing node opens the panel without stealing focus.
    if (isCreate) setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!addFieldOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (addFieldRef.current && !addFieldRef.current.contains(e.target as Node)) {
        setAddFieldOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [addFieldOpen]);

  function show(id: FieldId) { return visibleFields.has(id); }

  function addField(fieldId: FieldId) {
    setVisibleFields(prev => new Set([...prev, fieldId]));
    setAddFieldOpen(false);
  }

  function removeField(fieldId: FieldId) {
    setVisibleFields(prev => { const s = new Set(prev); s.delete(fieldId); return s; });
    if (fieldId.startsWith('param:')) {
      const defId = fieldId.slice(6);
      setParamValues(prev => { const n = { ...prev }; delete n[defId]; return n; });
    }
  }

  function validate() {
    // Titles are optional — an untitled node falls back to a derived label
    // (see lib/nodeDisplay.ts), so there's nothing to require here.
    return [] as string[];
  }

  function buildParamValueInputs(): NodeParamValueInput[] {
    return activeParamDefs.map(def => {
      const pv = paramValues[def.id];
      return {
        paramDefId: def.id,
        value: pv?.value || null,
        isEnabled: pv?.isEnabled ?? true,
        showOnCard: pv?.showOnCard ?? def.showOnCardDefault,
      };
    });
  }

  async function handleSave() {
    const e = validate();
    if (e.length) { setErrors(e); return; }
    setErrors([]);
    setSaving(true);

    // Auto-confirm any pending media items that have a src before saving the node
    if (node && onAddMedia) {
      for (const pending of pendingMedia) {
        if (!pending.src.trim()) continue;
        try {
          const media = await onAddMedia({
            nodeId: node.id,
            label: pending.label.trim(),
            src: pending.src.trim(),
            srcType: pending.srcType,
            mediaType: pending.mediaType,
            showOnCard: true,
          });
          setLocalMedia(prev => [...prev, media]);
          setVisibleFields(prev => new Set([...prev, `media:${media.id}` as FieldId]));
        } catch {
          // continue saving even if one media item fails
        }
      }
    }
    setPendingMedia([]);

    const pos = defaultPosition ?? { x: 100, y: 100 };
    const pvInputs = buildParamValueInputs();

    try {
      // Commit an in-progress media edit (the media field has no separate Save
      // button) as part of the node save. Inside try/finally so any failure is
      // surfaced and the Save button always recovers from its loading state.
      if (editingMediaId) {
        try {
          await handleSaveEdit(editingMediaId);
        } catch (mErr) {
          throw new Error(`media: ${mErr instanceof Error ? mErr.message : String(mErr)}`);
        }
      }

      if (node) {
        await onSave({
          id: node.id,
          title: title.trim(),
          // A note's body is owned by the inline card editor — never overwrite it
          // from the panel (which no longer shows a Description field for notes).
          description: node.kind === 'note'
            ? (node.description ?? null)
            : show('description') ? (description || null) : null,
          eventDate:       show('eventDate')        ? (eventDate || null)   : null,
          x: node.x, y: node.y,
          color:           show('color')            ? (color || null)       : null,
          // Confidence / impact are legacy macro fields no longer edited in the
          // panel — preserve whatever the node already has rather than wiping it.
          confidence:      node.confidence ?? null,
          impactMagnitude: node.impactMagnitude ?? null,
          paramValues: pvInputs,
          tags,
        } satisfies UpdateNodeInput);
      } else {
        await onSave({
          title: title.trim(),
          description:     show('description')     ? (description || null) : null,
          eventDate:       show('eventDate')        ? (eventDate || null)   : null,
          x: pos.x, y: pos.y,
          color: null,
          confidence: null,
          impactMagnitude: null,
          paramValues: pvInputs,
          tags,
        } satisfies CreateNodeInput);
      }
    } catch (err) {
      setErrors([`Save failed: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setSaving(false);
    }
  }

  function handleAddLink() {
    if (!newLinkUrl.trim() || !node) return;
    onAddLink?.({ nodeId: node.id, url: newLinkUrl.trim(), label: newLinkLabel.trim() || null });
    setNewLinkUrl('');
    setNewLinkLabel('');
  }

  const MEDIA_EXTENSIONS: Record<string, string[]> = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus'],
  };

  function handleAddMediaType(mediaType: 'image' | 'video' | 'audio' | 'file') {
    const tempId = crypto.randomUUID();
    setPendingMedia(prev => [...prev, { tempId, mediaType, srcType: 'file', src: '', label: '' }]);
    setAddFieldOpen(false);
  }

  // A file node accepts any file (no extension filter); media kinds filter to their type.
  function mediaDialogFilters(mediaType: string) {
    const ext = MEDIA_EXTENSIONS[mediaType];
    return ext ? [{ name: mediaType.charAt(0).toUpperCase() + mediaType.slice(1), extensions: ext }] : undefined;
  }

  async function handleBrowsePending(tempId: string) {
    const pending = pendingMedia.find(p => p.tempId === tempId);
    if (!pending) return;
    const result = await dialogOpen({ multiple: false, directory: false, filters: mediaDialogFilters(pending.mediaType) });
    if (typeof result === 'string') {
      const fname = baseNameOf(result);
      setPendingMedia(prev => prev.map(p => p.tempId === tempId
        ? { ...p, src: result, label: p.label || (p.mediaType === 'file' ? fname : p.label) } : p));
      // A file node's title defaults to the chosen filename (still editable).
      if (pending.mediaType === 'file' && node?.kind === 'file' && !title.trim()) setTitle(fname);
    }
  }

  function updatePending(tempId: string, patch: Partial<{ srcType: 'file' | 'url'; src: string; label: string }>) {
    setPendingMedia(prev => prev.map(p => p.tempId === tempId ? { ...p, ...patch } : p));
  }

  async function handleConfirmPendingMedia(tempId: string) {
    const pending = pendingMedia.find(p => p.tempId === tempId);
    if (!pending || !pending.src.trim() || !node || !onAddMedia) return;
    const media = await onAddMedia({
      nodeId: node.id,
      label: pending.label.trim(),
      src: pending.src.trim(),
      srcType: pending.srcType,
      mediaType: pending.mediaType,
      showOnCard: true,
    });
    setLocalMedia(prev => [...prev, media]);
    setVisibleFields(prev => new Set([...prev, `media:${media.id}` as FieldId]));
    setPendingMedia(prev => prev.filter(p => p.tempId !== tempId));
  }

  function handleCancelPendingMedia(tempId: string) {
    setPendingMedia(prev => prev.filter(p => p.tempId !== tempId));
  }

  function handleToggleShowOnCard(id: string) {
    if (!node) return;
    setLocalMedia(prev => prev.map(m => {
      if (m.id !== id) return m;
      const next = { ...m, showOnCard: !m.showOnCard };
      onUpdateMediaShowOnCard?.(id, node.id, next.showOnCard);
      return next;
    }));
  }

  function handleMoveMedia(id: string, direction: 'up' | 'down') {
    if (!node) return;
    setLocalMedia(prev => {
      const arr = [...prev];
      const idx = arr.findIndex(m => m.id === id);
      if (idx < 0) return prev;
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= arr.length) return prev;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
    onReorderMedia?.(node.id, id, direction);
  }

  function handleRemoveMediaField(id: string) {
    if (!node) return;
    onRemoveMedia?.(id, node.id);
    setLocalMedia(prev => prev.filter(m => m.id !== id));
    setVisibleFields(prev => { const s = new Set(prev); s.delete(`media:${id}` as FieldId); return s; });
    if (expandedMediaId === id) setExpandedMediaId(null);
    if (editingMediaId === id) { setEditingMediaId(null); setEditForm(null); }
  }

  function handleStartEdit(item: NodeMedia) {
    setEditingMediaId(item.id);
    setEditForm({ src: item.src, srcType: item.srcType as 'file' | 'url', label: item.label ?? '' });
    setExpandedMediaId(null);
  }

  function handleCancelEdit() {
    setEditingMediaId(null);
    setEditForm(null);
  }

  async function handleBrowseEdit() {
    if (!editingMediaId || !editForm) return;
    const item = localMedia.find(m => m.id === editingMediaId);
    if (!item) return;
    const result = await dialogOpen({ multiple: false, directory: false, filters: mediaDialogFilters(item.mediaType) });
    if (typeof result === 'string') setEditForm(prev => prev ? { ...prev, src: result } : null);
  }

  async function handleSaveEdit(id: string) {
    if (!editForm || !node || !onUpdateMedia) return;
    if (!editForm.src.trim()) return;
    const updated = await onUpdateMedia(id, node.id, editForm.label.trim() || null, editForm.src.trim(), editForm.srcType);
    setLocalMedia(prev => prev.map(m => m.id === id ? updated : m));
    setEditingMediaId(null);
    setEditForm(null);
  }

  function mediaSrc(item: NodeMedia): string {
    const base = item.srcType === 'file' ? convertFileSrc(item.src) : item.src;
    const cb = mediaCacheBustParam(item.id);
    if (!cb) return base;
    return base + (base.includes('?') ? '&' : '?') + cb;
  }

  function mediaFilename(item: NodeMedia): string {
    if (item.label) return item.label;
    return item.src.split(/[/\\]/).pop() ?? item.src;
  }

  // What can still be added via the dropdown
  const availableToAdd: { id: FieldId; label: string }[] = [
    ...FIXED_FIELDS.filter(f => {
      if (f.editOnly && isCreate) return false;
      // Notes edit their body inline on the card — no Description field in the panel.
      if (f.id === 'description' && node?.kind === 'note') return false;
      return !show(f.id);
    }),
    ...activeParamDefs
      .filter(def => !show(`param:${def.id}`))
      .map(def => ({ id: `param:${def.id}` as FieldId, label: def.displayName })),
  ];

  return (
    <aside className={`detail-panel${readOnly ? ' detail-panel--readonly' : ''}`}>
      <div className="detail-panel__header">
        <h2 title={node ? nodeDisplayLabel(node) : undefined}>{isCreate ? 'Add Node' : node ? nodeDisplayLabel(node) : 'Edit Node'}</h2>
        <button className="icon-btn" onClick={onClose} title="Close"><X size={16} /></button>
      </div>

      <div className="detail-panel__body">
        {readOnly && <div className="panel-readonly-note">View only — editing is disabled. You can still open links, jump to connected nodes, and view media.</div>}
        <fieldset className="panel-edit-fieldset">
        {errors.map(e => (
          <div key={e} className="form-error">{e}</div>
        ))}

        <div className="form-group">
          <label>Title</label>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
            placeholder="Node title (optional)"
            maxLength={200}
          />
        </div>

        {/* Dynamic param fields */}
        {activeParamDefs.map(def => {
          const fieldId: FieldId = `param:${def.id}`;
          if (!show(fieldId)) return null;
          const pv = paramValues[def.id] ?? { value: def.defaultValue ?? '', isEnabled: true, showOnCard: def.showOnCardDefault };
          const updatePv = (patch: Partial<{ value: string; isEnabled: boolean; showOnCard: boolean }>) =>
            setParamValues(prev => ({ ...prev, [def.id]: { ...pv, ...patch } }));

          const selectedOpt = (def.paramType === 'select_color' || def.paramType === 'select')
            ? def.options.find(o => o.valueSlug === pv.value)
            : null;

          return (
            <div className="form-group" key={def.id}>
              <div className="form-group__header">
                <label>{def.displayName}</label>
                <label
                  className={`show-on-card-toggle${pv.showOnCard ? ' show-on-card-toggle--active' : ''}`}
                  title="Show this field on the node card"
                >
                  <input
                    type="checkbox"
                    checked={pv.showOnCard ?? false}
                    onChange={e => updatePv({ showOnCard: e.target.checked })}
                  />
                  on card
                </label>
                <button className="icon-btn icon-btn--muted" onClick={() => removeField(fieldId)} title="Remove field">
                  <X size={11} />
                </button>
              </div>
              {(def.paramType === 'select_color' || def.paramType === 'select') ? (
                <div className="select-color-wrap">
                  {selectedOpt?.color && (
                    <span className="select-color-dot" style={{ background: selectedOpt.color }} />
                  )}
                  <select value={pv.value} onChange={e => updatePv({ value: e.target.value })}>
                    <option value="">— None —</option>
                    {def.options.map(opt => (
                      <option key={opt.id} value={opt.valueSlug}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : def.paramType === 'boolean' ? (
                <label className="checkbox-label">
                  <input type="checkbox" checked={pv.value === 'true'}
                    onChange={e => updatePv({ value: e.target.checked ? 'true' : 'false' })}
                  />
                  Enabled
                </label>
              ) : def.paramType === 'number' ? (
                <input type="number" value={pv.value}
                  onChange={e => updatePv({ value: e.target.value })}
                  placeholder={def.defaultValue ?? ''}
                />
              ) : (
                <input type="text" value={pv.value}
                  onChange={e => updatePv({ value: e.target.value })}
                  placeholder={def.defaultValue ?? ''}
                />
              )}
            </div>
          );
        })}

        {show('eventDate') && (
          <div className="form-group">
            <div className="form-group__header">
              <label>Event Date</label>
              <button className="icon-btn icon-btn--muted" onClick={() => removeField('eventDate')} title="Remove field"><X size={11} /></button>
            </div>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
          </div>
        )}

        {show('description') && node?.kind !== 'note' && (
          <div className="form-group">
            <div className="form-group__header">
              <label>Description</label>
              <button className="icon-btn icon-btn--muted" onClick={() => removeField('description')} title="Remove field"><X size={11} /></button>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description or notes…"
              rows={4}
            />
          </div>
        )}

        {!isCreate && show('color') && (
          <div className="form-group">
            <div className="form-group__header">
              <label>Accent Color</label>
              <button className="icon-btn icon-btn--muted" onClick={() => removeField('color')} title="Remove field"><X size={11} /></button>
            </div>
            <div className="color-picker">
              <button
                className={`color-swatch color-swatch--clear ${color === '' ? 'color-swatch--active' : ''}`}
                onClick={() => setColor('')}
                title="Use field color"
              />
              {SWATCH_COLORS.map(c => (
                <button key={c}
                  className={`color-swatch ${color === c ? 'color-swatch--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(prev => prev === c ? '' : c)}
                  title={c}
                />
              ))}
            </div>
            <span className="form-hint">{color ? 'Custom color — overrides field color' : 'Using field color'}</span>
          </div>
        )}

        {!isCreate && show('links') && (
          <div className="form-group">
            <div className="form-group__header">
              <label>Links</label>
              <button className="icon-btn icon-btn--muted" onClick={() => removeField('links')} title="Remove field"><X size={11} /></button>
            </div>
            {node!.links.length === 0 && <span className="form-hint">No links yet</span>}
            {node!.links.map(link => {
              const href = /^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`;
              return (
                <div key={link.id} className="link-row">
                  <button className="link-url nav-allowed" onClick={() => openUrl(href)} title={link.url}>
                    <ExternalLink size={12} />
                    {link.label || link.url}
                  </button>
                  <button className="icon-btn icon-btn--danger"
                    onClick={() => onRemoveLink?.(link.id, node!.id)} title="Remove link">
                    <X size={12} />
                  </button>
                </div>
              );
            })}
            <div className="link-add">
              <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)}
                placeholder="https://…"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
              />
              <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)}
                placeholder="Label (optional)"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
              />
              <button className="btn btn--ghost" onClick={handleAddLink} disabled={!newLinkUrl.trim()}>
                <Plus size={13} /> Add Link
              </button>
            </div>
          </div>
        )}

        {!isCreate && localMedia.filter(item => show(`media:${item.id}`)).map((item, mi, arr) => (
          <div className="form-group" key={item.id}>
            <div className="form-group__header">
              <span className="media-item__icon">
                {item.mediaType === 'image' ? <ImageIcon size={12} /> :
                 item.mediaType === 'video' ? <Film size={12} /> :
                 item.mediaType === 'audio' ? <Music2 size={12} /> :
                 <FileIcon size={12} />}
              </span>
              <label className="media-item__label" title={item.src}>
                {editingMediaId === item.id && editForm ? (editForm.label || mediaFilename(item)) : mediaFilename(item)}
              </label>
              <label
                className={`show-on-card-toggle${item.showOnCard ? ' show-on-card-toggle--active' : ''}`}
                title="Show on node card"
              >
                <input
                  type="checkbox"
                  checked={item.showOnCard}
                  onChange={() => handleToggleShowOnCard(item.id)}
                />
                on card
              </label>
              {editingMediaId !== item.id && (
                <button
                  className="icon-btn"
                  onClick={() => setExpandedMediaId(prev => prev === item.id ? null : item.id)}
                  title={expandedMediaId === item.id ? 'Collapse' : 'Preview'}
                >
                  {expandedMediaId === item.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </button>
              )}
              {onReorderMedia && arr.length > 1 && (
                <>
                  <button
                    className="icon-btn"
                    onClick={() => handleMoveMedia(item.id, 'up')}
                    disabled={mi === 0}
                    title="Move up"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => handleMoveMedia(item.id, 'down')}
                    disabled={mi === arr.length - 1}
                    title="Move down"
                  >
                    <ArrowDown size={11} />
                  </button>
                </>
              )}
              <button
                className={`icon-btn${editingMediaId === item.id ? ' icon-btn--active' : ''}`}
                onClick={() => editingMediaId === item.id ? handleCancelEdit() : handleStartEdit(item)}
                title={editingMediaId === item.id ? 'Cancel edit' : 'Edit'}
              >
                <Pencil size={11} />
              </button>
              <button
                className="icon-btn nav-allowed"
                onClick={() => item.srcType === 'file' ? openPath(item.src) : openUrl(item.src)}
                title="Open externally"
              >
                <ExternalLink size={11} />
              </button>
              {/* A media item's media is intrinsic to the element — not removable
                  (an image item must keep its image field, etc.). */}
              {node?.kind !== item.mediaType && (
                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleRemoveMediaField(item.id)}
                  title="Delete"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {editingMediaId === item.id && editForm && (
              <div className="media-add">
                <select
                  value={editForm.srcType}
                  onChange={e => setEditForm(prev => prev ? { ...prev, srcType: e.target.value as 'file' | 'url', src: '' } : null)}
                  className="media-add__srctype"
                >
                  <option value="file">File</option>
                  <option value="url">URL</option>
                </select>
                {editForm.srcType === 'file' ? (
                  <div className="media-add__file-row">
                    <input value={editForm.src} readOnly placeholder="No file selected" className="media-add__path" />
                    <button className="btn btn--ghost" onClick={handleBrowseEdit}>
                      <FolderOpen size={13} /> Browse
                    </button>
                  </div>
                ) : (
                  <input
                    value={editForm.src}
                    onChange={e => setEditForm(prev => prev ? { ...prev, src: e.target.value } : null)}
                    placeholder="https://…"
                  />
                )}
                <input
                  value={editForm.label}
                  onChange={e => setEditForm(prev => prev ? { ...prev, label: e.target.value } : null)}
                  placeholder="Label (optional)"
                />
                <div className="media-edit-actions">
                  <span className="form-hint">Applied when you click “Save Changes”.</span>
                  <button className="btn btn--ghost" onClick={handleCancelEdit}>Cancel edit</button>
                </div>
              </div>
            )}

            {editingMediaId !== item.id && expandedMediaId === item.id && (
              <div className="media-item__preview">
                {item.mediaType === 'image' && (
                  <img src={mediaSrc(item)} alt={item.label || item.src} className="media-viewer--image"
                    onError={e => { (e.currentTarget as HTMLImageElement).alt = '⚠ Failed to load image'; }} />
                )}
                {item.mediaType === 'video' && (
                  <video controls className="media-viewer--video">
                    <source src={mediaSrc(item)} />
                  </video>
                )}
                {item.mediaType === 'audio' && (
                  <audio controls className="media-viewer--audio">
                    <source src={mediaSrc(item)} />
                  </audio>
                )}
              </div>
            )}
          </div>
        ))}

        {!isCreate && pendingMedia.map(pending => (
          <div className="form-group" key={pending.tempId}>
            <div className="form-group__header">
              <span className="media-item__icon">
                {pending.mediaType === 'image' ? <ImageIcon size={12} /> :
                 pending.mediaType === 'video' ? <Film size={12} /> :
                 pending.mediaType === 'audio' ? <Music2 size={12} /> :
                 <FileIcon size={12} />}
              </span>
              <label>New {pending.mediaType}</label>
              {/* The intrinsic media slot of a media item can't be cancelled away
                  (its field is non-removable); other pending slots still can. */}
              {node?.kind !== pending.mediaType && (
                <button className="icon-btn icon-btn--muted" onClick={() => handleCancelPendingMedia(pending.tempId)} title="Cancel">
                  <X size={11} />
                </button>
              )}
            </div>
            <div className="media-add">
              <select
                value={pending.srcType}
                onChange={e => updatePending(pending.tempId, { srcType: e.target.value as 'file' | 'url', src: '' })}
                className="media-add__srctype"
              >
                <option value="file">File</option>
                <option value="url">URL</option>
              </select>
              {pending.srcType === 'file' ? (
                <div className="media-add__file-row">
                  <input value={pending.src} readOnly placeholder="No file selected" className="media-add__path" />
                  <button className="btn btn--ghost" onClick={() => handleBrowsePending(pending.tempId)}>
                    <FolderOpen size={13} /> Browse
                  </button>
                </div>
              ) : (
                <input
                  value={pending.src}
                  onChange={e => updatePending(pending.tempId, { src: e.target.value })}
                  placeholder="https://…"
                />
              )}
              <input
                value={pending.label}
                onChange={e => updatePending(pending.tempId, { label: e.target.value })}
                placeholder="Label (optional)"
              />
              <button
                className="btn btn--ghost"
                onClick={() => handleConfirmPendingMedia(pending.tempId)}
                disabled={!pending.src.trim()}
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        ))}

        {!isCreate && node && (
          <div className="node-meta-added">Added {node.dateAdded.split('T')[0]}</div>
        )}

        {adjacentNodes.length > 0 && (
          <div className="connected-nodes">
            <button
              className="connected-nodes__toggle"
              onClick={() => setShowConnected(s => !s)}
            >
              {showConnected ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              <span>Connected to</span>
              <span className="connected-nodes__count">{adjacentNodes.length}</span>
            </button>
            {showConnected && (
              <div className="connected-nodes__list">
                {adjacentNodes.map(n => (
                  <button
                    key={n.id}
                    className="connected-node-item nav-allowed"
                    onClick={() => onNavigateToNode?.(n)}
                    title={n.title}
                  >
                    {n.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tags ── */}
        <div className="form-group">
          <label>Tags</label>
          <div className="tag-chips">
            {tags.map(tag => (
              <span key={tag} className="tag-chip">
                {tag}
                <button
                  className="tag-chip__remove"
                  onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                  title={`Remove tag "${tag}"`}
                >
                  <X size={9} />
                </button>
              </span>
            ))}
            <input
              className="tag-chip-input"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                  e.preventDefault();
                  const next = tagInput.trim().replace(/,+$/, '');
                  if (next && !tags.includes(next)) setTags(prev => [...prev, next]);
                  setTagInput('');
                } else if (e.key === 'Backspace' && !tagInput && tags.length) {
                  setTags(prev => prev.slice(0, -1));
                }
              }}
              placeholder={tags.length ? '' : 'Add tag…'}
            />
          </div>
        </div>

        {(availableToAdd.length > 0 || !isCreate) && (
          <div className="add-field-wrap" ref={addFieldRef}>
            <button className="btn btn--ghost add-field-btn" onClick={() => setAddFieldOpen(o => !o)}>
              <Plus size={12} />
              Add field
              <ChevronDown size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </button>
            {addFieldOpen && (
              <div className="add-field-dropdown">
                {availableToAdd.map(f => (
                  <button key={f.id} className="add-field-item" onClick={() => addField(f.id)}>
                    {f.label}
                  </button>
                ))}
                {!isCreate && (
                  <>
                    {availableToAdd.length > 0 && <div className="add-field-sep" />}
                    <button className="add-field-item" onClick={() => handleAddMediaType('image')}>
                      <ImageIcon size={11} /> Image
                    </button>
                    <button className="add-field-item" onClick={() => handleAddMediaType('video')}>
                      <Film size={11} /> Video
                    </button>
                    <button className="add-field-item" onClick={() => handleAddMediaType('audio')}>
                      <Music2 size={11} /> Audio
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        </fieldset>
      </div>

      <div className="detail-panel__footer">
        {node && onDelete && (
          <button className="btn btn--danger" onClick={() => onDelete(node.id)} disabled={saving || readOnly}>
            <Trash2 size={14} /> Delete
          </button>
        )}
        {node && (
          <button
            className="btn btn--ghost"
            title="Copy node ID to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(node.id);
              setIdCopied(true);
              setTimeout(() => setIdCopied(false), 1500);
            }}
          >
            {idCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
        {node && onTogglePin && (
          <button
            className={`btn btn--ghost${isPinned ? ' btn--on' : ''}`}
            onClick={onTogglePin}
            disabled={saving || readOnly}
            title={isPinned ? 'Unpin position' : 'Pin position — prevents accidental dragging'}
          >
            {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
        )}
        <button className="btn btn--primary" onClick={handleSave} disabled={saving || readOnly}>
          {saving
            ? <><Loader size={14} className="spin" /> {isCreate ? 'Adding…' : 'Saving…'}</>
            : isCreate ? <><Plus size={14} /> Add Node</> : 'Save Changes'
          }
        </button>
      </div>
    </aside>
  );
}
