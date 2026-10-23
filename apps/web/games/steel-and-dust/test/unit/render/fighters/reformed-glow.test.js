import { afterEach, describe, expect, it, vi } from 'vitest';
import { ENEMY_TYPES } from '../../../../src/data/enemies/enemy-types.js';
import {
  drawGlowMotes,
  glowMotes,
  rimAlpha,
} from '../../../../src/render/fighters/reformed-glow.js';
import { drawnRects, offGrid, recordingPainter } from '../fx/fx-recorder.js';

const guardian = (facing = 1) => ({
  def: ENEMY_TYPES.guardian,
  scale: ENEMY_TYPES.guardian.scale,
  x: 200,
  y: 184,
  facing,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the reformed guardian's rim", () => {
  it('breathes in a few hard steps, round and round', () => {
    const levels = Array.from({ length: 96 }, (_, tick) => rimAlpha(tick));
    expect(new Set(levels).size).toBeLessThanOrEqual(4);
    expect(new Set(levels).size).toBeGreaterThan(2);
    expect(levels.slice(0, 48)).toEqual(levels.slice(48));
    expect(rimAlpha(0)).toBe(rimAlpha(7));
  });
});

describe('the gold motes rising off him', () => {
  const [behind, top, width] = ENEMY_TYPES.guardian.hurtShape;
  const scale = ENEMY_TYPES.guardian.scale;

  it('leave from his body and rise, each from a new spot every life', () => {
    const motes = Array.from({ length: 200 }, (_, tick) => glowMotes(guardian(), tick));
    for (const mote of motes.flat()) {
      expect(mote.x).toBeGreaterThanOrEqual(200 - behind * scale - 2);
      expect(mote.x).toBeLessThanOrEqual(200 + (width - behind) * scale + 2);
      expect(mote.y).toBeLessThanOrEqual(184);
      expect(mote.y).toBeGreaterThan(184 - top * scale - 40);
    }
    expect(motes[11][0].y).toBeLessThan(motes[10][0].y);
    expect(new Set(motes.map((frame) => Math.round(frame[0].x))).size).toBeGreaterThan(3);
  });

  it('turn with him, only their sway left the same', () => {
    const right = glowMotes(guardian(1), 30);
    const left = glowMotes(guardian(-1), 30);
    right.forEach((mote, i) => {
      expect(left[i].y).toBe(mote.y);
      expect(Math.abs(left[i].x - 200 + (mote.x - 200))).toBeLessThanOrEqual(3);
    });
    expect(right.some((mote, i) => Math.abs(mote.x - left[i].x) > 10)).toBe(true);
  });

  it('fade in and out in steps, and are drawn as light on the grid without Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    for (const mote of glowMotes(guardian(), 5)) {
      expect([0, 0.25, 0.5, 0.75, 1]).toContain(mote.alpha);
    }
    const { context, log } = recordingPainter();
    drawGlowMotes(context, guardian(), 40);
    const rects = drawnRects(log);
    expect(rects.length).toBeGreaterThan(0);
    expect(rects.every((rect) => rect.light)).toBe(true);
    expect(offGrid(rects)).toEqual([]);
    expect(random).not.toHaveBeenCalled();
  });
});
