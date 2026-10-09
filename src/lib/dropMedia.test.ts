import { describe, it, expect } from 'vitest';
import { mediaKindForExt, mediaKindForPath, extOf, baseNameOf } from './dropMedia';

describe('dropMedia', () => {
  it('maps extensions to media kinds', () => {
    expect(mediaKindForExt('png')).toBe('image');
    expect(mediaKindForExt('.JPG')).toBe('image');
    expect(mediaKindForExt('mp4')).toBe('video');
    expect(mediaKindForExt('mov')).toBe('video');
    expect(mediaKindForExt('mp3')).toBe('audio');
    expect(mediaKindForExt('flac')).toBe('audio');
    expect(mediaKindForExt('txt')).toBeNull();
    expect(mediaKindForExt('')).toBeNull();
  });

  it('detects kind from a Windows path', () => {
    expect(mediaKindForPath('C:\\Users\\me\\Pictures\\cat.PNG')).toBe('image');
    expect(mediaKindForPath('/home/me/clip.webm')).toBe('video');
    expect(mediaKindForPath('song')).toBeNull();
  });

  it('detects kind from a URL, ignoring query/hash', () => {
    expect(mediaKindForPath('https://x.com/a/b/photo.jpg?v=2#frag')).toBe('image');
    expect(mediaKindForPath('https://x.com/stream.m3u')).toBeNull();
    expect(mediaKindForPath('https://x.com/no-extension')).toBeNull();
  });

  it('extracts extension and basename', () => {
    expect(extOf('C:\\a\\b\\c.MP4')).toBe('MP4');
    expect(extOf('https://x.com/v/clip.mp4?t=1')).toBe('mp4');
    expect(baseNameOf('C:\\a\\b\\my file.png')).toBe('my file.png');
    expect(baseNameOf('https://x.com/a/My%20Pic.png')).toBe('My Pic.png');
  });
});
