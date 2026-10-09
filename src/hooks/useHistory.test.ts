// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from './useHistory';

const okEntry = () => ({
  undo: vi.fn().mockResolvedValue(undefined),
  redo: vi.fn().mockResolvedValue(undefined),
});

describe('useHistory', () => {
  it('moves an entry undo → redo → undo across the stacks', async () => {
    const { result } = renderHook(() => useHistory());
    const e = okEntry();

    act(() => result.current.push(e));
    expect(result.current.canUndo).toBe(true);
    expect(result.current.undoCount).toBe(1);

    await act(async () => { await result.current.undo(); });
    expect(e.undo).toHaveBeenCalledOnce();
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    await act(async () => { await result.current.redo(); });
    expect(e.redo).toHaveBeenCalledOnce();
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('keeps the entry on the stack when undo() throws (no silent loss)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useHistory());
    const e = { undo: vi.fn().mockRejectedValue(new Error('boom')), redo: vi.fn() };

    act(() => result.current.push(e));
    await act(async () => { await result.current.undo(); });

    // The failed undo must NOT drop the entry or move it to redo.
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.undoCount).toBe(1);
    errSpy.mockRestore();
  });

  it('push() clears the redo stack', async () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.push(okEntry()));
    await act(async () => { await result.current.undo(); });
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.push(okEntry()));
    expect(result.current.canRedo).toBe(false);
  });

  it('clear() empties both stacks', async () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.push(okEntry()));
    act(() => result.current.clear());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.undoCount).toBe(0);
  });
});
