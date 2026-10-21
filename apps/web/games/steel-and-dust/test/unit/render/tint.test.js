import { describe, expect, it } from 'vitest';
import { createTintCache, frameSource, tintedFrame } from '../../../src/render/fighters/tint.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';

function countingCache() {
  const created = [];
  const cache = createTintCache((width, height) => {
    const canvas = Object.assign(new RecordingCanvas(), { width, height });
    created.push(canvas);
    return canvas;
  });
  return { cache, created };
}

const sheet = { recordingId: () => 'img(sheet.png)', width: 1024, height: 320 };
const frame = (sx, color) => ({
  image: sheet,
  key: 'walk',
  color,
  sx,
  sy: 0,
  width: 128,
  height: 80,
});

describe('tinted frames', () => {
  it('reads an untinted frame straight from the sheet', () => {
    const { cache, created } = countingCache();
    expect(frameSource(cache, frame(256, null))).toEqual({ image: sheet, sx: 256, sy: 0 });
    expect(created).toEqual([]);
  });

  it('paints a frame-sized copy in the color once and reuses it', () => {
    const { cache, created } = countingCache();
    const first = frameSource(cache, frame(128, '#ffffff'));
    const again = frameSource(cache, frame(128, '#ffffff'));
    expect(first).toEqual({ image: created[0], sx: 0, sy: 0 });
    expect(again.image).toBe(first.image);
    expect(created).toHaveLength(1);
    expect([created[0].width, created[0].height]).toEqual([128, 80]);
    const log = created[0].recording.log;
    expect(log).toContain('drawImage(img(sheet.png),128,0,128,80,0,0,128,80)');
    expect(log).toContain('fillStyle=#ffffff');
  });

  it('keeps another color or another frame apart', () => {
    const { cache } = countingCache();
    const white = tintedFrame(cache, frame(0, '#ffffff'));
    expect(tintedFrame(cache, frame(0, '#ffd36b'))).not.toBe(white);
    expect(tintedFrame(cache, frame(128, '#ffffff'))).not.toBe(white);
  });

  it("carves a copy that keeps the frame's own shading under the color, apart from the flat one", () => {
    const { cache, created } = countingCache();
    const flat = tintedFrame(cache, frame(0, '#c9a97e'));
    const carved = tintedFrame(cache, { ...frame(0, '#c9a97e'), relief: true });
    expect(carved).not.toBe(flat);
    expect(tintedFrame(cache, { ...frame(0, '#c9a97e'), relief: true })).toBe(carved);
    const log = created[1].recording.log;
    expect(log.slice(log.indexOf('globalCompositeOperation=color'))).toEqual([
      'globalCompositeOperation=color',
      'fillStyle=#c9a97e',
      'fillRect(0,0,128,80)',
      'globalCompositeOperation=destination-in',
      'drawImage(img(sheet.png),0,0,128,80,0,0,128,80)',
      'globalCompositeOperation=source-over',
    ]);
  });

  it('holds at most 64 copies, dropping the least recently used and reusing its canvas', () => {
    const { cache, created } = countingCache();
    const kept = tintedFrame(cache, frame(0, '#000001'));
    for (let i = 1; i < 300; i++) {
      tintedFrame(cache, frame(0, `#${String(i).padStart(6, '0')}`));
      tintedFrame(cache, frame(0, '#000001'));
    }
    expect(cache.frames.size).toBe(64);
    expect(created).toHaveLength(64);
    expect(tintedFrame(cache, frame(0, '#000001'))).toBe(kept);
  });
});
