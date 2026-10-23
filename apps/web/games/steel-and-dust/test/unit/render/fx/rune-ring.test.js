import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../../src/art/colors.js';
import { FX_COLORS } from '../../../../src/art/fx-colors.js';
import { PILLAR_BURNS } from '../../../../src/sim/hazards/gaze-pillars.js';
import { MARK_HURRY, isBlinking, isHurrying } from '../../../../src/render/fx/mark-blink.js';
import { burstRing, drawPillarFoot } from '../../../../src/render/fx/pillar-burst.js';
import {
  closingShare,
  drawRuneRing,
  isThrobbing,
  ringRadius,
} from '../../../../src/render/fx/rune-ring.js';
import { boundsOf, drawnRects, offGrid, recordingPainter } from './fx-recorder.js';

const WAIT = 28;
const pillarAt = (time) => ({ x: 120.3, y: 184, time, wait: WAIT });
const markTimes = Array.from({ length: WAIT }, (_, i) => i - WAIT);

function ringRects(time) {
  const { context, log } = recordingPainter();
  drawRuneRing(context, pillarAt(time));
  return drawnRects(log);
}

describe("a boss danger mark's blink", () => {
  it('hurries over its last ticks, blinking on and off every four', () => {
    expect(isHurrying(-MARK_HURRY - 1)).toBe(false);
    expect(isHurrying(-1)).toBe(true);
    const blinks = Array.from({ length: MARK_HURRY }, (_, i) => isBlinking(i - MARK_HURRY));
    expect(blinks).toContain(true);
    expect(blinks).toContain(false);
    expect(isBlinking(-20)).toBe(false);
  });
});

describe("the gaze's rune ring", () => {
  it('pops open to the width of the pillar in hard steps, then holds', () => {
    const radii = markTimes.map((time) => ringRadius(pillarAt(time)));
    expect(radii[0]).toBeLessThan(radii.at(-1));
    expect(radii.slice(10).every((radius) => radius === radii.at(-1))).toBe(true);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeGreaterThanOrEqual(radii[i - 1]);
    }
    expect(new Set(radii).size).toBeGreaterThan(4);
  });

  it('throbs on a beat while a ring of light closes in, quicker once it hurries', () => {
    const throbs = markTimes.map((time) => isThrobbing(WAIT + time));
    expect(throbs.filter(Boolean).length).toBeGreaterThan(4);
    expect(throbs.filter((throb) => !throb).length).toBeGreaterThan(10);
    const resets = (from, to) =>
      markTimes
        .filter((time) => time >= from && time < to)
        .filter((time) => closingShare(time, WAIT + time) === 1).length;
    expect(resets(-MARK_HURRY, 0)).toBeGreaterThan(resets(-WAIT, -MARK_HURRY));
  });

  it('lies flat on the road round the spot, on the screen-pixel grid', () => {
    for (const time of markTimes) {
      const rects = ringRects(time);
      expect(offGrid(rects)).toEqual([]);
      const { left, right, top, bottom } = boundsOf(rects.filter((rect) => !rect.light));
      expect((left + right) / 2).toBeCloseTo(120.5, 0);
      expect(right - left).toBeGreaterThan(bottom - top);
    }
    const open = boundsOf(ringRects(-10).filter((rect) => !rect.light));
    expect(open.right - open.left).toBeGreaterThan((open.bottom - open.top) * 2);
  });

  it('turns red on its blinks, and is gold otherwise', () => {
    const blinking = markTimes.find(isBlinking);
    const steady = markTimes.find((time) => time > -MARK_HURRY && !isBlinking(time));
    expect(ringRects(blinking).some((rect) => rect.color === COLORS.red)).toBe(true);
    expect(ringRects(steady).some((rect) => rect.color === COLORS.red)).toBe(false);
    expect(ringRects(-20).some((rect) => rect.color === FX_COLORS.gazeGold)).toBe(true);
  });
});

describe('the pillar bursting from the ring', () => {
  it('runs a shock ring out along the road that thins, cools and fades', () => {
    const rings = Array.from({ length: 10 }, (_, time) => burstRing(time));
    expect(rings[0]).toMatchObject({ color: COLORS.white, width: 2, alpha: 1 });
    expect(rings.at(-1).color).toBe(FX_COLORS.gazeEmber);
    expect(rings.at(-1).width).toBe(1);
    for (let i = 1; i < rings.length; i++) {
      expect(rings[i].radius).toBeGreaterThanOrEqual(rings[i - 1].radius);
      expect(rings[i].alpha).toBeLessThan(rings[i - 1].alpha);
    }
  });

  it('keeps the road at its foot lit while it burns, then goes dark', () => {
    const drawn = (time) => {
      const { context, log } = recordingPainter();
      drawPillarFoot(context, pillarAt(time));
      return drawnRects(log);
    };
    expect(drawn(PILLAR_BURNS[1]).length).toBeGreaterThan(0);
    expect(offGrid(drawn(3))).toEqual([]);
    expect(drawn(PILLAR_BURNS[1] + 10)).toEqual([]);
  });
});
