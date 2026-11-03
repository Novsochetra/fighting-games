import { describe, expect, it } from 'vitest';
import { MOVES } from '../../../../src/data/moves.js';
import { createActorArt } from '../../../../src/render/actors/index.js';
import { createCamera, updateCamera } from '../../../../src/render/camera.js';
import { drawFrame } from '../../../../src/render/draw-frame.js';
import { createEffects, updateEffects } from '../../../../src/render/effects/index.js';
import { planOf } from '../../../../src/render/effects/move-plan.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { attackingMatch } from '../actors/match-fixture.js';

const ART = createActorArt({ createCanvas: createPixelCanvas });

function tickWith(state, events = []) {
  const { match, camera, effects } = state;

  match.tick += 1;
  match.events = events;
  updateCamera(camera, match);
  updateEffects(effects, match, { camera });
  match.events = [];
}

// a frame drawn as the app draws it, every call kept
function framed(state) {
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 5 });
  context.globalAlpha = 1;
  drawFrame(context, state.match, state.camera, {
    effects: state.effects,
    actors: ART,
    createCanvas: createPixelCanvas,
  });

  return calls;
}

// the move as the sim plays it: a skill in the open, a special after its cut-in, the ball struck
// toward the goal (or carried, or met where the player stands)
function played(id) {
  const match = attackingMatch('11');
  const state = { match, camera: createCamera(match), effects: createEffects() };
  const striker = match.players[match.controlled];
  const isSpecial = MOVES[id].family !== 'role';

  Object.assign(match.ball, { owner: null, vx: 10, vy: -1, vz: 2, z: 6 });

  if (isSpecial) {
    match.phase = 'duel';
    tickWith(state, [{ type: 'special', player: striker.index, move: id, partner: 8 }]);
    match.phase = 'play';
  }

  tickWith(state, isSpecial ? [] : [{ type: 'skill', player: striker.index, move: id }]);

  return state;
}

const fly = (state, ticks) => {
  for (let i = 0; i < ticks; i += 1) {
    Object.assign(state.match.ball, { x: state.match.ball.x + 10, y: state.match.ball.y - 1 });
    Object.assign(state.match.players[state.match.controlled], {
      x: state.match.players[state.match.controlled].x + 3,
    });
    tickWith(state);
  }
};

const numbersOf = (calls) =>
  calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

const colourSet = (calls) =>
  new Set(calls.filter((call) => call.name === 'fillStyle').map((call) => call.args[0]));

describe.each(Object.keys(MOVES))('the %s on the pitch', (id) => {
  const plan = planOf(id);

  it('draws its aura, its trail and its impact in its look, with no NaN', () => {
    const state = played(id);
    const frames = [framed(state)];

    fly(state, 8);
    frames.push(framed(state));
    // a save skill meets the ball in its own keeper's hands, any other move in the other side's
    const keeper =
      plan.move.play === 'save'
        ? state.match.controlled
        : state.match.players.find((each) => each.team === 1).index;

    state.match.ball.owner = keeper;
    tickWith(state, [{ type: 'save', keeper, parried: false }]);
    fly(state, 3);
    frames.push(framed(state));

    const colours = colourSet(frames.flat());

    for (const calls of frames) {
      expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
    }

    expect(plan.art.body.some((colour) => colours.has(colour))).toBe(true);
    expect(state.effects.list.some((effect) => effect.kind === 'impact')).toBe(true);
  });
});
