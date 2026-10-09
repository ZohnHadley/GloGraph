import { useState } from 'react';
import { Users } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface BulkEditPanelProps {
  nodeIds: string[];
  onSaveAll: (paramDefId: string, value: string | null) => Promise<void>;
  onAutoWire?: () => void;
}

export default function BulkEditPanel({ nodeIds, onSaveAll, onAutoWire }: BulkEditPanelProps) {
  const { activeParamDefs } = useSettings();
  const [saving, setSaving] = useState(false);
  const [selectedParamId, setSelectedParamId] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const selectableParams = activeParamDefs.filter(
    d => d.paramType === 'select' || d.paramType === 'select_color'
  );

  const selectedDef = selectableParams.find(d => d.id === selectedParamId);

  async function handleApply() {
    if (!selectedParamId) return;
    setSaving(true);
    try {
      await onSaveAll(selectedParamId, selectedValue || null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="detail-panel bulk-edit-panel">
      <div className="detail-panel__header">
        <Users size={14} />
        <h2>{nodeIds.length} nodes selected</h2>
      </div>
      <div className="detail-panel__body">
        {selectableParams.length === 0 ? (
          <p className="form-hint">No dropdown fields defined in this preset.</p>
        ) : (
          <>
            <div className="form-group">
              <label>Field</label>
              <select value={selectedParamId} onChange={e => { setSelectedParamId(e.target.value); setSelectedValue(''); }}>
                <option value="">— Choose field —</option>
                {selectableParams.map(d => (
                  <option key={d.id} value={d.id}>{d.displayName}</option>
                ))}
              </select>
            </div>
            {selectedDef && (
              <div className="form-group">
                <label>Set value</label>
                <select value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
                  <option value="">— Clear —</option>
                  {selectedDef.options.map(opt => (
                    <option key={opt.id} value={opt.valueSlug}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            <p className="form-hint">Applies the chosen value to all {nodeIds.length} selected nodes. Other field values are unchanged.</p>
          </>
        )}
      </div>
      <div className="detail-panel__footer">
        {onAutoWire && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={onAutoWire}
            title="Connect selected nodes in order (W)"
          >
            Auto-Wire
          </button>
        )}
        <button
          className="btn btn--primary"
          onClick={handleApply}
          disabled={saving || !selectedParamId}
        >
          {saving ? 'Applying…' : `Apply to ${nodeIds.length} nodes`}
        </button>
      </div>
    </aside>
  );
}
