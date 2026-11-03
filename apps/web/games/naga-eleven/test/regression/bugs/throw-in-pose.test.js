import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPRITE_KIT } from '../../../src/art/sprite-kit.js';
import { SPRITES } from '../../../src/data/sprites.js';
import { WORLD_VIEW } from '../../../src/config.js';
import { actorDrawables, createActorArt, loadSprites } from '../../../src/render/actors/index.js';
import { animationOf } from '../../../src/render/actors/animation.js';
import { startsOf } from '../../../src/render/actors/memory.js';
import { isHoldingThrow } from '../../../src/render/actors/throw-in.js';
import { createCamera, project, updateCamera } from '../../../src/render/camera.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { decodePng } from '../../support/png.js';

// A throw-in looked unfinished: the taker stood idle with his arms down, by the near touchline
// facing the camera, out of the pitch, the ball floating over his hair; by the far one the ball
// was drawn flat on his chest. He now holds it over his head in both hands, facing into the
// pitch, and throws it with his arms coming forward.
const GAME = fileURLToPath(new URL('../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const sprites = await loadSprites(SPRITES, { loadImage });
const SPRITE = 58;
const SKIN = new Set(SPRITE_KIT.skin);

function step(match, camera) {
  tick(match);
  updateCamera(camera, match);
  drainEvents(match);
}

// the ball put out over a touchline by the computer's side, the throw seen held, then thrown
function throwIn(side) {
  const match = createMatch({ seed: 5, format: '11', halfSeconds: 60 });
  const camera = createCamera(match);
  const art = createActorArt({ sprites, createCanvas: createPixelCanvas });
  const seen = { held: null, thrown: [] };

  while (match.tick < 400 || match.phase !== 'play') {
    step(match, camera);
  }

  Object.assign(match.ball, { owner: null, kick: null, vx: 0, vy: 0, vz: 0, z: 0 });
  Object.assign(match.ball, { x: 900, y: side === 'near' ? match.pitch.width + 6 : -6 });
  match.ball.lastTouch = match.players.find((player) => player.team === 1).index;

  for (let i = 0; i < 900 && seen.thrown.length < 6; i += 1) {
    step(match, camera);
    seen.held ??= match.players.find((player) => isHoldingThrow(match, player)) ?? null;
    watchThrower(seen, { match, camera, art });
  }

  return seen;
}

function watchThrower(seen, { match, camera, art }) {
  const taker = seen.held;

  if (!taker) {
    return;
  }

  const starts = startsOf(art.memory, match, taker);
  const state = animationOf(taker, match, { scoringTeam: null, starts, kick: art.kick });

  if (isHoldingThrow(match, taker)) {
    seen.pose = state;
    seen.ball = ballDrawnAt({ match, camera, art });
    seen.foot = project(camera, taker.x, taker.y);
  } else {
    seen.thrown.push(state);
  }
}

// where the frame's one ball lands: the middle of what the ball's drawable paints
function ballDrawnAt({ match, camera, art }) {
  const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);
  const ball = actorDrawables(match, camera, { art, scoringTeam: null }).at(-1);
  const painted = [];

  ball.draw(canvas.getContext('2d'));

  for (let at = 0; at < canvas.data.length; at += 4) {
    if (canvas.data[at + 3] > 0) {
      painted.push({ x: (at / 4) % canvas.width, y: Math.floor(at / 4 / canvas.width) });
    }
  }

  const middle = (key) => painted.reduce((sum, point) => sum + point[key], 0) / painted.length;

  return { x: middle('x'), y: middle('y') };
}

describe.each([
  ['near', 'north'],
  ['far', 'south'],
])('a throw-in by the %s touchline', (side, intoPitch) => {
  const seen = throwIn(side);

  it('is held over the head in both hands, the taker facing into the pitch', () => {
    expect(seen.pose).toMatchObject({ name: 'throw', age: 0, direction: intoPitch });
    expect(Math.abs(seen.ball.x - seen.foot.x)).toBeLessThan(3);
    expect(seen.ball.y).toBeLessThan(seen.foot.y - SPRITE);
  });

  it('is thrown with the arms coming forward', () => {
    expect(seen.thrown[0]).toMatchObject({ name: 'throw', age: 1, direction: intoPitch });
  });
});

describe('the throw-in pose', () => {
  it('is drawn from the sheets, arms raised over the head in the sheets’ skin', () => {
    const art = createActorArt({ sprites, createCanvas: createPixelCanvas });
    const sheet = art.images.throw;
    const { frame, anchor } = art.manifest.animations.throw;
    const overHead = [];

    for (let row = 0; row < 2; row += 1) {
      for (let y = row * frame.height; y < row * frame.height + anchor.y - SPRITE; y += 1) {
        for (let x = 0; x < frame.width; x += 1) {
          const at = (y * sheet.width + x) * 4;
          const hex = `#${[0, 1, 2].map((i) => sheet.data[at + i].toString(16).padStart(2, '0')).join('')}`;

          overHead.push(sheet.data[at + 3] > 0 && SKIN.has(hex));
        }
      }
    }

    expect(overHead.filter(Boolean).length).toBeGreaterThan(20);
  });
});
