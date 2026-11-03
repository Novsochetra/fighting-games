import { describe, expect, it } from 'vitest';
import { COACH_MAP } from '../../../src/art/training/coach.js';
import { MANNEQUIN_MAP } from '../../../src/art/training/mannequin.js';
import { MEDITATOR } from '../../../src/art/training/meditator.js';
import { VIEW } from '../../../src/config.js';
import { SPRITES } from '../../../src/data/sprites.js';
import { standHeightOf } from '../../../src/render/actors/sheets.js';
import { spotOf } from '../../../src/render/training/cone-dribble/field.js';
import { GOAL_BOX } from '../../../src/render/training/cone-dribble/goal.js';
import { sidePropsIn } from '../../../src/render/training/cone-dribble/props.js';
import { coneMarkPlace } from '../../../src/render/training/cone-dribble/scene.js';
import { cameraOf, toScreen } from '../../../src/render/training/cone-dribble/view.js';
import { HUD_BOTTOM } from '../../../src/render/training/hud.js';
import { bannerTopOf } from '../../../src/render/training/index.js';
import { BANNER_HEIGHT } from '../../../src/render/training/marks.js';
import { ART } from '../../../src/render/training/pixels.js';
import { createDrill } from '../../../src/training/index.js';

// The drills' runner was redrawn from the 58 px footballer sheets, and much round him stayed at
// the size of the small block runner before him: a goal shorter than him, a coach and dummies
// half his size, READY and the score pops across his head and chest, a far chalk spot hidden
// behind its cone, and a dummy standing in the goal at the end of the longest course
const STAND = standHeightOf(SPRITES);
const CONE_HEIGHT = 12;
const POINTS_HEIGHT = 16;
const LEVELS = [1, 2, 3, 4];

const slalomAt = (level, phase = 'play') =>
  Object.assign(createDrill('cone-dribble', { seed: 7 + level, level }), { phase });

describe('the drills, drawn round the footballer', () => {
  it('stand the slalom’s goal a little taller than him and 1.5 to 1.8 times his height wide', () => {
    const width = GOAL_BOX.near - GOAL_BOX.far;

    expect(GOAL_BOX.height).toBeGreaterThan(STAND);
    expect(GOAL_BOX.height).toBeLessThan(STAND * 1.25);
    expect(width).toBeGreaterThanOrEqual(STAND * 1.5);
    expect(width).toBeLessThanOrEqual(STAND * 1.8);
  });

  it('stand the dummies about his height, and the coach and the meditator seated at his scale', () => {
    expect(MANNEQUIN_MAP.rows.length).toBeGreaterThan(STAND * 0.85);
    expect(MANNEQUIN_MAP.rows.length).toBeLessThan(STAND * 1.15);
    expect(COACH_MAP.rows.length).toBeGreaterThan(STAND * 0.7);
    expect(COACH_MAP.rows.length).toBeLessThan(STAND * 0.9);
    expect(MEDITATOR.rows.length).toBeGreaterThan(STAND * 0.6);
    expect(MEDITATOR.rows.length).toBeLessThan(STAND * 0.8);
  });

  it('keep READY, GO and the finish off the runner wherever he runs on the lane', () => {
    for (const phase of ['ready', 'finish']) {
      for (let y = 8; y <= 192; y += 4) {
        const state = slalomAt(1, phase);

        state.run.runner.y = y;

        const ground = toScreen(cameraOf(state), state.run.runner.x, y).y * ART;
        const top = bannerTopOf(state);
        const bottom = top + BANNER_HEIGHT;

        expect(bottom <= ground - STAND * ART || top >= ground).toBe(true);
        expect(top).toBeGreaterThanOrEqual(HUD_BOTTOM);
        expect(bottom).toBeLessThanOrEqual(VIEW.height);
      }
    }
  });

  it.each(LEVELS)('pop the slalom’s marks over his head as he passes a cone, level %i', (level) => {
    const state = slalomAt(level);
    const camera = cameraOf(state);

    for (const cone of state.run.course.cones) {
      const mark = coneMarkPlace(state, { x: cone.x, y: cone.y });

      for (const side of [-18, 18]) {
        const passing = toScreen(camera, cone.x, cone.y + side).y * ART;

        expect(mark.y + POINTS_HEIGHT).toBeLessThanOrEqual(passing - STAND * ART);
      }
    }
  });

  it.each(LEVELS)('chalk a far spot clear of its cone’s tip, level %i', (level) => {
    const state = slalomAt(level);
    const camera = cameraOf(state);

    for (const cone of state.run.course.cones) {
      const spot = spotOf(camera, cone);
      const base = toScreen(camera, cone.x, cone.y).y;

      if (cone.side === 'far') {
        expect(spot.y + 1).toBeLessThan(base - CONE_HEIGHT);
      } else {
        expect(spot.y).toBeGreaterThan(base);
      }
    }
  });

  it.each(LEVELS)('stand no prop where the goal stands, level %i', (level) => {
    const { goalX } = slalomAt(level).run.course;

    for (let camera = goalX - 600; camera <= goalX; camera += 10) {
      const goal = {
        left: toScreen(camera, goalX, GOAL_BOX.near).x,
        right: toScreen(camera, goalX + GOAL_BOX.depth, GOAL_BOX.far).x,
      };

      for (const { place } of sidePropsIn({ camera, goalX })) {
        expect(place.x + 34 < goal.left || place.x - 34 > goal.right).toBe(true);
      }
    }
  });
});
