import { useEffect, useRef, useState } from 'react';
import { X, Plus, Trash2, Check, Pencil, Copy, Droplets, ArrowRight, Minus, Palette, Weight, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import Modal from './Modal';
import DisplayNamePrompt from './DisplayNamePrompt';
import { IS_DEMO } from '../lib/env';
import type { EdgeParamDef, EdgeParamOption, EdgeRoutingMode, NodeParamDef, NodeParamOption, Preset } from '../types';

const BUILTIN_DESCRIPTIONS: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'For macro traders and analysts tracking global events, regimes, and causal chains across asset classes.',
  '00000000-0000-0000-0000-000000000002': 'For systems thinkers and engineers modeling feedback loops, stocks, flows, and dynamic behavior.',
  '00000000-0000-0000-0000-000000000003': 'For researchers and knowledge workers organizing concepts, claims, evidence, and their relationships.',
  '00000000-0000-0000-0000-000000000004': 'For teams and individuals tracking tasks, features, bugs, and dependencies across a project.',
};

const PALETTE = [
  '#d68b2a', '#c97a1a', '#e8a830', '#e8c86e',
  '#00b0c8', '#5588bb', '#3388cc', '#2d6a8a',
  '#3d9e5f', '#2d8050', '#50aa70', '#6dcc88',
  '#c83030', '#aa2020', '#7766aa', '#888888',
];

const PARAM_TYPES = ['text', 'number', 'boolean', 'select', 'select_color'];

const PARAM_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  number: 'Number',
  boolean: 'Toggle',
  select: 'Dropdown',
  select_color: 'Color Select',
};

type Tab = 'presets' | 'fields' | 'edge_fields' | 'display' | 'api' | 'shortcuts';

interface GraphSettingsModalProps {
  nodeCount: number;
  onClose: () => void;
  initialTab?: Tab;
}

export default function GraphSettingsModal({ nodeCount, onClose, initialTab }: GraphSettingsModalProps) {
  const { settings, refreshSettings, edgeRoutingMode, setEdgeRoutingMode, snapToGrid, setSnapToGrid, expandNodesByDefault, setExpandNodesByDefault } = useSettings();
  const [tab, setTab] = useState<Tab>(initialTab ?? 'presets');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    bodyRef.current?.scrollTo({ top: 0 });
  }

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refreshSettings();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!settings) return null;

  return (
    <Modal title="Graph Settings" onClose={onClose}>
      <div className="modal-tabs">
        {(['presets', 'fields', 'edge_fields', 'display', 'api', 'shortcuts'] as Tab[]).map(t => (
          <button
            key={t}
            className={`modal-tab ${tab === t ? 'modal-tab--active' : ''}`}
            onClick={() => switchTab(t)}
          >
            {t === 'presets' ? 'Presets' : t === 'fields' ? 'Node Fields' : t === 'edge_fields' ? 'Edge Fields' : t === 'display' ? 'Display' : t === 'api' ? 'API' : 'Shortcuts'}
          </button>
        ))}
      </div>

      {error && <div className="modal-error">{error}</div>}

      <div className="modal-body" ref={bodyRef}>
        {tab === 'presets' && <PresetsTab settings={settings} busy={busy} run={run} nodeCount={nodeCount} />}
        {tab === 'fields' && <FieldsTab settings={settings} busy={busy} run={run} nodeCount={nodeCount} />}
        {tab === 'edge_fields' && <EdgeFieldsTab settings={settings} busy={busy} run={run} nodeCount={nodeCount} />}
        {tab === 'display' && <DisplayTab edgeRoutingMode={edgeRoutingMode} setEdgeRoutingMode={setEdgeRoutingMode} snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid} expandNodesByDefault={expandNodesByDefault} setExpandNodesByDefault={setExpandNodesByDefault} />}
        {tab === 'api' && <ApiTab />}
        {tab === 'shortcuts' && <ShortcutsTab />}
      </div>
    </Modal>
  );
}

// ── Presets Tab ───────────────────────────────────────────────────────────────

function PresetsTab({
  settings,
  busy,
  run,
  nodeCount,
}: {
  settings: NonNullable<ReturnType<typeof useSettings>['settings']>;
  busy: boolean;
  run: <T>(fn: () => Promise<T>) => Promise<void>;
  nodeCount: number;
}) {
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<Preset | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [duplicating, setDuplicating] = useState<Preset | null>(null);
  const [dupName, setDupName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleCreatePreset() {
    const name = newName.trim();
    if (!name) return;
    await run(async () => { await api.createPreset({ name }); });
    setNewName('');
  }

  function startRename(p: Preset) {
    setRenaming(p); setRenameVal(p.name);
    setDuplicating(null); setPendingDeleteId(null);
  }

  function startDuplicate(p: Preset) {
    setDuplicating(p); setDupName(`${p.name} (copy)`);
    setRenaming(null); setPendingDeleteId(null);
  }

  async function confirmRename(p: Preset) {
    const name = renameVal.trim();
    if (!name) return;
    await run(() => api.renamePreset({ id: p.id, name }));
    setRenaming(null);
  }

  return (
    <div className="settings-section">
      <p className="settings-hint">
        Presets group the fields available on nodes and edges. Switch presets to change which
        fields appear in panels and filters.
      </p>

      {nodeCount > 0 && (
        <p className="settings-preset-locked-notice">
          Presets can only be switched on an empty graph. Start a new graph to change the preset.
        </p>
      )}

      <div className="settings-list">
        {settings.presets.map(p => {
          const isActive = p.id === settings.activePresetId;
          const desc = BUILTIN_DESCRIPTIONS[p.id];
          return (
            <div key={p.id} className={`settings-row ${isActive ? 'settings-row--active' : ''} ${p.isBuiltin ? 'settings-row--builtin' : ''}`}>
              {renaming?.id === p.id ? (
                <div className="settings-row__inline-edit">
                  <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && renameVal.trim()) confirmRename(p);
                      if (e.key === 'Escape') setRenaming(null);
                    }}
                  />
                  <button className="icon-btn icon-btn--confirm" disabled={busy || !renameVal.trim()}
                    onClick={() => confirmRename(p)}>
                    <Check size={13} />
                  </button>
                  <button className="icon-btn" onClick={() => setRenaming(null)}><X size={13} /></button>
                </div>
              ) : duplicating?.id === p.id ? (
                <div className="settings-row__inline-edit">
                  <input autoFocus value={dupName} placeholder="Name for duplicate…"
                    onChange={e => setDupName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && dupName.trim()) run(() => api.duplicatePreset({ id: p.id, newName: dupName.trim() })).then(() => setDuplicating(null));
                      if (e.key === 'Escape') setDuplicating(null);
                    }}
                  />
                  <button className="icon-btn icon-btn--confirm" disabled={busy || !dupName.trim()}
                    onClick={() => run(() => api.duplicatePreset({ id: p.id, newName: dupName.trim() })).then(() => setDuplicating(null))}>
                    <Check size={13} />
                  </button>
                  <button className="icon-btn" onClick={() => setDuplicating(null)}><X size={13} /></button>
                </div>
              ) : (
                <>
                  <div className="settings-row__label-group">
                    <span className="settings-row__label">
                      {p.name}
                      {isActive && <span className="settings-badge settings-badge--active">Active</span>}
                    </span>
                    {p.isBuiltin && desc && (
                      <span className="settings-row__desc">{desc}</span>
                    )}
                  </div>
                  <div className="settings-row__actions">
                    {!isActive && (
                      <button
                        className="btn btn--xs btn--ghost"
                        disabled={busy || nodeCount > 0}
                        title={nodeCount > 0 ? 'Presets can only be switched on an empty graph' : undefined}
                        onClick={() => run(() => api.setActivePreset(p.id))}
                      >
                        Activate
                      </button>
                    )}
                    <button className="icon-btn" title="Rename" disabled={busy} onClick={() => startRename(p)}>
                      <Pencil size={13} />
                    </button>
                    <button className="icon-btn" title="Duplicate" disabled={busy} onClick={() => startDuplicate(p)}>
                      <Copy size={13} />
                    </button>
                    {!isActive && !p.isBuiltin && (
                      pendingDeleteId === p.id ? (
                        <span className="settings-row__delete-confirm">
                          <button className="btn btn--xs btn--danger" onClick={() => { run(() => api.deletePreset(p.id)); setPendingDeleteId(null); }}>Delete</button>
                          <button className="icon-btn" onClick={() => setPendingDeleteId(null)}><X size={12} /></button>
                        </span>
                      ) : (
                        <button className="icon-btn icon-btn--danger" title="Delete" disabled={busy}
                          onClick={() => setPendingDeleteId(p.id)}>
                          <Trash2 size={13} />
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="settings-template-row">
        <input
          className="settings-template-name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New preset name…"
          onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) handleCreatePreset(); }}
        />
        <button className="btn btn--ghost btn--sm" disabled={busy || !newName.trim()}
          onClick={handleCreatePreset}>
          <Plus size={13} /> Add Preset
        </button>
      </div>
    </div>
  );
}

// ── Fields Tab ────────────────────────────────────────────────────────────────

function FieldsTab({
  settings,
  busy,
  run,
  nodeCount,
}: {
  settings: NonNullable<ReturnType<typeof useSettings>['settings']>;
  busy: boolean;
  run: <T>(fn: () => Promise<T>) => Promise<void>;
  nodeCount: number;
}) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('text');
  const [newDefault, setNewDefault] = useState('');
  const [newDrivesColor, setNewDrivesColor] = useState(false);
  const [newShowOnCardDefault, setNewShowOnCardDefault] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDef, setEditingDef] = useState<NodeParamDef | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editDefault, setEditDefault] = useState('');
  const [editShowOnCardDefault, setEditShowOnCardDefault] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const activePreset = settings.presets.find(p => p.id === settings.activePresetId);
  const isBuiltin = activePreset?.isBuiltin ?? false;

  function startEdit(def: NodeParamDef) {
    setEditingDef(def);
    setEditName(def.displayName);
    setEditType(def.paramType);
    setEditDefault(def.defaultValue ?? '');
    setEditShowOnCardDefault(def.showOnCardDefault);
    setPendingDeleteId(null);
  }

  async function addParam() {
    if (!newName.trim()) return;
    const presetId = settings.activePresetId;
    await run(() => api.createNodeParamDef({
      presetId,
      displayName: newName.trim(),
      paramType: newType,
      defaultValue: newDefault || null,
      drivesColor: newDrivesColor,
      showOnCardDefault: newShowOnCardDefault,
    }));
    setNewName('');
    setNewType('text');
    setNewDefault('');
    setNewDrivesColor(false);
    setNewShowOnCardDefault(false);
  }

  async function saveEdit(def: NodeParamDef) {
    await run(() => api.updateNodeParamDef({
      id: def.id,
      displayName: editName.trim(),
      paramType: editType,
      defaultValue: editDefault || null,
      showOnCardDefault: editShowOnCardDefault,
    }));
    setEditingDef(null);
  }

  return (
    <div className="settings-section">
      <div className="settings-preset-selector">
        <span className="settings-preset-selector__label">Preset</span>
        <select
          className="settings-preset-selector__select"
          value={settings.activePresetId}
          onChange={e => run(() => api.setActivePreset(e.target.value))}
          disabled={busy}
        >
          {settings.presets.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {nodeCount > 0 && (
        <p className="settings-preset-locked-notice">
          Switching presets on a graph with data will not migrate existing param values. Use the Presets tab to manage presets.
        </p>
      )}

      <p className="settings-hint">
        Fields are optional properties available on every node. <strong style={{ color: 'var(--text)' }}>select_color</strong> fields
        have named options with colours. Mark one as <span style={{ color: 'var(--accent)' }}>Node Color</span> to drive the card
        stripe and sidebar filters.
      </p>

      <div className="settings-list">
        {settings.paramDefs.length === 0 && (
          <p className="settings-empty">No fields yet</p>
        )}
        {settings.paramDefs.map(def => {
          const isExpanded = expandedId === def.id;
          const isEditing = editingDef?.id === def.id;
          const isSelectColor = def.paramType === 'select_color' || def.paramType === 'select';

          return (
            <div key={def.id} className="settings-param-block">
              {isEditing ? (
                <div className="settings-param-edit">
                  <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                    placeholder="Display name"
                    onKeyDown={e => { if (e.key === 'Escape') setEditingDef(null); }}
                  />
                  <select value={editType} onChange={e => setEditType(e.target.value)}>
                    {PARAM_TYPES.map(t => <option key={t} value={t}>{PARAM_TYPE_LABELS[t] ?? t}</option>)}
                  </select>
                  {(editType === 'text' || editType === 'number') && (
                    <input value={editDefault} onChange={e => setEditDefault(e.target.value)} placeholder="Default value (optional)" />
                  )}
                  <label className="checkbox-label">
                    <input type="checkbox" checked={editShowOnCardDefault}
                      onChange={e => setEditShowOnCardDefault(e.target.checked)} />
                    Show on card by default
                  </label>
                  <div className="settings-param-edit__actions">
                    <button className="btn btn--ghost btn--sm" disabled={busy || !editName.trim()} onClick={() => saveEdit(def)}>
                      <Check size={13} /> Save
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditingDef(null)}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="settings-row">
                  <div className="settings-row__left">
                    <span className="settings-row__label">{def.displayName}</span>
                    <span className="param-type-badge">{PARAM_TYPE_LABELS[def.paramType] ?? def.paramType}</span>
                    {def.drivesColor && (
                      <span className="param-type-badge param-type-badge--color" title="Drives node color">
                        <Droplets size={9} /> color
                      </span>
                    )}
                    {def.showOnCardDefault && (
                      <span className="param-type-badge param-type-badge--card" title="Shown on card by default">
                        on card
                      </span>
                    )}
                    {def.defaultValue && <span className="settings-row__hint">default: {def.defaultValue}</span>}
                    {isSelectColor && def.options.length > 0 && (
                      <span className="settings-row__hint">{def.options.length} options</span>
                    )}
                  </div>
                  <div className="settings-row__actions">
                    {def.paramType === 'select_color' && (
                      <button
                        className={`icon-btn ${def.drivesColor ? 'icon-btn--accent' : ''}`}
                        title={def.drivesColor ? 'Currently drives node color' : 'Set as node color driver'}
                        disabled={busy || def.drivesColor}
                        onClick={() => run(() => api.setDrivesColor(def.id))}
                      >
                        <Droplets size={13} />
                      </button>
                    )}
                    {isSelectColor && (
                      <button
                        className="btn btn--xs btn--ghost"
                        onClick={() => setExpandedId(prev => prev === def.id ? null : def.id)}
                      >
                        {isExpanded ? 'Hide' : 'Options'}
                      </button>
                    )}
                    <button className="icon-btn" title="Edit" disabled={busy} onClick={() => startEdit(def)}>
                      <Pencil size={13} />
                    </button>
                    {pendingDeleteId === def.id ? (
                      <span className="settings-row__delete-confirm">
                        <button className="btn btn--xs btn--danger" onClick={() => {
                          run(() => api.deleteNodeParamDef(def.id));
                          setPendingDeleteId(null);
                        }}>Delete</button>
                        <button className="icon-btn" onClick={() => setPendingDeleteId(null)}><X size={12} /></button>
                      </span>
                    ) : (
                      <button className="icon-btn icon-btn--danger" title="Delete" disabled={busy}
                        onClick={() => setPendingDeleteId(def.id)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isExpanded && !isEditing && (
                <OptionsEditor def={def} busy={busy} run={run} isBuiltin={isBuiltin} />
              )}
            </div>
          );
        })}
      </div>

      <div className="settings-param-add">
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Field name…"
          onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) addParam(); }}
        />
        <select value={newType} onChange={e => {
          setNewType(e.target.value);
          if (e.target.value !== 'select_color') setNewDrivesColor(false);
        }}>
          {PARAM_TYPES.map(t => <option key={t} value={t}>{PARAM_TYPE_LABELS[t] ?? t}</option>)}
        </select>
        {(newType === 'text' || newType === 'number') && (
          <input value={newDefault} onChange={e => setNewDefault(e.target.value)} placeholder="Default value (optional)" />
        )}
        <div className="settings-drive-flags">
          {newType === 'select_color' && (
            <label className="checkbox-label">
              <input type="checkbox" checked={newDrivesColor}
                onChange={e => setNewDrivesColor(e.target.checked)} />
              Drives node color
            </label>
          )}
          <label className="checkbox-label">
            <input type="checkbox" checked={newShowOnCardDefault}
              onChange={e => setNewShowOnCardDefault(e.target.checked)} />
            Show on card by default
          </label>
        </div>
        <button className="btn btn--ghost btn--sm" disabled={busy || !newName.trim()} onClick={addParam}>
          <Plus size={13} /> Add Field
        </button>
      </div>
    </div>
  );
}

// ── Options editor (inline, for select / select_color param defs) ─────────────

function OptionsEditor({
  def,
  busy,
  run,
  isBuiltin,
}: {
  def: NodeParamDef;
  busy: boolean;
  run: <T>(fn: () => Promise<T>) => Promise<void>;
  isBuiltin: boolean;
}) {
  const isColor = def.paramType === 'select_color';
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editingOpt, setEditingOpt] = useState<NodeParamOption | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');
  const [pendingDeleteOptId, setPendingDeleteOptId] = useState<string | null>(null);

  function startEditOpt(opt: NodeParamOption) {
    setEditingOpt(opt);
    setEditLabel(opt.label);
    setEditColor(opt.color ?? PALETTE[0]);
  }

  async function addOption() {
    if (!newLabel.trim()) return;
    await run(() => api.createParamOption({
      paramDefId: def.id,
      label: newLabel.trim(),
      color: isColor ? newColor : null,
    }));
    setNewLabel('');
    setNewColor(PALETTE[0]);
  }

  async function saveOptEdit(opt: NodeParamOption) {
    await run(() => api.updateParamOption({
      id: opt.id,
      label: editLabel.trim(),
      color: isColor ? editColor : null,
    }));
    setEditingOpt(null);
  }

  return (
    <div className="settings-sub-list">
      {def.options.length === 0 && (
        <p className="settings-empty" style={{ margin: '8px 0 8px 12px' }}>No options yet</p>
      )}
      {def.options.map(opt => (
        <div key={opt.id} className="settings-sub-row">
          {editingOpt?.id === opt.id ? (
            <div className="settings-row__inline-edit settings-row__inline-edit--full">
              <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && editLabel.trim()) saveOptEdit(opt);
                  if (e.key === 'Escape') setEditingOpt(null);
                }}
              />
              {isColor && <ColorPicker value={editColor} onChange={setEditColor} />}
              <button className="icon-btn icon-btn--confirm" disabled={busy || !editLabel.trim()}
                onClick={() => saveOptEdit(opt)}>
                <Check size={13} />
              </button>
              <button className="icon-btn" onClick={() => setEditingOpt(null)}><X size={13} /></button>
            </div>
          ) : (
            <>
              <div className="settings-row__left">
                {isColor && opt.color && (
                  <span className="settings-row__color-dot" style={{ background: opt.color }} />
                )}
                <span className="settings-sub-row__label">{opt.label}</span>
                <span className="settings-row__hint" style={{ fontFamily: 'monospace' }}>{opt.valueSlug}</span>
              </div>
              {!isBuiltin && (
                <div className="settings-row__actions">
                  <button className="icon-btn" disabled={busy} onClick={() => startEditOpt(opt)}>
                    <Pencil size={13} />
                  </button>
                  {pendingDeleteOptId === opt.id ? (
                    <span className="settings-row__delete-confirm">
                      <button className="btn btn--xs btn--danger" onClick={() => { run(() => api.deleteParamOption(opt.id)); setPendingDeleteOptId(null); }}>Delete</button>
                      <button className="icon-btn" onClick={() => setPendingDeleteOptId(null)}><X size={12} /></button>
                    </span>
                  ) : (
                    <button className="icon-btn icon-btn--danger" disabled={busy} onClick={() => setPendingDeleteOptId(opt.id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {!isBuiltin && (
        <div className={`settings-add-row settings-add-row--inline ${isColor ? 'settings-add-row--with-color' : ''}`}>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            placeholder="New option…"
            onKeyDown={e => { if (e.key === 'Enter') addOption(); }}
          />
          {isColor && <ColorPicker value={newColor} onChange={setNewColor} />}
          <button className="btn btn--ghost btn--xs" disabled={busy || !newLabel.trim()} onClick={addOption}>
            <Plus size={12} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

// ── Edge Fields Tab ───────────────────────────────────────────────────────────

function EdgeFieldsTab({
  settings,
  busy,
  run,
  nodeCount,
}: {
  settings: NonNullable<ReturnType<typeof useSettings>['settings']>;
  busy: boolean;
  run: <T>(fn: () => Promise<T>) => Promise<void>;
  nodeCount: number;
}) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('text');
  const [newDefault, setNewDefault] = useState('');
  const [newDrivesArrow, setNewDrivesArrow] = useState(false);
  const [newDrivesStyle, setNewDrivesStyle] = useState(false);
  const [newDrivesColor, setNewDrivesColor] = useState(false);
  const [newDrivesWidth, setNewDrivesWidth] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDef, setEditingDef] = useState<EdgeParamDef | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editDefault, setEditDefault] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const isSelectLike = (type: string) => type === 'select' || type === 'select_color';
  const activePreset = settings.presets.find(p => p.id === settings.activePresetId);
  const isBuiltin = activePreset?.isBuiltin ?? false;

  function resetDriveFlags(type: string) {
    if (type !== 'boolean') setNewDrivesArrow(false);
    if (type !== 'select') setNewDrivesStyle(false);
    if (type !== 'select_color') setNewDrivesColor(false);
    if (type !== 'number') setNewDrivesWidth(false);
  }

  function startEdit(def: EdgeParamDef) {
    setEditingDef(def);
    setEditName(def.displayName);
    setEditType(def.paramType);
    setEditDefault(def.defaultValue ?? '');
    setPendingDeleteId(null);
  }

  async function addParam() {
    if (!newName.trim()) return;
    await run(async () => {
      const presetId = settings.activePresetId;
      await api.createEdgeParamDef({
        presetId,
        displayName: newName.trim(),
        paramType: newType,
        defaultValue: newDefault || null,
        drivesArrow: newDrivesArrow,
        drivesStyle: newDrivesStyle,
        drivesColor: newDrivesColor,
        drivesWidth: newDrivesWidth,
      });
    });
    setNewName('');
    setNewType('text');
    setNewDefault('');
    setNewDrivesArrow(false);
    setNewDrivesStyle(false);
    setNewDrivesColor(false);
    setNewDrivesWidth(false);
  }

  async function saveEdit(def: EdgeParamDef) {
    await run(async () => {
      await api.updateEdgeParamDef({
        id: def.id,
        displayName: editName.trim(),
        paramType: editType,
        defaultValue: editDefault || null,
      });
    });
    setEditingDef(null);
  }

  return (
    <div className="settings-section">
      <div className="settings-preset-selector">
        <span className="settings-preset-selector__label">Preset</span>
        <select
          className="settings-preset-selector__select"
          value={settings.activePresetId}
          onChange={e => run(() => api.setActivePreset(e.target.value))}
          disabled={busy}
        >
          {settings.presets.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {nodeCount > 0 && (
        <p className="settings-preset-locked-notice">
          Switching presets on a graph with data will not migrate existing param values. Use the Presets tab to manage presets.
        </p>
      )}

      <p className="settings-hint">
        Edge fields are custom properties on connections. Use drive flags to control visual rendering:
        <strong style={{ color: 'var(--text)' }}> arrow</strong> (boolean),
        <strong style={{ color: 'var(--text)' }}> style</strong> (select),
        <strong style={{ color: 'var(--text)' }}> color</strong> (select_color),
        <strong style={{ color: 'var(--text)' }}> width</strong> (number).
      </p>

      <div className="settings-list">
        {settings.edgeParamDefs.length === 0 && (
          <p className="settings-empty">No edge fields yet</p>
        )}
        {settings.edgeParamDefs.map(def => {
          const isExpanded = expandedId === def.id;
          const isEditing = editingDef?.id === def.id;
          const hasOptions = isSelectLike(def.paramType);

          return (
            <div key={def.id} className="settings-param-block">
              {isEditing ? (
                <div className="settings-param-edit">
                  <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                    placeholder="Display name"
                    onKeyDown={e => { if (e.key === 'Escape') setEditingDef(null); }}
                  />
                  <select value={editType} onChange={e => setEditType(e.target.value)}>
                    {PARAM_TYPES.map(t => <option key={t} value={t}>{PARAM_TYPE_LABELS[t] ?? t}</option>)}
                  </select>
                  {(editType === 'text' || editType === 'number') && (
                    <input value={editDefault} onChange={e => setEditDefault(e.target.value)} placeholder="Default value (optional)" />
                  )}
                  <div className="settings-param-edit__actions">
                    <button className="btn btn--ghost btn--sm" disabled={busy || !editName.trim()} onClick={() => saveEdit(def)}>
                      <Check size={13} /> Save
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditingDef(null)}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="settings-row">
                  <div className="settings-row__left">
                    <span className="settings-row__label">{def.displayName}</span>
                    <span className="param-type-badge">{PARAM_TYPE_LABELS[def.paramType] ?? def.paramType}</span>
                    {def.drivesArrow && <span className="param-type-badge param-type-badge--drive" title="Drives arrowhead"><ArrowRight size={9} /> arrow</span>}
                    {def.drivesStyle && <span className="param-type-badge param-type-badge--drive" title="Drives line style"><Minus size={9} /> style</span>}
                    {def.drivesColor && <span className="param-type-badge param-type-badge--color" title="Drives edge color"><Palette size={9} /> color</span>}
                    {def.drivesWidth && <span className="param-type-badge param-type-badge--drive" title="Drives line width"><Weight size={9} /> width</span>}
                    {def.defaultValue && <span className="settings-row__hint">default: {def.defaultValue}</span>}
                    {hasOptions && def.options.length > 0 && (
                      <span className="settings-row__hint">{def.options.length} options</span>
                    )}
                  </div>
                  <div className="settings-row__actions">
                    {def.paramType === 'boolean' && !def.drivesArrow && (
                      <button className="icon-btn" title="Set as arrow driver" disabled={busy}
                        onClick={() => run(() => api.setEdgeDrive(def.id, 'arrow'))}>
                        <ArrowRight size={13} />
                      </button>
                    )}
                    {def.paramType === 'select' && !def.drivesStyle && (
                      <button className="icon-btn" title="Set as style driver" disabled={busy}
                        onClick={() => run(() => api.setEdgeDrive(def.id, 'style'))}>
                        <Minus size={13} />
                      </button>
                    )}
                    {def.paramType === 'select_color' && !def.drivesColor && (
                      <button className="icon-btn" title="Set as color driver" disabled={busy}
                        onClick={() => run(() => api.setEdgeDrive(def.id, 'color'))}>
                        <Palette size={13} />
                      </button>
                    )}
                    {def.paramType === 'number' && !def.drivesWidth && (
                      <button className="icon-btn" title="Set as width driver" disabled={busy}
                        onClick={() => run(() => api.setEdgeDrive(def.id, 'width'))}>
                        <Weight size={13} />
                      </button>
                    )}
                    {hasOptions && (
                      <button className="btn btn--xs btn--ghost"
                        onClick={() => setExpandedId(prev => prev === def.id ? null : def.id)}>
                        {isExpanded ? 'Hide' : 'Options'}
                      </button>
                    )}
                    <button className="icon-btn" title="Edit" disabled={busy} onClick={() => startEdit(def)}>
                      <Pencil size={13} />
                    </button>
                    {pendingDeleteId === def.id ? (
                      <span className="settings-row__delete-confirm">
                        <button className="btn btn--xs btn--danger" onClick={() => {
                          run(() => api.deleteEdgeParamDef(def.id));
                          setPendingDeleteId(null);
                        }}>Delete</button>
                        <button className="icon-btn" onClick={() => setPendingDeleteId(null)}><X size={12} /></button>
                      </span>
                    ) : (
                      <button className="icon-btn icon-btn--danger" title="Delete" disabled={busy}
                        onClick={() => setPendingDeleteId(def.id)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isExpanded && !isEditing && (
                <EdgeOptionsEditor def={def} busy={busy} run={run} isBuiltin={isBuiltin} />
              )}
            </div>
          );
        })}
      </div>

      <div className="settings-param-add">
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Field name…"
          onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) addParam(); }}
        />
        <select value={newType} onChange={e => {
          setNewType(e.target.value);
          resetDriveFlags(e.target.value);
        }}>
          {PARAM_TYPES.map(t => <option key={t} value={t}>{PARAM_TYPE_LABELS[t] ?? t}</option>)}
        </select>
        {(newType === 'text' || newType === 'number') && (
          <input value={newDefault} onChange={e => setNewDefault(e.target.value)} placeholder="Default value (optional)" />
        )}
        <div className="settings-drive-flags">
          {newType === 'boolean' && (
            <label className="checkbox-label">
              <input type="checkbox" checked={newDrivesArrow} onChange={e => setNewDrivesArrow(e.target.checked)} />
              Drives arrow
            </label>
          )}
          {newType === 'select' && (
            <label className="checkbox-label">
              <input type="checkbox" checked={newDrivesStyle} onChange={e => setNewDrivesStyle(e.target.checked)} />
              Drives style
            </label>
          )}
          {newType === 'select_color' && (
            <label className="checkbox-label">
              <input type="checkbox" checked={newDrivesColor} onChange={e => setNewDrivesColor(e.target.checked)} />
              Drives color
            </label>
          )}
          {newType === 'number' && (
            <label className="checkbox-label">
              <input type="checkbox" checked={newDrivesWidth} onChange={e => setNewDrivesWidth(e.target.checked)} />
              Drives width
            </label>
          )}
        </div>
        <button className="btn btn--ghost btn--sm" disabled={busy || !newName.trim()} onClick={addParam}>
          <Plus size={13} /> Add Field
        </button>
      </div>
    </div>
  );
}

// ── Edge options editor ───────────────────────────────────────────────────────

function EdgeOptionsEditor({
  def,
  busy,
  run,
  isBuiltin,
}: {
  def: EdgeParamDef;
  busy: boolean;
  run: <T>(fn: () => Promise<T>) => Promise<void>;
  isBuiltin: boolean;
}) {
  const isColor = def.paramType === 'select_color';
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editingOpt, setEditingOpt] = useState<EdgeParamOption | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');
  const [pendingDeleteOptId, setPendingDeleteOptId] = useState<string | null>(null);

  function startEditOpt(opt: EdgeParamOption) {
    setEditingOpt(opt);
    setEditLabel(opt.label);
    setEditColor(opt.color ?? PALETTE[0]);
  }

  async function addOption() {
    if (!newLabel.trim()) return;
    await run(() => api.createEdgeParamOption({
      paramDefId: def.id,
      label: newLabel.trim(),
      color: isColor ? newColor : null,
    }));
    setNewLabel('');
    setNewColor(PALETTE[0]);
  }

  async function saveOptEdit(opt: EdgeParamOption) {
    await run(() => api.updateEdgeParamOption({
      id: opt.id,
      label: editLabel.trim(),
      color: isColor ? editColor : null,
    }));
    setEditingOpt(null);
  }

  return (
    <div className="settings-sub-list">
      {def.options.length === 0 && (
        <p className="settings-empty" style={{ margin: '8px 0 8px 12px' }}>No options yet</p>
      )}
      {def.options.map(opt => (
        <div key={opt.id} className="settings-sub-row">
          {editingOpt?.id === opt.id ? (
            <div className="settings-row__inline-edit settings-row__inline-edit--full">
              <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && editLabel.trim()) saveOptEdit(opt);
                  if (e.key === 'Escape') setEditingOpt(null);
                }}
              />
              {isColor && <ColorPicker value={editColor} onChange={setEditColor} />}
              <button className="icon-btn icon-btn--confirm" disabled={busy || !editLabel.trim()}
                onClick={() => saveOptEdit(opt)}>
                <Check size={13} />
              </button>
              <button className="icon-btn" onClick={() => setEditingOpt(null)}><X size={13} /></button>
            </div>
          ) : (
            <>
              <div className="settings-row__left">
                {isColor && opt.color && (
                  <span className="settings-row__color-dot" style={{ background: opt.color }} />
                )}
                <span className="settings-sub-row__label">{opt.label}</span>
                <span className="settings-row__hint" style={{ fontFamily: 'monospace' }}>{opt.valueSlug}</span>
              </div>
              {!isBuiltin && (
                <div className="settings-row__actions">
                  <button className="icon-btn" disabled={busy} onClick={() => startEditOpt(opt)}>
                    <Pencil size={13} />
                  </button>
                  {pendingDeleteOptId === opt.id ? (
                    <span className="settings-row__delete-confirm">
                      <button className="btn btn--xs btn--danger" onClick={() => { run(() => api.deleteEdgeParamOption(opt.id)); setPendingDeleteOptId(null); }}>Delete</button>
                      <button className="icon-btn" onClick={() => setPendingDeleteOptId(null)}><X size={12} /></button>
                    </span>
                  ) : (
                    <button className="icon-btn icon-btn--danger" disabled={busy} onClick={() => setPendingDeleteOptId(opt.id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {!isBuiltin && (
        <div className={`settings-add-row settings-add-row--inline ${isColor ? 'settings-add-row--with-color' : ''}`}>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            placeholder="New option…"
            onKeyDown={e => { if (e.key === 'Enter') addOption(); }}
          />
          {isColor && <ColorPicker value={newColor} onChange={setNewColor} />}
          <button className="btn btn--ghost btn--xs" disabled={busy || !newLabel.trim()} onClick={addOption}>
            <Plus size={12} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

// ── Display Tab ───────────────────────────────────────────────────────────────

const ROUTING_OPTIONS: { mode: EdgeRoutingMode; label: string; description: string }[] = [
  {
    mode: 'bezier',
    label: 'Bezier',
    description: 'Smooth curved edges with a single draggable control point.',
  },
  {
    mode: 'waypoints',
    label: 'Waypoints',
    description: 'Straight segments with draggable intermediate points. Click a selected edge to add a point; double-click a point to remove it.',
  },
  {
    mode: 'orthogonal',
    label: 'Orthogonal',
    description: 'Right-angle routing. Drag the central handle to shift the bend left or right.',
  },
];

function DisplayTab({
  edgeRoutingMode,
  setEdgeRoutingMode,
  snapToGrid,
  setSnapToGrid,
  expandNodesByDefault,
  setExpandNodesByDefault,
}: {
  edgeRoutingMode: EdgeRoutingMode;
  setEdgeRoutingMode: (mode: EdgeRoutingMode) => Promise<void>;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => Promise<void>;
  expandNodesByDefault: boolean;
  setExpandNodesByDefault: (v: boolean) => Promise<void>;
}) {
  return (
    <>
      <div className="settings-section">
        <h3 className="settings-section-title">Edge Routing</h3>
        <p className="settings-section-desc">Controls how edges are drawn between nodes. Select an edge and drag the handles to adjust its shape.</p>
        <div className="routing-options">
          {ROUTING_OPTIONS.map(({ mode, label, description }) => (
            <button
              key={mode}
              className={`routing-option ${edgeRoutingMode === mode ? 'routing-option--active' : ''}`}
              onClick={() => setEdgeRoutingMode(mode)}
            >
              <span className="routing-option__label">{label}</span>
              <span className="routing-option__desc">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Canvas</h3>
        <label className="settings-toggle-row">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={e => setSnapToGrid(e.target.checked)}
          />
          <span className="settings-toggle-label">Snap to grid</span>
          <span className="settings-toggle-desc">Nodes snap to a 24px grid while dragging.</span>
        </label>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Nodes</h3>
        <label className="settings-toggle-row">
          <input
            type="checkbox"
            checked={expandNodesByDefault}
            onChange={e => setExpandNodesByDefault(e.target.checked)}
          />
          <span className="settings-toggle-label">Expand nodes by default</span>
          <span className="settings-toggle-desc">Show every node card's full details at rest. Off: cards stay compact and expand on hover.</span>
        </label>
      </div>
    </>
  );
}

// ── API Tab ───────────────────────────────────────────────────────────────────

function ApiTab() {
  // The HTTP API, SDK, and shared sessions are desktop-app features — greyed out
  // (replaced with a notice) in the web demo.
  if (IS_DEMO) {
    return (
      <>
        <div className="settings-section">
          <h3 className="settings-section-title">HTTP API &amp; SDK</h3>
          <p className="settings-section-desc">
            The local REST API and the Python SDK are part of the desktop app — they're not available in
            the web demo.
          </p>
          <p className="settings-section-desc">
            In the full app you can script your graphs, stream data in, and let AI agents read and build
            graphs over a local API.
          </p>
        </div>
        <div className="settings-section">
          <h3 className="settings-section-title">Live Share</h3>
          <p className="settings-section-desc">
            Hosting and joining shared sessions are coming to the desktop app, and aren't part of the web
            demo.
          </p>
        </div>
      </>
    );
  }
  const { setApiEnabled } = useSettings();
  const [enabled, setEnabled] = useState(false);
  const [port, setPort] = useState('57321');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAppSetting('api_enabled'),
      api.getAppSetting('api_port'),
      api.getAppSetting('api_token'),
      api.getDisplayName(),
    ]).then(([en, p, tk, dn]) => {
      setEnabled(en === 'true');
      setPort(p ?? '57321');
      setToken(tk ?? '');
      setDisplayName(dn ?? '');
      setLoading(false);
    });
  }, []);

  async function toggleEnabled(val: boolean) {
    setEnabled(val);
    // Route through the settings context so the on-canvas "API" badge updates live.
    await setApiEnabled(val);
  }

  async function saveToken(val: string) {
    setToken(val);
    await api.setAppSetting('api_token', val);
  }

  async function copyToken() {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function generateToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    saveToken(hex);
  }

  if (loading) return null;

  return (
    <>
      <div className="settings-section">
        <h3 className="settings-section-title">Display name</h3>
        <p className="settings-section-desc">
          Your name for shared sessions (used for presence and attribution when collaboration
          lands). You'll be prompted for it before hosting or joining.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <code className="api-port-value">{displayName || 'Not set'}</code>
          <button className="btn btn--ghost btn--sm" onClick={() => setNamePromptOpen(true)}>
            {displayName ? 'Edit…' : 'Set name…'}
          </button>
        </div>
      </div>
      {namePromptOpen && (
        <DisplayNamePrompt
          initialName={displayName || undefined}
          onConfirm={n => { setDisplayName(n); setNamePromptOpen(false); }}
          onCancel={() => setNamePromptOpen(false)}
        />
      )}

      <div className="settings-section">
        <h3 className="settings-section-title">HTTP API</h3>
        <p className="settings-section-desc">
          Expose a local REST API for scripting and automation. Only accessible from this machine
          (<code style={{ fontFamily: 'monospace', fontSize: 11 }}>127.0.0.1</code>).
        </p>
        <label className="settings-toggle-row">
          <input type="checkbox" checked={enabled} onChange={e => toggleEnabled(e.target.checked)} />
          <span className="settings-toggle-label">Enable API</span>
          {enabled && (
            <span className="settings-toggle-desc">Listening on <code style={{ fontFamily: 'monospace', fontSize: 11 }}>http://127.0.0.1:{port}/api</code></span>
          )}
        </label>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Port</h3>
        <p className="settings-section-desc">
          Port is set at startup. Restart the app to apply a new port value.
        </p>
        <code className="api-port-value">{port}</code>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Auth Token</h3>
        <p className="settings-section-desc">
          If set, every request must include <code style={{ fontFamily: 'monospace', fontSize: 11 }}>Authorization: Bearer &lt;token&gt;</code>.
          Leave empty to disable auth (local use only).
        </p>

        <div className="api-token-row">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={e => saveToken(e.target.value)}
            placeholder="No token — auth disabled"
            spellCheck={false}
          />
          <button className="icon-btn" title={showToken ? 'Hide token' : 'Show token'} onClick={() => setShowToken(v => !v)}>
            {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button className="icon-btn" title={copied ? 'Copied!' : 'Copy token'} disabled={!token} onClick={copyToken}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <button className="icon-btn" title="Generate new token" onClick={generateToken}>
            <RefreshCw size={13} />
          </button>
        </div>

        {token && (
          <p className="api-token-hint">
            Python: <code style={{ fontFamily: 'monospace' }}>GloGraph(token="{token.slice(0, 8)}…")</code>
          </p>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Endpoints</h3>
        <div className="api-endpoints">
          {[
            ['GET', '/api/ping', 'Health check'],
            ['GET', '/api/graph', 'Full export'],
            ['GET', '/api/nodes', 'List nodes'],
            ['POST', '/api/nodes', 'Create node'],
            ['PATCH', '/api/nodes/:id', 'Update node'],
            ['DELETE', '/api/nodes/:id', 'Delete node'],
            ['GET', '/api/edges', 'List edges'],
            ['GET', '/api/regions', 'List regions'],
            ['POST', '/api/import', 'Import .glograph'],
          ].map(([method, path, desc]) => (
            <div key={path + method} className="api-endpoint-row">
              <span className={`api-endpoint-method api-endpoint-method--${method!.toLowerCase()}`}>{method}</span>
              <code className="api-endpoint-path">{path}</code>
              <span className="api-endpoint-desc">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Shortcuts Tab ───────────────────────────────────────────────────────────────

const SHORTCUTS: { group: string; items: { keys: string[]; desc: string }[] }[] = [
  { group: 'File', items: [
    { keys: ['Ctrl', 'N'], desc: 'New project' },
    { keys: ['Ctrl', 'W'], desc: 'Close current tab' },
    { keys: ['Ctrl', 'O'], desc: 'Open project' },
    { keys: ['Ctrl', 'S'], desc: 'Save (overwrites the linked file)' },
    { keys: ['Ctrl', 'Shift', 'S'], desc: 'Save As…' },
  ] },
  { group: 'Edit', items: [
    { keys: ['Ctrl', 'Z'], desc: 'Undo' },
    { keys: ['Ctrl', 'Y'], desc: 'Redo' },
    { keys: ['Ctrl', 'C'], desc: 'Copy selection' },
    { keys: ['Ctrl', 'V'], desc: 'Paste' },
    { keys: ['Ctrl', 'D'], desc: 'Duplicate selection' },
    { keys: ['Ctrl', 'A'], desc: 'Select all (or a selected region’s members)' },
    { keys: ['Del'], desc: 'Delete selection' },
  ] },
  { group: 'Create & connect', items: [
    { keys: ['N'], desc: 'Add a graph object (picker: Node / Note / Image / Video / Audio)' },
    { keys: ['Tab'], desc: 'Quick-connect a new node from the selected one' },
    { keys: ['W'], desc: 'Auto-wire selected nodes in order' },
    { keys: ['R'], desc: 'Cycle edge routing (bezier → waypoints → orthogonal)' },
  ] },
  { group: 'View & navigation', items: [
    { keys: ['E'], desc: 'Expand / collapse all nodes (or only the selected nodes)' },
    { keys: ['Ctrl', 'F'], desc: 'Focus the sidebar search' },
    { keys: ['/'], desc: 'Quick-find nodes' },
    { keys: ['G'], desc: 'Zoom to selection (fit all if nothing selected)' },
    { keys: ['Ctrl', 'Shift', 'F'], desc: 'Zoom to selection' },
    { keys: ['Ctrl', 'B'], desc: 'Bookmark the current view' },
    { keys: ['\\'], desc: 'Toggle focus mode (hide side panels)' },
  ] },
  { group: 'General', items: [
    { keys: ['Esc'], desc: 'Close the open panel / dialog, or deselect all' },
  ] },
];

function ShortcutsTab() {
  return (
    <>
      <p className="settings-hint">Keyboard shortcuts available throughout the app. Modifier keys are <code style={{ fontFamily: 'monospace' }}>Ctrl</code> on Windows/Linux and <code style={{ fontFamily: 'monospace' }}>⌘</code> on macOS.</p>
      {SHORTCUTS.map(section => (
        <div className="settings-section" key={section.group}>
          <h3 className="settings-section-title">{section.group}</h3>
          <div className="shortcut-list">
            {section.items.map(s => (
              <div className="shortcut-row" key={s.desc}>
                <span className="shortcut-keys">
                  {s.keys.map(k => <kbd className="shortcut-key" key={k}>{k}</kbd>)}
                </span>
                <span className="shortcut-desc">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Color Picker ──────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="inline-color-picker">
      {PALETTE.map(c => (
        <button key={c} type="button"
          className={`color-swatch color-swatch--sm ${value === c ? 'color-swatch--active' : ''}`}
          style={{ background: c }} onClick={() => onChange(c)} title={c}
        />
      ))}
    </div>
  );
}
