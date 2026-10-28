import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../../src/art/colors.js';
import { GROUND_Y } from '../../../../src/config.js';
import { DROP } from '../../../../src/data/ambush.js';
import { loadFxSheets } from '../../../../src/render/fx/fx-sheets.js';
import { drawDropMark, drawMound } from '../../../../src/render/fx/ambush-hazards.js';
import { FakeImage } from '../../../support/fake-image.js';
import { RecordingCanvas } from '../../../support/recording-canvas.js';
import { drawnRects, recordingPainter } from './fx-recorder.js';

const SHEETS = loadFxSheets({
  createImage: () => new FakeImage(),
  createCanvas: (width, height) => Object.assign(new RecordingCanvas(), { width, height }),
  baseUrl: '',
});

function drawn(draw, shot) {
  const { painter, log } = recordingPainter();

  draw(painter, shot, SHEETS);

  return log;
}

const mark = (fields) => ({ x: 120, y: GROUND_Y, raider: null, ...fields });
const widest = (log) => Math.max(...drawnRects(log).map((rect) => rect.width));
const isRed = (log) => drawnRects(log).some((rect) => rect.color === COLORS.red);
const mound = (fields) => ({ x: 200, y: GROUND_Y, direction: 1, haltAt: 0, eruptAt: 0, ...fields });
const moundDrawnAt = (log) => log.find((entry) => entry.startsWith('translate('));

describe('the spot a raider drops on', () => {
  it('only gathers a shadow while the raider settles in the trees, widening as it waits', () => {
    const first = drawn(drawDropMark, mark({ time: 2 }));
    const later = drawn(drawDropMark, mark({ time: DROP.warn - DROP.markFrom - 1 }));

    expect(isRed(first) || isRed(later)).toBe(false);
    expect(widest(later)).toBeGreaterThan(widest(first));
  });

  it('is marked red as every danger is for its last ticks, and as the raider comes down', () => {
    const ready = drawn(drawDropMark, mark({ time: DROP.warn - DROP.markFrom }));
    const high = drawn(drawDropMark, mark({ time: 80, raider: { y: 10 } }));
    const low = drawn(drawDropMark, mark({ time: 90, raider: { y: GROUND_Y - 10 } }));

    expect([ready, high, low].every(isRed)).toBe(true);
    expect(widest(low)).toBeGreaterThan(widest(high));
  });
});

describe('a mound crawling under the sand', () => {
  it('is drawn from the mound strip, and nothing once it has burst', () => {
    expect(drawn(drawMound, mound({ time: 4 })).some((entry) => entry.includes('mound.png'))).toBe(
      true,
    );
    expect(drawn(drawMound, mound({ time: 60, eruptAt: 50 }))).toEqual([]);
  });

  it('shakes from side to side once it stops', () => {
    const crawling = [10, 12].map((time) => moundDrawnAt(drawn(drawMound, mound({ time }))));
    expect(crawling[0]).toBe(crawling[1]);
    const shaking = [10, 12].map((time) =>
      moundDrawnAt(drawn(drawMound, mound({ time, haltAt: 8 }))),
    );
    expect(shaking[0]).not.toBe(shaking[1]);
  });
});
