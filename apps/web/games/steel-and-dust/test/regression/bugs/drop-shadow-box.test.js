import { describe, expect, it } from 'vitest';
import { FX_COLORS } from '../../../src/art/fx-colors.js';
import { COLORS } from '../../../src/art/colors.js';
import { GROUND_Y } from '../../../src/config.js';
import { DROP } from '../../../src/data/ambush.js';
import { drawDropMark } from '../../../src/render/fx/ambush-hazards.js';
import { drawnRects, recordingPainter } from '../../unit/render/fx/fx-recorder.js';

// Bug: the spot a raider drops on was marked as a boss's danger is, a flat red and pale bar six
// rows deep laid across the road from a row above it: a box floating over the grass and the
// slope, in no color the road has. It is a shadow now, on what each column of it falls on
const DANGER = new Set([COLORS.red, FX_COLORS.dangerLight, COLORS.outline]);
const DEEPEST = 4;
const slope = (x) => GROUND_Y - Math.round((x - 100) / 3);

function marked(fields) {
  const { painter, log } = recordingPainter();
  const mark = { x: 120, y: slope(120), raiderKind: 'grunt', raider: null, ...fields };

  drawDropMark(painter, mark, null, { floorAt: slope });

  return drawnRects(log);
}

describe('the spot a raider drops on', () => {
  it('is never marked in the red of a danger, as it waits nor as it comes down', () => {
    for (const fields of [
      { time: 20 },
      { time: DROP.warn - 2 },
      { time: 80, raider: { x: 120, y: 90 } },
    ]) {
      expect(marked(fields).some((rect) => DANGER.has(rect.color))).toBe(false);
    }
  });

  it('lies on the slope under it, never above what each column falls on nor deep below it', () => {
    for (const rect of marked({ time: DROP.warn - 2 })) {
      const floor = slope(rect.x);

      expect(rect.y >= floor && rect.y + rect.height <= floor + DEEPEST, `x ${rect.x}`).toBe(true);
    }
  });
});
