import { describe, it, expect } from 'vitest';
import type { GloNode, NodeMedia } from '../types';
import {
  nodeObjectFor, NodeObject, NoteObject, MediaNodeObject,
  ImageObject, VideoObject, AudioObject, FileObject,
} from './graphObject';

function node(partial: Partial<GloNode>): GloNode {
  return {
    id: 'n', title: '', description: null, eventDate: null, dateAdded: '',
    x: 0, y: 0, color: null, confidence: null, impactMagnitude: null,
    tags: [], links: [], media: [], paramValues: [],
    ...partial,
  } as GloNode;
}

const media = (over: Partial<NodeMedia>): NodeMedia => ({
  id: 'm', nodeId: 'n', label: '', src: '', srcType: 'url', mediaType: 'image',
  sortOrder: 0, showOnCard: true, ...over,
});

describe('nodeObjectFor', () => {
  it('maps each kind to its object subclass', () => {
    expect(nodeObjectFor(node({ kind: 'standard' }))).toBeInstanceOf(NodeObject);
    expect(nodeObjectFor(node({}))).toBeInstanceOf(NodeObject); // missing kind → standard
    expect(nodeObjectFor(node({ kind: 'note' }))).toBeInstanceOf(NoteObject);
    expect(nodeObjectFor(node({ kind: 'image' }))).toBeInstanceOf(ImageObject);
    expect(nodeObjectFor(node({ kind: 'video' }))).toBeInstanceOf(VideoObject);
    expect(nodeObjectFor(node({ kind: 'audio' }))).toBeInstanceOf(AudioObject);
    expect(nodeObjectFor(node({ kind: 'file' }))).toBeInstanceOf(FileObject);
  });

  it('keeps every variant an instanceof NodeObject (uniform containment/bounds)', () => {
    for (const k of ['standard', 'note', 'image', 'video', 'audio', 'file'] as const) {
      expect(nodeObjectFor(node({ kind: k }))).toBeInstanceOf(NodeObject);
    }
    expect(nodeObjectFor(node({ kind: 'image' }))).toBeInstanceOf(MediaNodeObject);
  });

  it('exposes the right card layout per type', () => {
    expect(nodeObjectFor(node({ kind: 'standard' })).cardLayout()).toBe('standard');
    expect(nodeObjectFor(node({ kind: 'note' })).cardLayout()).toBe('text-first');
    expect(nodeObjectFor(node({ kind: 'image' })).cardLayout()).toBe('media-first');
    expect(nodeObjectFor(node({ kind: 'audio' })).cardLayout()).toBe('media-first');
    expect(nodeObjectFor(node({ kind: 'file' })).cardLayout()).toBe('file');
  });

  it('a file node exposes its file media as primary (mediaType file preferred)', () => {
    const n = node({ kind: 'file', media: [
      media({ id: 'img', mediaType: 'image' }), media({ id: 'doc', mediaType: 'file' }),
    ] });
    expect(nodeObjectFor(n).primaryMedia()?.id).toBe('doc');
  });

  it('media items expose their primary media (on-card preferred, else first)', () => {
    const n = node({
      kind: 'image',
      media: [media({ id: 'a', showOnCard: false }), media({ id: 'b', showOnCard: true })],
    });
    expect(nodeObjectFor(n).primaryMedia()?.id).toBe('b');

    const n2 = node({ kind: 'image', media: [media({ id: 'only', showOnCard: false })] });
    expect(nodeObjectFor(n2).primaryMedia()?.id).toBe('only');

    expect(nodeObjectFor(node({ kind: 'standard' })).primaryMedia()).toBeUndefined();
  });

  it('label() delegates to the untitled-aware display label', () => {
    expect(nodeObjectFor(node({ kind: 'note', title: 'Hi' })).label()).toBe('Hi');
    expect(nodeObjectFor(node({ kind: 'note', title: '' })).label()).toBe('Untitled note');
    expect(nodeObjectFor(node({ kind: 'image', title: '' })).label()).toBe('Untitled image');
  });
});
