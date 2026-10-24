import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { drawBoxStamped } from '../../../src/render/hud/box-stamp.js';
import { createPainter } from '../../../src/render/painter.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';

function stampedPainter() {
  const screen = new RecordingCanvas();
  const made = [];
  const createCanvas = (width, height) => {
    const canvas = Object.assign(new RecordingCanvas(), { width, height });
    made.push(canvas);
    return canvas;
  };
  return { painter: createPainter(screen.getContext('2d'), createCanvas), screen, made };
}

const BOX = { x: 10, y: 20, width: 30, height: 12 };

function drawBox(painter, key, calls) {
  drawBoxStamped(painter, {
    key,
    box: BOX,
    ready: true,
    draw: (inner) => {
      calls.push(key);
      inner.use('#123456').rect(BOX.x, BOX.y, 4, 4);
    },
  });
}

describe('a stamped HUD box', () => {
  it('is drawn once for what it shows, then laid down with one drawImage a frame', () => {
    const { painter, screen, made } = stampedPainter();
    const calls = [];
    for (let frame = 0; frame < 5; frame++) {
      drawBox(painter, 'lives|3', calls);
    }
    expect(calls).toEqual(['lives|3']);
    expect(made).toHaveLength(1);
    const log = screen.recording.log;
    expect(log.filter((call) => call.startsWith('drawImage('))).toHaveLength(5);
    expect(log.every((call) => call.startsWith('drawImage('))).toBe(true);
  });

  it('is drawn again when what it shows changes, or once its art comes in', () => {
    const { painter } = stampedPainter();
    const calls = [];
    drawBox(painter, 'lives|3', calls);
    drawBox(painter, 'lives|2', calls);
    drawBox(painter, 'lives|2', calls);
    expect(calls).toEqual(['lives|3', 'lives|2']);
    drawBoxStamped(painter, {
      key: 'lives|2',
      box: BOX,
      ready: false,
      draw: () => calls.push('bare'),
    });
    expect(calls.at(-1)).toBe('bare');
  });

  it("keeps the box's own place: its parts land where they would without the stamp", () => {
    const { painter, made } = stampedPainter();
    drawBox(painter, 'place', []);
    const stampLog = made[0].recording.log;
    expect(made[0].width).toBe((BOX.width + 16) * RENDER_SCALE);
    expect(stampLog).toContain('translate(-2,-12)');
    expect(stampLog).toContain(`fillRect(${BOX.x},${BOX.y},4,4)`);
  });

  it('draws straight onto the screen where there are no stamps', () => {
    const screen = new RecordingCanvas();
    const painter = createPainter(screen.getContext('2d'), null);
    drawBox(painter, 'bare', []);
    expect(screen.recording.log).toContain(`fillRect(${BOX.x},${BOX.y},4,4)`);
  });
});
