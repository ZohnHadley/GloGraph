import { describe, it, expect } from 'vitest';
import { isNodeInRegion, isRegionInRegion, NODE_W, NODE_H } from './regionMembership';

const region = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

describe('isNodeInRegion (center-point membership)', () => {
  it('is true when the node center lies inside the region', () => {
    // node at (0,0) → center (100, 40)
    expect(isNodeInRegion({ x: 0, y: 0 }, region(0, 0, 300, 200))).toBe(true);
  });

  it('is false when the node center lies outside the region', () => {
    expect(isNodeInRegion({ x: 500, y: 500 }, region(0, 0, 300, 200))).toBe(false);
  });

  it('is size-independent: a region barely larger than the center still captures it', () => {
    // tiny region around the node center (100,40)
    expect(isNodeInRegion({ x: 0, y: 0 }, region(90, 30, 30, 30))).toBe(true);
  });

  it('uses the canonical node dimensions for the center', () => {
    // center is exactly (x + NODE_W/2, y + NODE_H/2)
    const cx = 10 + NODE_W / 2;
    const cy = 10 + NODE_H / 2;
    expect(isNodeInRegion({ x: 10, y: 10 }, region(cx - 1, cy - 1, 2, 2))).toBe(true);
    expect(isNodeInRegion({ x: 10, y: 10 }, region(cx + 5, cy + 5, 2, 2))).toBe(false);
  });
});

describe('isRegionInRegion (one-directional ≥50%-area containment)', () => {
  const inner = region(0, 0, 100, 100);
  const outer = region(0, 0, 300, 300);

  it('captures a fully-contained smaller region', () => {
    expect(isRegionInRegion(inner, outer)).toBe(true);
  });

  it('is one-directional: the larger region is never contained by the smaller', () => {
    expect(isRegionInRegion(outer, inner)).toBe(false);
  });

  it('requires the outer to be strictly larger (equal area → false)', () => {
    expect(isRegionInRegion(region(0, 0, 100, 100), region(10, 10, 100, 100))).toBe(false);
  });

  it('requires ≥50% of the inner area to overlap', () => {
    // 40% overlap → not contained
    expect(isRegionInRegion(region(0, 0, 100, 100), region(60, 0, 300, 300))).toBe(false);
    // 60% overlap → contained
    expect(isRegionInRegion(region(0, 0, 100, 100), region(40, 0, 300, 300))).toBe(true);
  });
});
