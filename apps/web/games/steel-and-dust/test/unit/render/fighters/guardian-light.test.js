import { afterEach, describe, expect, it, vi } from 'vitest';
import { FX_COLORS } from '../../../../src/art/fx-colors.js';
import { GUARDIAN_MOVES } from '../../../../src/data/enemies/moves/guardian-moves.js';
import { ENEMY_TYPES } from '../../../../src/data/enemies/enemy-types.js';
import {
  drawFootfall,
  footfallPuff,
  isStomping,
} from '../../../../src/render/fighters/footfall.js';
import {
  drawReformBacklight,
  drawReformFlare,
  gatherHeart,
  gatherMotes,
  reformPhase,
} from '../../../../src/render/fighters/reform-light.js';
import { CHEST } from '../../../../src/sim/bosses/crumble.js';
import { bodyPoint } from '../../../../src/sim/fighters/body-point.js';
import { boundsOf, drawnRects, offGrid, recordingPainter } from '../fx/fx-recorder.js';

const crumble = GUARDIAN_MOVES.crumble;

const guardian = (overrides = {}) => ({
  def: ENEMY_TYPES.guardian,
  scale: ENEMY_TYPES.guardian.scale,
  x: 200,
  y: 184,
  vx: -0.55,
  facing: -1,
  state: 'walk',
  ai: { stride: 48 + 3 },
  ...overrides,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the colossus's footfall", () => {
  it('shows for a few ticks after each step lands, only while he walks', () => {
    expect(isStomping(guardian())).toBe(true);
    expect(isStomping(guardian({ ai: { stride: 48 + 20 } }))).toBe(false);
    expect(isStomping(guardian({ ai: { stride: 10 } }))).toBe(false);
    expect(isStomping(guardian({ state: 'attack' }))).toBe(false);
    expect(isStomping(guardian({ ai: {} }))).toBe(false);
  });

  it('rolls its dust out along the road, growing and thinning in steps', () => {
    const puffs = Array.from({ length: 12 }, (_, since) => footfallPuff(since));
    for (let i = 1; i < puffs.length; i++) {
      expect(puffs[i].spread).toBeGreaterThanOrEqual(puffs[i - 1].spread);
      expect(puffs[i].radius).toBeGreaterThanOrEqual(puffs[i - 1].radius);
      expect(puffs[i].alpha).toBeLessThanOrEqual(puffs[i - 1].alpha);
    }
    expect(puffs.at(-1).radius).toBeGreaterThan(puffs[0].radius * 2);
    expect(new Set(puffs.map((puff) => puff.alpha)).size).toBe(4);
  });

  it('puffs either side of the foot on the screen-pixel grid, and flashes gold once he glows', () => {
    const rects = (fighter) => {
      const { context, log } = recordingPainter();
      drawFootfall(context, { fighter, floor: 184 });
      return drawnRects(log);
    };
    const plain = rects(guardian());
    expect(offGrid(plain)).toEqual([]);
    const { left, right, bottom } = boundsOf(plain);
    const foot = 200 - 12 * ENEMY_TYPES.guardian.scale + 0.55 * 3;
    expect(left).toBeLessThan(foot - 4);
    expect(right).toBeGreaterThan(foot + 4);
    expect(bottom).toBeLessThanOrEqual(185);
    expect(plain.some((rect) => rect.color === FX_COLORS.gazeGold)).toBe(false);
    const glowing = rects(guardian({ glowing: true }));
    expect(glowing.some((rect) => rect.color === FX_COLORS.gazeGold)).toBe(true);
  });
});

describe('the light of his reforming', () => {
  const reforming = (moveTime) => guardian({ state: 'attack', move: crumble, moveTime });

  it('gathers before he reforms and bursts after, and is dark otherwise', () => {
    expect(reformPhase(reforming(crumble.reformAt - 40))).toBe(null);
    expect(reformPhase(reforming(crumble.reformAt - 10))).toBeLessThan(0);
    expect(reformPhase(reforming(crumble.reformAt))).toBe(0);
    expect(reformPhase(reforming(crumble.reformAt + 8))).toBeGreaterThan(0);
    expect(reformPhase(reforming(crumble.reformAt + 40))).toBe(null);
    expect(reformPhase(guardian({ moveTime: crumble.reformAt }))).toBe(null);
  });

  it('rises from low in the rubble to his heart, drawing motes in to it', () => {
    const fighter = reforming(crumble.reformAt - 10);
    const chest = bodyPoint(fighter, CHEST);
    expect(gatherHeart(fighter, -0.99).y).toBeGreaterThan(chest.y + 20);
    expect(Math.abs(gatherHeart(fighter, -0.01).y - chest.y)).toBeLessThan(1);
    const heart = gatherHeart(fighter, -0.5);
    const distance = (mote) => Math.hypot(mote.x - heart.x, mote.y - heart.y);
    const now = gatherMotes(heart, -0.5, 0).map(distance);
    const later = gatherMotes(heart, -0.48, 1).map(distance);
    expect(later[0]).toBeLessThan(now[0]);
  });

  it('draws on the screen-pixel grid without Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    for (const moveTime of [crumble.reformAt - 20, crumble.reformAt, crumble.reformAt + 6]) {
      const fighter = reforming(moveTime);
      const phase = reformPhase(fighter);
      const { context, log } = recordingPainter();
      drawReformBacklight(context, { fighter, floor: 184, phase });
      drawReformFlare(context, { fighter, phase });
      expect(drawnRects(log).length).toBeGreaterThan(0);
      expect(offGrid(drawnRects(log))).toEqual([]);
    }
    expect(random).not.toHaveBeenCalled();
  });
});
