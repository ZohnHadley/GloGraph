import { describe, it, expect } from 'vitest';
import { mergeById } from './spectateSync';
import type { GloNode } from '../types';

const node = (id: string, over: Partial<GloNode> = {}): GloNode => ({
  id, title: id, description: null, eventDate: null, dateAdded: '', x: 0, y: 0, color: null,
  confidence: null, impactMagnitude: null, externalId: null, tags: [], links: [], media: [], paramValues: [], ...over,
});

describe('mergeById (the wired reload reconcile)', () => {
  it('returns server state: keeps unchanged refs, drops local-only, adds new', () => {
    const a = node('a'); const b = node('b');
    const out = mergeById([a, b], [node('a'), node('c')]); // a unchanged, b removed, c added
    expect(out.find(n => n.id === 'a')).toBe(a);            // unchanged → same ref (no re-render)
    expect(out.map(n => n.id)).toEqual(['a', 'c']);          // server order; b dropped, c added
  });

  it('replaces an entity that changed on the server', () => {
    const a = node('a', { x: 0 });
    const out = mergeById([a], [node('a', { x: 9 })]);
    expect(out[0]).not.toBe(a);
    expect(out[0].x).toBe(9);
  });

  it('protects an in-flight local edit from snap-back when its id is protected', () => {
    const local = [node('a', { x: 99 })];           // just edited locally
    const server = [node('a', { x: 0 })];           // host not updated yet
    expect(mergeById(local, server, new Set(['a']))[0].x).toBe(99); // protected → keep local
    expect(mergeById(local, server)[0].x).toBe(0);                  // unprotected → server wins
  });

  it('keeps a protected local-only create until the server has it', () => {
    expect(mergeById([node('new')], [], new Set(['new'])).map(n => n.id)).toEqual(['new']);
    expect(mergeById([node('new')], [])).toHaveLength(0);
  });
});
