import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../../src/art/colors.js';
import { FX_COLORS } from '../../../../src/art/fx-colors.js';
import { GUARDIAN_MOVES } from '../../../../src/data/enemies/moves/guardian-moves.js';
import { crackPath, openCrack } from '../../../../src/render/fx/crack-path.js';
import { isBlinking } from '../../../../src/render/fx/mark-blink.js';
import { crackOpen, drawRootCrack, wallWidth } from '../../../../src/render/fx/root-crack.js';
import { boundsOf, drawnRects, offGrid, recordingPainter } from './fx-recorder.js';

const MARK_TICKS = GUARDIAN_MOVES.figRoots.roots.underHero;
const markTimes = Array.from({ length: MARK_TICKS }, (_, i) => i - MARK_TICKS);
const rootAt = (time) => ({ x: 90, y: 184, time, marked: true });

function crackRects(time) {
  const { context, log } = recordingPainter();
  drawRootCrack(context, rootAt(time));
  return drawnRects(log);
}

describe("a crack's path", () => {
  const path = crackPath(90);

  it('is the same for the same seed and another for another', () => {
    expect(crackPath(90)).toEqual(path);
    expect(crackPath(91)).not.toEqual(path);
  });

  it('runs out both ways from its heart, wandering about the surface, with forks running down', () => {
    const ends = path.map((segment) => segment.to.x);
    expect(Math.min(...ends)).toBeLessThan(-18);
    expect(Math.max(...ends)).toBeGreaterThan(18);
    const main = path.filter((segment) => !segment.fork);
    expect(new Set(main.map((segment) => segment.to.y)).size).toBeGreaterThan(2);
    const forks = path.filter((segment) => segment.fork);
    expect(forks.length).toBeGreaterThanOrEqual(4);
    expect(forks.every((segment) => segment.to.y > segment.from.y)).toBe(true);
  });

  it('opens out from its heart, cutting the stretch still running where its end has got to', () => {
    const near = openCrack(path, 4);
    expect(near.length).toBeLessThan(openCrack(path, 12).length);
    expect(near.every((segment) => segment.start < 4)).toBe(true);
    const running = near.filter((segment) => segment.running);
    expect(running.length).toBeGreaterThan(0);
    for (const segment of running) {
      expect(Math.abs(segment.to.x)).toBeLessThanOrEqual(4.01);
    }
    expect(openCrack(path, 100).some((segment) => segment.running)).toBe(false);
  });
});

describe("the fig root's crack in the road", () => {
  it('runs out over most of the wait, then holds', () => {
    const opens = markTimes.map(crackOpen);
    for (let i = 1; i < opens.length; i++) {
      expect(opens[i]).toBeGreaterThanOrEqual(opens[i - 1]);
    }
    expect(opens[0]).toBeLessThan(4);
    expect(opens.at(-1)).toBeGreaterThan(20);
  });

  it('is widest at its heart and thins to a hairline at its ends and forks', () => {
    expect(wallWidth({ start: 0 })).toBe(3);
    expect(wallWidth({ start: 8 })).toBe(2);
    expect(wallWidth({ start: 16 })).toBe(1);
    expect(wallWidth({ start: 8, fork: true })).toBe(1);
  });

  it('draws dark walls round a seam of gold, on the screen-pixel grid', () => {
    for (const time of markTimes) {
      const rects = crackRects(time);
      expect(offGrid(rects)).toEqual([]);
      expect(rects.some((rect) => rect.color === FX_COLORS.rootCrack)).toBe(true);
    }
    const open = crackRects(-20);
    expect(open.some((rect) => rect.color === FX_COLORS.gazeGold && !rect.light)).toBe(true);
    const { left, right } = boundsOf(open);
    expect(right - left).toBeGreaterThan(36);
  });

  it('blinks its seam red over its last ticks, and pours light up out of it only then', () => {
    const blinking = markTimes.find(isBlinking);
    expect(crackRects(blinking).some((rect) => rect.color === COLORS.red)).toBe(true);
    const shafts = (time) =>
      crackRects(time).filter((rect) => rect.color === FX_COLORS.gazeWhite && rect.height > 2);
    expect(shafts(-30)).toEqual([]);
    expect(shafts(-2).length).toBe(3);
  });
});
