import { useEffect, useRef, useState } from 'react';
import { X, Trash2, Loader, Plus, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { EdgeParamDef, GloEdge, GloNode, UpdateEdgeInput } from '../types';
import { useSettings } from '../context/SettingsContext';
import { SWATCH_COLORS } from '../lib/swatches';

interface EdgePanelProps {
  edge: GloEdge;
  nodes: GloNode[];
  onClose: () => void;
  onSave: (input: UpdateEdgeInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onFlipEdge?: (id: string) => void;
  onSelectNode?: (node: GloNode) => void;
  readOnly?: boolean;
}

type LocalValues = Record<string, { value: string | null; isEnabled: boolean }>;

function buildInitValues(edge: GloEdge, defs: EdgeParamDef[]): LocalValues {
  const out: LocalValues = {};
  for (const def of defs) {
    const pv = edge.paramValues.find(p => p.paramDefId === def.id);
    out[def.id] = pv
      ? { value: pv.value ?? null, isEnabled: pv.isEnabled }
      : { value: def.defaultValue ?? null, isEnabled: false };
  }
  return out;
}

function buildVisibleIds(edge: GloEdge, defs: EdgeParamDef[]): Set<string> {
  const ids = new Set<string>();
  for (const def of defs) {
    const pv = edge.paramValues.find(p => p.paramDefId === def.id);
    if (pv && (pv.isEnabled || pv.value != null)) ids.add(def.id);
    // Always show params that have a defaultValue so they appear on new edges
    else if (def.defaultValue != null) ids.add(def.id);
  }
  return ids;
}

export default function EdgePanel({ edge, nodes, onClose, onSave, onDelete, onFlipEdge, onSelectNode, readOnly }: EdgePanelProps) {
  const { activeEdgeParamDefs, getEdgeArrow } = useSettings();
  const [values, setValues] = useState<LocalValues>(() => buildInitValues(edge, activeEdgeParamDefs));
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => buildVisibleIds(edge, activeEdgeParamDefs));
  const [color, setColor] = useState(edge.color ?? '');
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValues(buildInitValues(edge, activeEdgeParamDefs));
    setVisibleIds(buildVisibleIds(edge, activeEdgeParamDefs));
    setColor(edge.color ?? '');
    setAddFieldOpen(false);
    setError(null);
  }, [edge.id]);

  // Close add-field picker on outside click
  useEffect(() => {
    if (!addFieldOpen) return;
    function handler(e: MouseEvent) {
      if (addFieldRef.current && !addFieldRef.current.contains(e.target as Node)) {
        setAddFieldOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addFieldOpen]);

  const sourceNode = nodes.find(n => n.id === edge.sourceId);
  const targetNode = nodes.find(n => n.id === edge.targetId);
  const busy = saving || deleting;

  // Derive arrow direction for header display
  const arrowParam = activeEdgeParamDefs.find(d => d.drivesArrow);
  const isDirected = arrowParam
    ? (values[arrowParam.id]?.value !== 'false')
    : getEdgeArrow(edge);

  const hiddenDefs = activeEdgeParamDefs.filter(d => !visibleIds.has(d.id));

  function showParam(def: EdgeParamDef) {
    setVisibleIds(prev => new Set([...prev, def.id]));
    setValues(prev => ({
      ...prev,
      [def.id]: prev[def.id]
        ? { ...prev[def.id], isEnabled: true }
        : { value: def.defaultValue ?? null, isEnabled: true },
    }));
    setAddFieldOpen(false);
  }

  function hideParam(defId: string) {
    setVisibleIds(prev => { const s = new Set(prev); s.delete(defId); return s; });
    setValues(prev => ({ ...prev, [defId]: { ...prev[defId], isEnabled: false } }));
  }

  function setValue(defId: string, value: string | null) {
    setValues(prev => ({
      ...prev,
      [defId]: { value, isEnabled: prev[defId]?.isEnabled ?? true },
    }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const paramValues = activeEdgeParamDefs.map(def => ({
        paramDefId: def.id,
        value: values[def.id]?.value ?? null,
        isEnabled: visibleIds.has(def.id),
      }));
      await onSave({ id: edge.id, paramValues, label: edge.label ?? null, color: color || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await onDelete(edge.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <aside className={`detail-panel${readOnly ? ' detail-panel--readonly' : ''}`}>
      <div className="detail-panel__header">
        <h2>Connection</h2>
        <button className="icon-btn" onClick={onClose} title="Close" disabled={busy}>
          <X size={16} />
        </button>
      </div>

      <div className="detail-panel__body">
        {readOnly && <div className="panel-readonly-note">View only — editing is disabled. You can still jump to the connected nodes.</div>}
        <fieldset className="panel-edit-fieldset">
        {error && <div className="form-error">{error}</div>}

        <div className="edge-nodes">
          <button
            className="edge-node-label edge-node-label--btn nav-allowed"
            title={sourceNode ? `Open: ${sourceNode.title}` : undefined}
            onClick={() => sourceNode && onSelectNode?.(sourceNode)}
            disabled={!sourceNode || !onSelectNode}
          >
            {sourceNode?.title ?? edge.sourceId}
          </button>
          <span className="edge-arrow">{isDirected ? '→' : '↔'}</span>
          <button
            className="edge-node-label edge-node-label--btn nav-allowed"
            title={targetNode ? `Open: ${targetNode.title}` : undefined}
            onClick={() => targetNode && onSelectNode?.(targetNode)}
            disabled={!targetNode || !onSelectNode}
          >
            {targetNode?.title ?? edge.targetId}
          </button>
          {onFlipEdge && (
            <button
              className="icon-btn icon-btn--muted edge-flip-btn"
              onClick={() => onFlipEdge(edge.id)}
              title="Flip direction"
              disabled={busy}
            >
              <ArrowLeftRight size={12} />
            </button>
          )}
        </div>

        <div className="form-group">
          <label>Edge Color</label>
          <div className="color-picker">
            <button
              className={`color-swatch color-swatch--clear ${color === '' ? 'color-swatch--active' : ''}`}
              onClick={() => setColor('')}
              disabled={busy}
              title="Default (white)"
            />
            {SWATCH_COLORS.map(c => (
              <button key={c}
                className={`color-swatch ${color === c ? 'color-swatch--active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(prev => prev === c ? '' : c)}
                disabled={busy}
                title={c}
              />
            ))}
          </div>
          <span className="form-hint">{color ? 'Custom edge color' : 'Default — white'}</span>
        </div>

        {activeEdgeParamDefs
          .filter(def => visibleIds.has(def.id))
          .map(def => (
            <EdgeParamField
              key={def.id}
              def={def}
              value={values[def.id]?.value ?? null}
              disabled={busy}
              onChange={v => setValue(def.id, v)}
              onRemove={() => hideParam(def.id)}
            />
          ))}

        <div className="panel-add-field" ref={addFieldRef}>
          <button
            className="btn btn--ghost btn--sm panel-add-field__btn"
            onClick={() => setAddFieldOpen(o => !o)}
            disabled={busy || hiddenDefs.length === 0}
          >
            <Plus size={12} /> Add field
            {hiddenDefs.length > 0 && <ChevronDown size={11} />}
          </button>
          {addFieldOpen && hiddenDefs.length > 0 && (
            <div className="panel-field-picker">
              {hiddenDefs.map(def => (
                <button
                  key={def.id}
                  className="panel-field-picker__item"
                  onClick={() => showParam(def)}
                >
                  <span>{def.displayName}</span>
                  <span className="param-type-badge">{def.paramType}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        </fieldset>
      </div>

      <div className="detail-panel__footer">
        <button className="btn btn--danger" onClick={handleDelete} disabled={busy || readOnly}>
          {deleting ? <><Loader size={14} className="spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
        </button>
        <button className="btn btn--primary" onClick={handleSave} disabled={busy || readOnly}>
          {saving ? <><Loader size={14} className="spin" /> Saving…</> : 'Save Changes'}
        </button>
      </div>
    </aside>
  );
}

// ── Edge param field renderer ─────────────────────────────────────────────────

function EdgeParamField({
  def,
  value,
  disabled,
  onChange,
  onRemove,
}: {
  def: EdgeParamDef;
  value: string | null;
  disabled: boolean;
  onChange: (v: string | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="form-group form-group--param">
      <div className="form-group__header">
        <label>{def.displayName}</label>
        <button className="icon-btn icon-btn--muted" onClick={onRemove} disabled={disabled} title="Remove field">
          <X size={11} />
        </button>
      </div>

      {def.paramType === 'boolean' && (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={value === 'true'}
            disabled={disabled}
            onChange={e => onChange(e.target.checked ? 'true' : 'false')}
          />
          {value === 'true' ? 'Yes' : 'No'}
        </label>
      )}

      {def.paramType === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          disabled={disabled}
          onChange={e => onChange(e.target.value || null)}
        />
      )}

      {def.paramType === 'text' && (
        <textarea
          value={value ?? ''}
          disabled={disabled}
          rows={3}
          onChange={e => onChange(e.target.value || null)}
        />
      )}

      {(def.paramType === 'select' || def.paramType === 'select_color') && (() => {
        const dot = def.paramType === 'select_color'
          ? def.options.find(o => o.valueSlug === value)
          : null;
        return (
          <div className="select-color-wrap">
            {dot?.color && <span className="select-color-dot" style={{ background: dot.color }} />}
            <select value={value ?? ''} disabled={disabled} onChange={e => onChange(e.target.value || null)}>
              <option value="">— None —</option>
              {def.options.map(opt => (
                <option key={opt.id} value={opt.valueSlug}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      })()}
    </div>
  );
}
