// Canonical node dimensions used for every region-membership check.
export const NODE_W = 200;
export const NODE_H = 80;

/**
 * A node counts as a member of a region when its **center point** lies inside
 * the region. This is size-independent — so a region only slightly larger than
 * a node (e.g. a small region nested inside a bigger one) can still capture it —
 * and matches the intuition of "dropped into the region". (Previously this was a
 * ≥75%-of-node-area test, which a small nested region could never satisfy, so a
 * node moved into it stayed captured only by the larger outer region.)
 *
 * Single source of truth for node membership everywhere it matters — locking,
 * region-member selection, auto-fit, and copy/duplicate.
 */
export function isNodeInRegion(
  node: { x: number; y: number; width?: number | null; height?: number | null },
  region: { x: number; y: number; width: number; height: number },
): boolean {
  // Resizable items (image/video/note) carry an explicit size; fall back to the
  // standard node dimensions when absent.
  const cx = node.x + (node.width ?? NODE_W) / 2;
  const cy = node.y + (node.height ?? NODE_H) / 2;
  return cx >= region.x && cx <= region.x + region.width
      && cy >= region.y && cy <= region.y + region.height;
}

/**
 * Region-in-region membership: an inner region belongs to an outer region when
 * (a) the outer region is **strictly larger** than the inner, and (b) at least
 * 50% of the inner region's area overlaps the outer. Sibling rule to
 * `isNodeInRegion` — keeping both here means containment/locking behaves the
 * same way across element types ("base" membership behavior shared by all
 * graph elements).
 *
 * The strictly-larger guard is essential: without it, when a child region is
 * ≥50% of its parent's area, the parent∩child overlap (= the child's full area)
 * is also ≥50% of the *parent's* area — so `isRegionInRegion(parent, child)`
 * would wrongly report the bigger parent as contained by its smaller child, and
 * locking the child would capture the parent. Requiring outer.area > inner.area
 * makes containment one-directional (only the larger region can be the parent).
 */
export function isRegionInRegion(
  inner: { x: number; y: number; width: number; height: number },
  outer: { x: number; y: number; width: number; height: number },
): boolean {
  const innerArea = inner.width * inner.height;
  const outerArea = outer.width * outer.height;
  if (innerArea <= 0 || outerArea <= innerArea) return false;
  const iL = Math.max(inner.x, outer.x);
  const iT = Math.max(inner.y, outer.y);
  const iR = Math.min(inner.x + inner.width, outer.x + outer.width);
  const iB = Math.min(inner.y + inner.height, outer.y + outer.height);
  if (iR <= iL || iB <= iT) return false;
  return ((iR - iL) * (iB - iT)) / innerArea >= 0.5;
}
