import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { BALL_PALETTE } from '../../../src/art/duel/ball.js';
import { DIVE_INKS } from '../../../src/art/save-cam/keeper-dive/index.js';
import { SPRITES } from '../../../src/data/sprites.js';
import { createActorArt, loadSprites, looksOf } from '../../../src/render/actors/index.js';
import { keeperPose } from '../../../src/render/save-cam/keeper-pose.js';
import { BEATS, contactTick, playTicks } from '../../../src/render/save-cam/timing.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { decodePng } from '../../support/png.js';
import { drawnSaveCam, lineOf, pixelsIn } from '../../support/save-cam-pixels.js';

// The keeper's dive in the save cam did not look professional: the side-on `dive` sheet pasted
// into a front view, so he flew flat like a swimmer, arms straight out, his face in profile, no
// number to be seen and the ball a flash at his fingertips. He now dives toward the camera on a
// diagonal up to the corner, face and chest to us, both gloves round the ball.
const GAME = fileURLToPath(new URL('../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const SHEETS = createActorArt({
  sprites: await loadSprites(SPRITES, { loadImage }),
  createCanvas: createPixelCanvas,
});

const STRETCH = contactTick() + BEATS.hitStop + 5;
const GLOVES = ['G', 'H', 'I', 'J'].map((letter) => DIVE_INKS[letter]);
const BALL = [1, 2, 3, 4, 'p', 'q'].map((shade) => BALL_PALETTE[shade]);

const SAVES = [
  { side: 0.85, height: 0.9 },
  { side: -0.85, height: 0.9 },
  { side: 0.7, height: 0.75 },
  { side: -0.6, height: 0.8 },
];

// a high save to one side, as the match draws it, from the game's own sheets
function stretched(aim) {
  const match = fakeMatch({ seed: 4 });

  match.teams = [{ kit: 'cambodia' }, { kit: 'thailand' }];

  const moment = { shooter: 9, keeper: 0, move: 'naga-shot', result: 'saved', style: 'catch' };
  const drawn = drawnSaveCam(
    match,
    { ...moment, aim, dive: Math.sign(aim.side) },
    {
      ticks: STRETCH,
      actors: SHEETS,
    },
  );

  return {
    ...drawn,
    look: looksOf(match).players[0],
    pose: keeperPose(drawn.cam.moment, playTicks(STRETCH)),
  };
}

const around = ({ x, y }, radius) => ({
  x: x - radius,
  y: y - radius,
  width: radius * 2 + 1,
  height: radius * 2 + 1,
});

describe('the keeper dives at the camera on a diagonal, not flat and side-on', () => {
  it.each(SAVES.map((aim) => [JSON.stringify(aim), aim]))('a save at %s', (name, aim) => {
    const { colourAt, look, pose } = stretched(aim);
    const shirt = pixelsIn(colourAt, look.shirt);
    const line = lineOf(shirt);
    const box = {
      x: Math.min(...shirt.map((pixel) => pixel.x)),
      y: Math.min(...shirt.map((pixel) => pixel.y)) - 6,
      width: 0,
      height: 0,
    };

    box.width = Math.max(...shirt.map((pixel) => pixel.x)) - box.x + 1;
    box.height = Math.max(...shirt.map((pixel) => pixel.y)) - box.y + 1;

    const gloves = pixelsIn(colourAt, GLOVES, around(pose.gloves, 9));

    expect(pose.animation).toBe('front-dive');
    expect(Math.abs(line.rise)).toBeGreaterThan(25);
    expect(Math.sign(line.rise)).toBe(Math.sign(aim.side));
    expect(pixelsIn(colourAt, [DIVE_INKS.E], box).length).toBeGreaterThanOrEqual(2);
    expect(pixelsIn(colourAt, [look.numberColours.fill], box).length).toBeGreaterThanOrEqual(6);
    expect(pixelsIn(colourAt, BALL, around(pose.gloves, 3)).length).toBeGreaterThan(30);
    expect(gloves.some((pixel) => pixel.x < pose.gloves.x - 3)).toBe(true);
    expect(gloves.some((pixel) => pixel.x > pose.gloves.x + 3)).toBe(true);
  });
});
