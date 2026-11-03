import { describe, expect, it } from 'vitest';

import { MOVES } from '../../../../src/data/moves.js';
import { drawDuelShow } from '../../../../src/render/duel/draw-show.js';
import { createDuelShow, isShowDone } from '../../../../src/render/duel/show.js';
import { updateDuelShow } from '../../../../src/render/duel/timeline.js';
import { fakeMatch, forwardOn, giveBall, keeperOn } from '../../../support/duel-fixtures.js';
import { painted, strictContext } from './strict-context.js';

// a star with the spirit for his shot special, Rithy beside him, and a keeper with his own skill
// (or none) to answer it
function shotMatch(move, { guard, seed }) {
  const match = fakeMatch({ seed, humanTeam: null });
  const shooter = Object.assign(forwardOn(match, 0), {
    star: 'sochetra',
    x: 850,
    moves: [move],
    spirit: 200,
  });
  const keeper = guard ? { star: MOVES[guard].owner, moves: [guard] } : { star: null, moves: [] };

  Object.assign(match.players[3], { star: 'rithy', x: 820, spirit: 200 });
  Object.assign(keeperOn(match, 1), { ...keeper, spirit: 200 });
  giveBall(match, shooter);
  match.hooks.special(match, shooter);

  return match;
}

// the computer on both sides, the show drawn every few ticks as it plays
function playShot(move, { guard = null, seed = 3, every = 15 } = {}) {
  const match = shotMatch(move, { guard, seed });
  const show = createDuelShow(match, { heroAge: 'young' });
  const { canvas, context, bad } = strictContext();
  const stages = new Set();

  for (let i = 0; i < 2000 && !isShowDone(show); i += 1) {
    updateDuelShow(show, {});

    if (match.duel) {
      match.hooks.duelTick(match);
    }

    stages.add(show.stage);

    if (i % every === 0) {
      drawDuelShow(context, show, { lang: i % 2 ? 'km' : 'en', tick: i });
    }
  }

  return { match, show, stages, canvas, bad };
}

const STAR_SHOTS = Object.values(MOVES).filter(
  (move) => move.kind === 'shot' && move.family === 'star',
);

describe("a duel's keeper round", { timeout: 20000 }, () => {
  it.each(STAR_SHOTS.map((move) => move.id))('plays %s on the save cam, not the clash', (move) => {
    const { show, stages, canvas, bad } = playShot(move, { guard: 'mountain-guard' });

    expect(bad).toEqual([]);
    expect(painted(canvas)).toBe(true);
    expect(stages.has('saveCam')).toBe(true);
    expect(stages.has('clash')).toBe(false);
    expect(show.saveCam.moment.move).toBe(move);
  });

  it("shows the keeper's own skill and the result the duel came to", () => {
    for (const [guard, seed] of [
      ['angkor-wall', 5],
      ['mountain-guard', 6],
    ]) {
      const { show } = playShot('naga-shot', { guard, seed, every: Infinity });
      const round = show.duel.rounds.at(-1);

      expect(show.saveCam.moment.result).toBe(round.result.word);

      if (round.picked.defend.move) {
        expect(show.saveCam.moment.guard).toBe(guard);
      }
    }
  });
});
