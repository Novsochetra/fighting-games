import { describe, expect, it } from 'vitest';

import { CINEMA } from '../../../../src/data/cinema.js';
import { MOVES } from '../../../../src/data/moves.js';
import { drawDuelShow } from '../../../../src/render/duel/draw-show.js';
import { createDuelShow, isShowDone } from '../../../../src/render/duel/show.js';
import { STAGE_TICKS } from '../../../../src/render/duel/stages.js';
import { updateDuelShow } from '../../../../src/render/duel/timeline.js';
import { decidedClash } from '../../../support/clash-frames.js';
import { fakeMatch, forwardOn, giveBall, keeperOn } from '../../../support/duel-fixtures.js';
import { painted, strictContext } from './strict-context.js';

// a star lets go of his shot special at a keeper with his own skill to answer it
function shotShow(move, cinema) {
  const match = fakeMatch({ seed: 3, humanTeam: null });
  const shooter = Object.assign(forwardOn(match, 0), {
    star: 'sochetra',
    x: 850,
    moves: [move],
    spirit: 200,
  });

  Object.assign(match.players[3], { star: 'rithy', x: 820, spirit: 200 });
  Object.assign(keeperOn(match, 1), { star: 'farhad', moves: ['mountain-guard'], spirit: 200 });
  giveBall(match, shooter);
  match.hooks.special(match, shooter);

  return createDuelShow(match, { heroAge: 'young', cinema });
}

function noteStage(stages, show) {
  const isNew = stages.at(-1)?.stage !== show.stage;

  if (isNew) {
    stages.push({ stage: show.stage, ticks: 0 });
  }

  stages.at(-1).ticks += 1;

  return isNew;
}

function stepShow(show, pass) {
  updateDuelShow(show, { pressed: { pass } });

  if (show.match.duel) {
    show.match.hooks.duelTick(show.match);
  }
}

// the show played out, drawn every few frames and as each stage starts: the stages in the order
// they came, how long each ran and anything drawn that was not a number
function playShow(show, { press = () => false, every = 7 } = {}) {
  const { canvas, context, bad } = strictContext();
  const stages = [];

  for (let i = 0; i < 3000 && !isShowDone(show); i += 1) {
    stepShow(show, press(show));

    if (noteStage(stages, show) || i % every === 0) {
      drawDuelShow(context, show, { lang: i % 2 ? 'km' : 'en', tick: i });
    }
  }

  return { stages, names: stages.map((entry) => entry.stage), canvas, bad };
}

const STAR_SHOTS = Object.values(MOVES)
  .filter((move) => move.kind === 'shot' && move.family === 'star')
  .map((move) => move.id);

describe('the cinematic camera in a duel', { timeout: 30000 }, () => {
  it.each(STAR_SHOTS)('rides %s to the goal between the two cut-ins', (move) => {
    const { names, stages, canvas, bad } = playShow(shotShow(move, 'full'));
    const chase = names.indexOf('chase');

    expect(bad).toEqual([]);
    expect(painted(canvas)).toBe(true);
    expect(names.slice(0, chase)).toEqual(['intro', 'versus', 'wait', 'cutin']);
    expect(['cutin', 'saveCam']).toContain(names[chase + 1]);
    expect(names).toContain('saveCam');
    expect(stages[chase].ticks).toBe(CINEMA.chase.ticks);
  });

  it('lets a press past the first moments cut the chase short', () => {
    const { stages, names } = playShow(shotShow('naga-shot', 'full'), {
      press: (show) => show.stage === 'chase',
      every: 1000,
    });

    expect(stages[names.indexOf('chase')].ticks).toBe(CINEMA.chase.skipAfter + 1);
  });

  it('adds no chase where the camera adds no time', () => {
    for (const cinema of ['short', 'off']) {
      expect(playShow(shotShow('naga-shot', cinema), { every: 1000 }).names).not.toContain('chase');
    }
  });

  it('holds a clash still on its impact only where the camera adds time', () => {
    const clashTicks = (cinema) => {
      const show = decidedClash({
        attack: 'hanuman-leap',
        defend: 'tackle',
        word: 'stolen',
        side: 'defend',
      });

      show.cinema = cinema;

      const { stages, bad } = playShow(show);

      expect(bad).toEqual([]);

      return stages.find((entry) => entry.stage === 'clash').ticks;
    };

    expect(clashTicks('full')).toBe(STAGE_TICKS.clash + CINEMA.clashFreeze);
    expect(clashTicks('short')).toBe(STAGE_TICKS.clash);
  });

  it('draws the same stages differently once the camera moves, and as always when off', () => {
    const frameAt = (cinema, stage, ticks) => {
      const show = shotShow('naga-shot', cinema);
      const { canvas, context } = strictContext();

      for (let i = 0; i < 3000 && !(show.stage === stage && show.stageTicks === ticks); i += 1) {
        updateDuelShow(show, {});
        show.match.hooks.duelTick(show.match);
      }

      drawDuelShow(context, show, { tick: 0 });

      return canvas.data.join();
    };

    expect(frameAt('short', 'saveCam', 42)).not.toBe(frameAt('off', 'saveCam', 42));
    expect(frameAt('short', 'cutin', 4)).toBe(frameAt('off', 'cutin', 4));
  });
});
