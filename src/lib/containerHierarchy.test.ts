import { describe, it, expect } from 'vitest';
import { computeHierarchy, subtreeOf } from './containerHierarchy';
import type { GloNode, GloRegion } from '../types';

// Minimal factories — the hierarchy functions only read id/x/y (nodes) and
// id/x/y/width/height (regions).
const node = (id: string, x: number, y: number): GloNode => ({ id, x, y } as GloNode);
const region = (id: string, x: number, y: number, width: number, height: number): GloRegion =>
  ({ id, x, y, width, height } as GloRegion);

describe('computeHierarchy', () => {
  // outer ⊃ inner ⊃ n1   (n1 center (100,100) sits inside the small inner region)
  const outer = region('outer', 0, 0, 400, 400);
  const inner = region('inner', 50, 50, 100, 100);
  const n1 = node('n1', 0, 60); // center (100, 100)

  it('assigns each element to its smallest containing region (immediate parent)', () => {
    const h = computeHierarchy([n1], [outer, inner]);
    expect(h.parentOf.get('n1')).toBe('inner');   // smallest container wins, not outer
    expect(h.parentOf.get('inner')).toBe('outer');
    expect(h.parentOf.get('outer')).toBe(null);
  });

  it('records childrenOf for each parent', () => {
    const h = computeHierarchy([n1], [outer, inner]);
    expect(h.childrenOf.get('outer')).toEqual(['inner']);
    expect(h.childrenOf.get('inner')).toEqual(['n1']);
  });

  it('leaves a node with no containing region top-level', () => {
    const lone = node('lone', 1000, 1000);
    const h = computeHierarchy([lone], [outer]);
    expect(h.parentOf.get('lone')).toBe(null);
  });
});

describe('subtreeOf (transitive descendants — the drag set)', () => {
  const outer = region('outer', 0, 0, 400, 400);
  const inner = region('inner', 50, 50, 100, 100);
  const n1 = node('n1', 0, 60); // inside inner
  const regionIds = new Set(['outer', 'inner']);

  it('includes nested regions and their contents transitively', () => {
    const h = computeHierarchy([n1], [outer, inner]);
    const sub = subtreeOf('outer', h, regionIds);
    expect(sub).toEqual(new Set(['inner', 'n1']));
  });

  it('a leaf region returns just its direct members', () => {
    const h = computeHierarchy([n1], [outer, inner]);
    expect(subtreeOf('inner', h, regionIds)).toEqual(new Set(['n1']));
  });
});
