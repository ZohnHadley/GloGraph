import { useRef, useState } from 'react';

export interface HistoryEntry {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

export function useHistory() {
  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  // Guards against overlapping undo/redo — each entry runs async DB work, and
  // interleaving two of them would corrupt the stacks.
  const busyRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);

  function sync() {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
    setUndoCount(undoStack.current.length);
  }

  function push(entry: HistoryEntry) {
    undoStack.current.push(entry);
    redoStack.current = [];
    sync();
  }

  async function undo() {
    if (busyRef.current) return;
    // Peek, don't pop — only remove the entry once its undo() succeeds, so a
    // failed undo leaves the entry on the stack instead of silently dropping it.
    const entry = undoStack.current[undoStack.current.length - 1];
    if (!entry) return;
    busyRef.current = true;
    try {
      await entry.undo();
      // Remove by identity (a push during the await could have changed the top).
      const i = undoStack.current.lastIndexOf(entry);
      if (i !== -1) undoStack.current.splice(i, 1);
      redoStack.current.push(entry);
      sync();
    } catch (e) {
      console.error('Undo failed; entry kept on the stack', e);
    } finally {
      busyRef.current = false;
    }
  }

  async function redo() {
    if (busyRef.current) return;
    const entry = redoStack.current[redoStack.current.length - 1];
    if (!entry) return;
    busyRef.current = true;
    try {
      await entry.redo();
      const i = redoStack.current.lastIndexOf(entry);
      if (i !== -1) redoStack.current.splice(i, 1);
      undoStack.current.push(entry);
      sync();
    } catch (e) {
      console.error('Redo failed; entry kept on the stack', e);
    } finally {
      busyRef.current = false;
    }
  }

  function clear() {
    undoStack.current = [];
    redoStack.current = [];
    busyRef.current = false;
    sync();
  }

  return { push, undo, redo, canUndo, canRedo, clear, undoCount };
}
