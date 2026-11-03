import { describe, expect, it } from 'vitest';

import { cutinLength, versusLength } from '../../../../src/render/duel/beats.js';
import { createDuelShow, isShowDone } from '../../../../src/render/duel/show.js';
import { STAGE_TICKS } from '../../../../src/render/duel/stages.js';
import { updateDuelShow } from '../../../../src/render/duel/timeline.js';
import { finishDuel } from '../../../../src/sim/duel/index.js';
import { fakeMatch, forwardOn, giveBall } from '../../../support/duel-fixtures.js';

// a star lets go of the Naga Shot; the show and the match tick together, and how long each stage
// ran comes back (the last tick of a stage is the one it moves on in)
function strike(match) {
  const shooter = Object.assign(forwardOn(match, 0), {
    star: 'sochetra',
    x: 850,
    moves: ['naga-shot'],
    spirit: 99,
    stun: 0,
    cooldown: 0,
  });

  giveBall(match, shooter);
  match.phase = 'play';
  match.duel = null;
  match.hooks.special(match, shooter);

  const show = createDuelShow(match);
  const lengths = {};

  for (let i = 0; i < 2000 && !isShowDone(show); i += 1) {
    updateDuelShow(show, {});
    match.hooks.duelTick(match);
    lengths[show.stage] = Math.max(lengths[show.stage] ?? 0, show.stageTicks + 1);
  }

  finishDuel(match);

  return { show, lengths };
}

describe('a cut-in seen before in the match', () => {
  it('plays in full the first time and at half length after, the versus with it', () => {
    const match = fakeMatch({ humanTeam: null });
    const first = strike(match);

    match.duelMemory.pairs = {};
    match.tick += 5000;

    const second = strike(match);

    expect(first.show.repeat).toBe(false);
    expect(first.lengths.cutin).toBe(STAGE_TICKS.cutin);
    expect(second.show.repeat).toBe(true);
    expect(second.lengths.cutin).toBe(STAGE_TICKS.cutin / 2);
    expect(versusLength(second.show)).toBe(STAGE_TICKS.versus / 2);
  });

  it('keeps what was seen to its own match', () => {
    strike(fakeMatch({ humanTeam: null }));

    const fresh = strike(fakeMatch({ humanTeam: null }));

    expect(fresh.show.repeat).toBe(false);
    expect(cutinLength({ cutinShort: false })).toBe(STAGE_TICKS.cutin);
  });
});

describe('the save cam in a keeper round', () => {
  it('skips to the result on a press once it has run 18 ticks, and not before', () => {
    const match = fakeMatch({ humanTeam: null });
    const shooter = Object.assign(forwardOn(match, 0), {
      star: 'sochetra',
      x: 850,
      moves: ['naga-shot'],
      spirit: 99,
    });

    giveBall(match, shooter);
    match.hooks.special(match, shooter);

    const show = createDuelShow(match);

    for (let i = 0; i < 2000 && show.stage !== 'saveCam'; i += 1) {
      updateDuelShow(show, {});
      match.hooks.duelTick(match);
    }

    updateDuelShow(show, { pressed: { pass: true } });

    expect(show.stage).toBe('saveCam');

    for (let i = 0; i < 18; i += 1) {
      updateDuelShow(show, {});
    }

    updateDuelShow(show, { pressed: { pass: true } });

    expect(show.stage).toBe('result');
    expect(show.saveCam.ticks).toBe(STAGE_TICKS.saveCam);
  });
});
