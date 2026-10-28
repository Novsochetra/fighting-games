import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONVEYOR, beltLength } from '../../../src/data/conveyors.js';
import { FX_SCALE, FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { beltPieces, plateSlots, plateSpan } from '../../../src/render/scene/conveyor-pieces.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const art = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/conveyor.png'));
const { frameWidth } = FX_SPRITES.conveyor;
// each frame's columns of plates, clear of the drive gear (4) and the far end's drum (5), and two
// rows across them, one high on the plates and one low
const PLATE_COLUMNS = [
  [5, 77],
  [5, 77],
  [5, 77],
  [5, 77],
  [36, 78],
  [10, 56],
];
const HIGH_ROW = 9;
// a light plate and the dark one after it, and the rows of the band of plates
const PAIR = 24;
const BAND = { top: 5, bottom: 19 };
const LOW_ROW = 15;
const MOST_LEAN = 8;

const pale = (frame, x, y) => {
  const at = frame * frameWidth + x;

  return art.alpha(at, y) > 0 && art.rgb(at, y).reduce((sum, value) => sum + value) > 330;
};

// how far along the pale plates have moved from the high row to the low: the way they lean
function leanOf(frame) {
  const [from, to] = PLATE_COLUMNS[frame];
  let best = { shift: 0, matched: -1 };
  for (let shift = -MOST_LEAN; shift <= MOST_LEAN; shift++) {
    let matched = 0;
    for (let x = from; x < to - Math.abs(shift); x++) {
      const along = x + Math.max(0, shift) - Math.max(0, -shift);
      matched += pale(frame, x, HIGH_ROW) && pale(frame, along, LOW_ROW) ? 1 : 0;
    }
    best = matched > best.matched ? { shift, matched } : best;
  }

  return best.shift;
}

const BELT = { from: 100, to: 100 + beltLength(3), y: 184, direction: 1, segments: 3 };
// the ticks the belt takes to run one segment on
const ONE_SEGMENT = CONVEYOR.segment / CONVEYOR.speed;

describe('a conveyor belt as drawn', () => {
  it('lays the far end by the mouth, its segments one after another, then the drive end', () => {
    const pieces = beltPieces(BELT);
    const backs = pieces.map((piece) => piece.back);

    expect(pieces.map((piece) => piece.frame)).toEqual([5, 0, 1, 2, 4]);
    for (let i = 2; i < backs.length; i++) {
      expect(backs[i] - backs[i - 1]).toBe(CONVEYOR.segment);
    }
    expect(backs[0]).toBeLessThan(backs[1] - CONVEYOR.segment / 2);
  });

  it('carries along its whole drawn length, from the drive wheel to the far end', () => {
    const drive = beltPieces(BELT).at(-1);
    const length = BELT.to - BELT.from;

    expect(length).toBeGreaterThan(drive.back);
    expect(length).toBeLessThan(drive.back + CONVEYOR.segment / 2);
  });

  it('runs its plates on toward the mouth at the pace it carries', () => {
    const [first] = plateSlots(BELT, 0);
    const [moved] = plateSlots(BELT, 10);

    expect(first.back - moved.back).toBeCloseTo(10 * CONVEYOR.speed);
  });

  it('runs on seamlessly: one segment on, each place shows the plates the one above it showed', () => {
    const before = plateSlots(BELT, 0);
    const after = plateSlots(BELT, ONE_SEGMENT);

    expect(after.map((slot) => slot.back)).toEqual(before.map((slot) => slot.back));
    expect(after.slice(0, -1).map((slot) => slot.frame)).toEqual(
      before.slice(1).map((slot) => slot.frame),
    );
  });

  it('shows the moving plates over every segment and no further', () => {
    const { near, far } = plateSpan(BELT);
    const segments = beltPieces(BELT).slice(1, -1);

    expect(near).toBe(segments[0].back - CONVEYOR.segment / 2);
    expect(far).toBe(segments.at(-1).back + CONVEYOR.segment / 2);
  });

  it('leans every plate at the same angle, along the segments as over the drive and far ends', () => {
    const leans = PLATE_COLUMNS.map((_, frame) => leanOf(frame));

    expect(leans[0]).toBeGreaterThanOrEqual(2);
    expect(new Set(leans).size).toBe(1);
  });

  it('gives every plate the same shape: one pair of plates over and over, from every anchor', () => {
    const [from, to] = PLATE_COLUMNS[0];

    expect((CONVEYOR.segment / FX_SCALE) % PAIR).toBe(0);
    for (let frame = 0; frame < 4; frame++) {
      for (let x = from; x < to - PAIR; x++) {
        for (let y = BAND.top; y <= BAND.bottom; y++) {
          const at = frame * frameWidth + x;
          expect(art.colorKey(at, y), `frame ${frame} at ${x},${y}`).toBe(
            art.colorKey(x + PAIR, y),
          );
        }
      }
    }
  });
});
