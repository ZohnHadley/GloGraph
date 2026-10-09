import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';

interface NewProjectDialogProps {
  onConfirm: (name: string, presetId: string) => void;
  onCancel: () => void;
}

const PRESETS = [
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Blank',
    description: 'No parameters — start from scratch',
    color: '#8b949e',
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Macro Economics',
    description: 'Events, causation, and macro themes',
    color: '#d68b2a',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'System Behavior',
    description: 'Stocks, flows, and feedback loops',
    color: '#3d9e5f',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Knowledge Map',
    description: 'Concepts, claims, and evidence',
    color: '#5588bb',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Project Tracker',
    description: 'Tasks, dependencies, and milestones',
    color: '#7766aa',
  },
];

export default function NewProjectDialog({ onConfirm, onCancel }: NewProjectDialogProps) {
  const [name, setName] = useState('');
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(name.trim() || 'Untitled Project', presetId);
  }

  return (
    <Modal title="New Project" size="sm" onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label>Project name</label>
            <input
              ref={inputRef}
              placeholder="Untitled Project"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Preset</label>
            <select value={presetId} onChange={e => setPresetId(e.target.value)}>
              {PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary btn--sm">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
