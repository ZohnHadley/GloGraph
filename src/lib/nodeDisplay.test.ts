import { describe, it, expect } from 'vitest';
import { nodeDisplayLabel } from './nodeDisplay';

describe('nodeDisplayLabel', () => {
  it('uses the title when present (trimmed)', () => {
    expect(nodeDisplayLabel({ title: '  Fed Rate Hike  ' })).toBe('Fed Rate Hike');
  });

  it('falls back to a media label when the title is empty', () => {
    expect(nodeDisplayLabel({
      title: '',
      kind: 'image',
      media: [{ label: '' }, { label: '  chart.png ' }],
    })).toBe('chart.png');
  });

  it('falls back to the first non-empty description line', () => {
    expect(nodeDisplayLabel({
      title: '   ',
      description: '\n  first line  \nsecond line',
    })).toBe('first line');
  });

  it('truncates a long description fallback to 60 chars + ellipsis', () => {
    const long = 'x'.repeat(80);
    const out = nodeDisplayLabel({ title: null, description: long });
    expect(out).toBe('x'.repeat(60) + '…');
  });

  it('prefers media label over description', () => {
    expect(nodeDisplayLabel({
      title: '',
      media: [{ label: 'cover' }],
      description: 'some notes',
    })).toBe('cover');
  });

  it('falls back to "Untitled <kind>" when nothing else is available', () => {
    expect(nodeDisplayLabel({ kind: 'note' })).toBe('Untitled note');
    expect(nodeDisplayLabel({ title: '', kind: 'image' })).toBe('Untitled image');
    expect(nodeDisplayLabel({ kind: 'video' })).toBe('Untitled video');
    expect(nodeDisplayLabel({ kind: 'audio' })).toBe('Untitled audio');
    // standard / missing kind → generic "node"
    expect(nodeDisplayLabel({ kind: 'standard' })).toBe('Untitled node');
    expect(nodeDisplayLabel({})).toBe('Untitled node');
  });
});
