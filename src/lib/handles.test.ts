import { describe, it, expect } from 'vitest';
import { closestHandles } from './handles';
// The SAME fixture drives the Rust core test (src-tauri/src/core/handles.rs), so
// the desktop backend and this web-demo mirror can't diverge.
import fixture from '../../tests/fixtures/handle_cases.json';

interface Case { name: string; dx: number; dy: number; source: string; target: string; }
const cases = fixture as unknown as Case[];

describe('closestHandles — shared contract fixture', () => {
  it('has cases', () => expect(cases.length).toBeGreaterThan(0));

  for (const c of cases) {
    it(c.name, () => {
      const [s, t] = closestHandles(c.dx, c.dy);
      expect(s).toBe(c.source);
      expect(t).toBe(c.target);
    });
  }
});
