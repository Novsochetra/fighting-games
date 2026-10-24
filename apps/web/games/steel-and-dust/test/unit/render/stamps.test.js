import { describe, expect, it } from 'vitest';
import { createPainter } from '../../../src/render/painter.js';
import { drawStamped } from '../../../src/render/stamps.js';
import { createRecordingContext, RecordingCanvas } from '../../support/recording-canvas.js';

function stampingPainter() {
  const made = [];
  const createCanvas = (width, height) => {
    const canvas = Object.assign(new RecordingCanvas(), { width, height });
    made.push(canvas);
    return canvas;
  };
  const { context, log } = createRecordingContext(null);
  return { painter: createPainter(context, createCanvas), log, made };
}

const square = (key, x = 4, y = 6) => ({
  key,
  x,
  y,
  width: 3,
  height: 2,
  draw: (context, left, top) => context.fillRect(left, top, 3, 2),
});

describe('stamps', () => {
  it('draws a drawing once and lays it down with one drawImage each time after', () => {
    const { painter, log, made } = stampingPainter();
    drawStamped(painter, square('a'));
    drawStamped(painter, square('a', 10, 12));
    expect(made).toHaveLength(1);
    expect(made[0].recording.log.filter((call) => call.startsWith('fillRect('))).toEqual([
      'fillRect(0,0,3,2)',
    ]);
    expect(log.filter((call) => call.startsWith('drawImage('))).toHaveLength(2);
    expect(log.at(-1)).toMatch(/,10,12,3,2\)$/);
    expect(log.some((call) => call.startsWith('fillRect('))).toBe(false);
  });

  it('cuts a stamp at the resolution asked and lays it back at its own size', () => {
    const { painter, log, made } = stampingPainter();
    drawStamped(painter, { ...square('sharp'), resolution: 2 });
    expect([made[0].width, made[0].height]).toEqual([6, 4]);
    expect(made[0].recording.log).toContain('setTransform(2,0,0,2,0,0)');
    expect(log.at(-1)).toMatch(/,4,6,3,2\)$/);
  });

  it('reuses its oldest canvas past the limit instead of making more', () => {
    const { painter, made } = stampingPainter();
    for (let i = 0; i < 400; i++) {
      drawStamped(painter, square(`score ${i}`));
    }
    expect(made.length).toBeLessThanOrEqual(128);
    expect(painter.stamps.cache.size).toBeLessThanOrEqual(128);
  });

  it('keeps a stamp drawn every frame while other ones come and go', () => {
    const { painter, made } = stampingPainter();
    drawStamped(painter, square('label'));
    const label = made[0];
    for (let i = 0; i < 400; i++) {
      drawStamped(painter, square('label'));
      drawStamped(painter, square(`score ${i}`));
    }
    expect(painter.stamps.cache.get('label')).toBe(label);
  });

  it('draws nothing for an empty drawing', () => {
    const { painter, log, made } = stampingPainter();
    drawStamped(painter, { ...square('empty'), width: 0 });
    expect(made).toHaveLength(0);
    expect(log).toEqual([]);
  });

  it('draws straight onto the context when the painter keeps no stamps', () => {
    const { context, log } = createRecordingContext(null);
    drawStamped(createPainter(context), square('a', 4, 6));
    expect(log).toEqual(['fillRect(4,6,3,2)']);
  });
});
