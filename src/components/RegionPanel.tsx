import { useEffect, useRef, useState } from 'react';
import { X, Trash2, Loader, Maximize2 } from 'lucide-react';
import type { GloNode, GloRegion, CreateRegionInput, UpdateRegionInput } from '../types';
import { isNodeInRegion } from '../lib/regionMembership';
import { SWATCH_COLORS } from '../lib/swatches';

interface RegionPanelProps {
  region?: GloRegion;
  nodes?: GloNode[];
  defaultPosition?: { x: number; y: number };
  onClose: () => void;
  onSave: (input: CreateRegionInput | UpdateRegionInput) => Promise<void>;
  onDelete?: (id: string) => void;
  onAutoFit?: (id: string) => void;
  readOnly?: boolean;
}

export default function RegionPanel({
  region,
  nodes,
  defaultPosition,
  onClose,
  onSave,
  onDelete,
  onAutoFit,
  readOnly,
}: RegionPanelProps) {
  const isCreate = !region;
  const [title, setTitle] = useState(region?.title ?? '');
  const [color, setColor] = useState(region?.color ?? '');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(region?.title ?? '');
    setColor(region?.color ?? '');
    setErrors([]);
  }, [region?.id]);

  useEffect(() => {
    // Only auto-focus the title when creating a new region; selecting an
    // existing region opens the panel without stealing focus.
    if (isCreate) setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  async function handleSave() {
    if (!title.trim()) { setErrors(['Title is required']); return; }
    setErrors([]);
    setSaving(true);
    try {
      if (region) {
        await onSave({
          id: region.id,
          title: title.trim(),
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          color: color || null,
        } satisfies UpdateRegionInput);
      } else {
        const pos = defaultPosition ?? { x: 0, y: 0 };
        await onSave({
          title: title.trim(),
          x: pos.x,
          y: pos.y,
          width: 320,
          height: 220,
          color: color || null,
        } satisfies CreateRegionInput);
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed.']);
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className={`detail-panel${readOnly ? ' detail-panel--readonly' : ''}`}>
      <div className="detail-panel__header">
        <h2>{isCreate ? 'Add Node Region' : (region?.title || 'Edit Node Region')}</h2>
        <button className="icon-btn" onClick={onClose} title="Close">
          <X size={16} />
        </button>
      </div>

      <div className="detail-panel__body">
        {readOnly && <div className="panel-readonly-note">View only — editing is disabled in this session.</div>}
        <fieldset className="panel-edit-fieldset">
        {errors.map(e => (
          <div key={e} className="form-error">{e}</div>
        ))}

        <div className="form-group">
          <label>Title *</label>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
            placeholder="Region title"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Border Color</label>
          <div className="color-picker">
            <button
              className={`color-swatch color-swatch--clear ${!color ? 'color-swatch--active' : ''}`}
              onClick={() => setColor('')}
              title="No color"
            />
            {SWATCH_COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'color-swatch--active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(prev => prev === c ? '' : c)}
                title={c}
              />
            ))}
          </div>
          <span className="form-hint">
            {color ? 'Custom border color' : 'Default border color'}
          </span>
        </div>
        </fieldset>
      </div>

      <div className="detail-panel__footer">
        {region && onDelete && (
          <button className="btn btn--danger" onClick={() => onDelete(region.id)} disabled={saving || readOnly}>
            <Trash2 size={14} /> Delete
          </button>
        )}
        {region && onAutoFit && nodes && (() => {
          const memberCount = nodes.filter(n => isNodeInRegion(n, region)).length;
          return memberCount > 0 ? (
            <button className="btn btn--ghost" onClick={() => onAutoFit(region.id)} disabled={saving || readOnly} title="Resize to fit member nodes">
              <Maximize2 size={13} /> Fit ({memberCount})
            </button>
          ) : null;
        })()}
        <button className="btn btn--primary" onClick={handleSave} disabled={saving || readOnly}>
          {saving
            ? <><Loader size={14} className="spin" /> Saving…</>
            : isCreate ? 'Add Node Region' : 'Save Changes'
          }
        </button>
      </div>
    </aside>
  );
}
