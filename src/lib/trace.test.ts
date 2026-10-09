import { describe, it, expect } from 'vitest';
import { computeTrace, type TraceEdge, type TraceDirection, type TraceNode } from './trace';
// The SAME fixture drives the Rust core test (src-tauri/src/core/trace.rs).
// Pinning both engines to one contract is what lets the desktop (Rust) and the
// web demo (this JS mirror) stay in lockstep — and turns any reported trace bug
// into a one-line repro case here.
import fixture from '../../tests/fixtures/trace_cases.json';

interface Case {
  name: string;
  edges: TraceEdge[];
  seed: string;
  direction: TraceDirection;
  expect: { nodes: TraceNode[]; edgeIds: string[]; reachedCount: number; maxHop: number };
}

const cases = fixture as unknown as Case[];

describe('computeTrace — shared contract fixture', () => {
  it('has cases', () => expect(cases.length).toBeGreaterThan(0));

  for (const c of cases) {
    it(c.name, () => {
      const got = computeTrace(c.seed, c.edges, c.direction);
      expect(got.nodes).toEqual(c.expect.nodes);
      expect(got.edgeIds).toEqual(c.expect.edgeIds);
      expect(got.reachedCount).toBe(c.expect.reachedCount);
      expect(got.maxHop).toBe(c.expect.maxHop);
      expect(got.seedId).toBe(c.seed);
      expect(got.direction).toBe(c.direction);
    });
  }
});
