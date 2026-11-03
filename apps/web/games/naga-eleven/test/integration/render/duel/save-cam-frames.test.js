import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { LOOK_ART } from '../../../../src/art/duel/looks.js';
import { MOVES } from '../../../../src/data/moves.js';
import { SAVE_STYLES } from '../../../../src/data/skills.js';
import { createSaveCam, drawSaveCam } from '../../../../src/render/save-cam/index.js';
import { keeperPose } from '../../../../src/render/save-cam/keeper-pose.js';
import { contactTick, playTicks } from '../../../../src/render/save-cam/timing.js';
import { GUARD_LOOKS } from '../../../../src/render/save-cam/guards/index.js';
import { TRAIL_LOOKS } from '../../../../src/render/save-cam/trails/index.js';
import { SPRITES } from '../../../../src/data/sprites.js';
import { createActorArt, loadSprites } from '../../../../src/render/actors/index.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { decodePng } from '../../../support/png.js';
import { busyIn, painted, strictContext } from './strict-context.js';

const SHOTS = Object.values(MOVES).filter((move) => move.kind === 'shot');

// one shot for each look a shot is drawn in: the trail is the look's, whoever strikes it
const SHOT_LOOKS = [...new Map(SHOTS.map((move) => [move.look, move.id])).entries()];
const SAVES = Object.values(MOVES).filter((move) => move.kind === 'save');

const OUTCOMES = [
  { result: 'saved', aim: { side: 0.55, height: 0.7 }, dive: 1 },
  { result: 'saved', aim: { side: 0.05, height: 0.3 }, dive: 0 },
  { result: 'parried', style: 'punch', aim: { side: -0.6, height: 0.9 }, dive: -1 },
  { result: 'parried', style: 'catch', aim: { side: 0.6, height: 0.2 }, dive: 1 },
  { result: 'saved', style: 'wall', aim: { side: 0.1, height: 0.4 }, dive: 0 },
  { result: 'goal', aim: { side: -0.85, height: 0.6 }, dive: 1 },
  { result: 'goal', aim: { side: 0.1, height: 0.95 }, dive: 0 },
  { result: 'wide', aim: { side: 1.25, height: 0.5 }, dive: 1 },
  { result: 'post', aim: { side: -1, height: 0.4 }, dive: -1 },
];

const TICKS = [14, 30, 40, 52, 96];

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));

// the keeper from the game's own sheets, as the match draws him
const SHEETS = createActorArt({
  sprites: await loadSprites(SPRITES, {
    loadImage: async (path) => decodePng(readFileSync(GAME + path)),
  }),
  createCanvas: createPixelCanvas,
});

function drawAll(moment, { lang = 'en', actors = SHEETS, ticks: shown = TICKS } = {}) {
  const { canvas, context, bad } = strictContext();
  const cam = createSaveCam(
    fakeMatch({ seed: 2 }),
    { shooter: 4, keeper: 5, ...moment },
    { length: 96 },
  );

  for (const ticks of shown) {
    cam.ticks = ticks;
    drawSaveCam(context, cam, { lang, actors, tick: 300 + ticks });
  }

  return { canvas, bad, cam };
}

// a frame of the save cam is a few thousand rects through a checking proxy, and these draw hundreds
describe('the save cam, drawn', { timeout: 20000 }, () => {
  it('plays a plain shot into every result with no NaN', () => {
    for (const outcome of OUTCOMES) {
      expect(drawAll({ move: 'power-shot', ...outcome }).bad, outcome.result).toEqual([]);
    }
  });

  // each look meets three of the results, the looks between them meeting all of them
  it.each(SHOT_LOOKS.map((entry, i) => [...entry, i]))(
    'plays the %s look (%s) with no NaN',
    (look, move, i) => {
      for (const outcome of [0, 3, 6].map((step) => OUTCOMES[(i + step) % OUTCOMES.length])) {
        const { canvas, bad } = drawAll({ move, ...outcome }, { ticks: [24, 42, 60] });

        expect(bad, `${move} ${outcome.result}`).toEqual([]);
        expect(painted(canvas)).toBe(true);
      }
    },
  );

  it.each(SAVES.map((move) => move.id))(
    'answers with %s, in its own style, with no NaN',
    (guard) => {
      for (const result of ['saved', 'parried', 'goal']) {
        const { bad, cam } = drawAll(
          { move: 'naga-shot', guard, result },
          { lang: 'km', ticks: [30, 42, 70] },
        );

        expect(bad, `${guard} ${result}`).toEqual([]);
        expect(cam.moment.style).toBe(SAVE_STYLES[guard] ?? 'catch');
      }
    },
  );

  it('has a trail drawn from in front for every shot look and a figure for every save look', () => {
    for (const move of SHOTS) {
      expect(TRAIL_LOOKS, move.id).toContain(move.look);
      expect(LOOK_ART[move.look], move.id).toBeDefined();
    }

    for (const move of SAVES) {
      expect(GUARD_LOOKS, move.id).toContain(move.look);
    }
  });

  it('draws the keeper where his pose puts him, from the sheets or the block figure alike', () => {
    const { canvas, cam } = drawAll({
      move: 'power-shot',
      result: 'saved',
      aim: { side: 0, height: 0.4 },
      dive: 0,
    });

    cam.ticks = 6;
    drawSaveCam(canvas.getContext('2d'), cam, { tick: 6 });

    const pose = keeperPose(cam.moment, playTicks(6));

    expect(
      busyIn(canvas, { x: (pose.x - 6) * 3, y: (pose.y - 40) * 3, width: 36, height: 90 }),
    ).toBeGreaterThan(300);
  });

  it('flashes white at the contact, and only then', () => {
    const { canvas, context, cam } = {
      ...strictContext(),
      cam: createSaveCam(fakeMatch(), { keeper: 5, result: 'saved' }),
    };
    const brightness = (ticks) => {
      cam.ticks = ticks;
      drawSaveCam(context, cam, { tick: ticks });

      return canvas.data.reduce((sum, value, i) => (i % 4 === 3 ? sum : sum + value), 0);
    };

    expect(brightness(contactTick())).toBeGreaterThan(brightness(contactTick() - 4) * 1.5);
  });
});
