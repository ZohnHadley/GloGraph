import { Loader } from 'lucide-react';
import Modal from './Modal';
import type { ProjectTab } from '../types';

interface CloseTabDialogProps {
  tab: ProjectTab;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  /** When set, this is the app-quit flow (per-project, one at a time) rather than
   *  a single tab close — wording and progress differ. */
  quitting?: boolean;
  /** 1-based position within the quit queue, e.g. {index:0,total:3} → "1 of 3". */
  progress?: { index: number; total: number };
  /** A save is in flight — disable every action and show progress on Save. */
  busy?: boolean;
}

/**
 * Shown when closing a tab would lose work: a never-saved project (no file yet)
 * or a saved project with edits not yet written to its file. Also reused for the
 * app-quit flow (`quitting`), which walks each dirty project one at a time. Built
 * on the shared <Modal> so it inherits Escape-to-close (→ Cancel) and backdrop
 * click-to-close.
 */
export default function CloseTabDialog({ tab, onSave, onDiscard, onCancel, quitting, progress, busy }: CloseTabDialogProps) {
  const neverSaved = !tab.savePath;
  return (
    <Modal title={quitting ? 'Save before quitting?' : 'Unsaved Changes'} size="sm" onClose={busy ? () => {} : onCancel}>
      <div className="modal-body">
        {quitting && progress && progress.total > 1 && (
          <p className="settings-hint" style={{ marginBottom: 8 }}>
            <strong style={{ color: 'var(--text)' }}>Project {progress.index + 1} of {progress.total}</strong>
          </p>
        )}
        <p className="settings-hint">
          {quitting ? (
            <>&ldquo;{tab.name}&rdquo; has unsaved changes that aren&rsquo;t in its file yet.
            Save them before quitting?{neverSaved && ' (This project has never been saved to a file.)'}</>
          ) : neverSaved ? (
            <>&ldquo;{tab.name}&rdquo; has never been saved to a file. If you close it now, its
            contents will be <strong style={{ color: 'var(--text)' }}>permanently lost</strong>.</>
          ) : (
            <>&ldquo;{tab.name}&rdquo; has unsaved changes that aren&rsquo;t in its file yet.
            Closing without saving will discard them.</>
          )}
        </p>
      </div>
      {/* Footer: destructive action far left, separated from the primary by a
          spacer + Cancel (UX §2.3/§4.3 — danger never adjacent to the primary). */}
      <div className="modal-footer">
        <button className="btn btn--danger btn--sm" onClick={onDiscard} disabled={busy}>Don&rsquo;t Save</button>
        <span className="modal-footer__spacer" />
        <button className="btn btn--ghost btn--sm" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn btn--primary btn--sm" onClick={onSave} disabled={busy}>
          {busy
            ? <><Loader size={13} className="spin" /> Saving…</>
            : neverSaved ? 'Save As…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
