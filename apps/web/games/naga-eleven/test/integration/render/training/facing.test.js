import { describe, expect, it } from 'vitest';
import { createActorArt, loadSprites } from '../../../../src/render/actors/index.js';
import { directionOf, rowFor } from '../../../../src/render/actors/directions.js';
import { drawDrill } from '../../../../src/render/training/index.js';
import { createDrill, updateDrill } from '../../../../src/training/index.js';
import { fakeImageLoader, FAKE_SPRITES } from '../../../support/fake-sprites.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { BOTS, NOTHING } from '../../training/support/drill-bots.js';

const PASS = { held: {}, pressed: { pass: true } };
const sprites = await loadSprites(FAKE_SPRITES, fakeImageLoader());
const art = createActorArt({ sprites, createCanvas: null });
const nameOfSheet = new Map(Object.entries(sprites.images).map(([name, image]) => [image, name]));

// the sheet, row and mirroring Sochetra was drawn from, read back off the calls the frame made;
// the context measures words, as the cards over the drill need
function drawnFrame(state) {
  const { context, calls } = createRecordingContext();

  context.globalAlpha = 1;
  context.measureText = (text) => ({ width: [...text].length * 12 });
  drawDrill(context, state, { lang: 'en', tick: state.tick, actors: art });

  const at = calls.findIndex((call) => call.name === 'drawImage' && nameOfSheet.has(call.args[0]));
  const before = calls[at - 1];

  return at < 0
    ? null
    : {
        name: nameOfSheet.get(calls[at].args[0]),
        row: calls[at].args[2] / FAKE_SPRITES.frame.height,
        mirror: before.name === 'scale' && before.args[0] < 0,
      };
}

function expectedFrame(name, direction) {
  const { row, mirror } = rowFor(FAKE_SPRITES.animations[name].rows, direction);

  return { name, row, mirror };
}

// steps a drill by its bot, through its intro, until the check says when
function playUntil(drill, when, { level = 2 } = {}) {
  const state = createDrill(drill, { seed: 21, level });
  const bot = BOTS[drill]();

  for (let i = 0; i < 30000 && !when(state); i += 1) {
    updateDrill(state, state.phase === 'play' ? bot(state) : PASS);
  }

  return state;
}

describe('Sochetra in the cone slalom', () => {
  it('faces and runs the way he moves: right, and three-quarters on as he weaves', () => {
    const state = playUntil('cone-dribble', (each) => each.phase === 'play');
    const bot = BOTS['cone-dribble']();
    const seen = new Set();

    for (let i = 0; i < 6000 && state.phase === 'play'; i += 1) {
      updateDrill(state, bot(state));

      const { vx, vy } = state.run.runner;

      if (state.phase === 'play' && i % 4 === 0 && Math.sqrt(vx * vx + vy * vy) > 0.5) {
        const way = directionOf({ x: vx, y: vy });

        seen.add(way);
        expect(drawnFrame(state)).toEqual(expectedFrame('run', way));
      }
    }

    expect([...seen]).toEqual(expect.arrayContaining(['east', 'north-east', 'south-east']));
  });

  it('stands facing down the lane at the start, and facing the net after the finish', () => {
    const ready = playUntil('cone-dribble', (each) => each.phase === 'ready');
    const result = playUntil('cone-dribble', (each) => each.phase === 'result');

    expect(drawnFrame(ready)).toEqual(expectedFrame('idle', 'east'));
    expect(result.run.finished).toBe(true);
    expect(drawnFrame(result)).toEqual(expectedFrame('idle', 'east'));
  });

  it('strikes the ball into the net as he crosses the line', () => {
    const state = playUntil('cone-dribble', (each) => each.phase === 'finish');

    expect(drawnFrame(state)).toEqual(expectedFrame('kick', 'east'));
  });
});

describe('Sochetra in the target shot', () => {
  it('stands facing the goal while he aims', () => {
    const state = playUntil('target-shot', (each) => each.phase === 'play');

    updateDrill(state, NOTHING);

    expect(drawnFrame(state)).toEqual(expectedFrame('idle', 'north'));
  });

  it('jogs three-quarters toward the way the run carries him', () => {
    const state = playUntil(
      'target-shot',
      (each) => each.run.shot >= 4 && each.run.stage === 'aim',
    );
    const way = state.run.spot.dir > 0 ? 'north-east' : 'north-west';

    expect(drawnFrame(state)).toEqual(expectedFrame('run', way));
  });
});
