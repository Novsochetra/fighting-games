import { describe, expect, it } from 'vitest';
import { createPainter } from '../../../src/render/painter.js';
import { drawText, textWidth } from '../../../src/render/text/draw-text.js';
import { createRecordingContext, RecordingCanvas } from '../../support/recording-canvas.js';

function draw(value, options) {
  const { context, log } = createRecordingContext(null);
  drawText(createPainter(context), value, { x: 50, y: 10, color: 'gold', ...options });
  return log;
}

describe('bitmap text', () => {
  it('is 4 pixels a letter minus the last gap', () => {
    expect(textWidth('ABC', 1)).toBe(11);
    expect(textWidth('ABC', 2)).toBe(22);
  });

  it('draws a dark shadow first unless told not to', () => {
    expect(draw('A').filter((call) => call.startsWith('fillStyle'))).toEqual([
      'fillStyle=#140f1a',
      'fillStyle=gold',
    ]);
    expect(draw('A', { shadow: null }).filter((call) => call.startsWith('fillStyle'))).toEqual([
      'fillStyle=gold',
    ]);
  });

  it('centers and right-aligns on x', () => {
    const left = (log) =>
      Math.min(
        ...log
          .filter((call) => call.startsWith('fillRect'))
          .map((call) => Number(call.slice(9).split(',')[0])),
      );
    expect(left(draw('AB', { shadow: null }))).toBe(50);
    expect(left(draw('AB', { shadow: null, align: 'right' }))).toBe(43);
    expect(left(draw('AB', { shadow: null, align: 'center' }))).toBe(47);
  });

  it('lays a string down as two stamps, its shadow and its letters, cut once', () => {
    const { context, log } = createRecordingContext(null);
    const made = [];
    const createCanvas = () => {
      made.push(new RecordingCanvas());
      return made.at(-1);
    };
    const painter = createPainter(context, createCanvas);
    drawText(painter, 'AB', { x: 50, y: 10, color: 'gold', scale: 2 });
    drawText(painter, 'AB', { x: 50, y: 10, color: 'gold', scale: 2 });
    expect(made).toHaveLength(2);
    expect(log.some((call) => call.startsWith('fillRect('))).toBe(false);
    const laid = log.filter((call) => call.startsWith('drawImage('));
    expect(laid.map((call) => call.split(',').slice(-4).join(','))).toEqual([
      '52,12,14,10)',
      '50,10,14,10)',
      '52,12,14,10)',
      '50,10,14,10)',
    ]);
  });
});
