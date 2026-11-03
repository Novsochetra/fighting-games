import { describe, expect, it } from 'vitest';

import { duelOptions } from '../../../../src/sim/duel/index.js';
import { fakeMatch, forwardOn, giveBall, keeperOn } from '../../../support/duel-fixtures.js';

function shooter(match, extra) {
  const player = Object.assign(forwardOn(match, 0), { star: 'sochetra', x: 800, y: 320 }, extra);

  giveBall(match, player);

  return player;
}

describe('letting go of a special shot', () => {
  it('starts a shot duel against the keeper with the strongest special it can afford', () => {
    const match = fakeMatch({ humanTeam: null });
    const player = shooter(match, {
      moves: ['power-shot', 'naga-shot', 'seven-headed-naga'],
      spirit: 60,
    });

    expect(match.hooks.special(match, player)).toBe(true);
    expect(match.phase).toBe('duel');
    expect(match.duel.rounds[0]).toMatchObject({
      kind: 'keeper',
      defender: keeperOn(match, 1).index,
      carried: true,
    });
    expect(match.duel.rounds[0].picked.attack.id).toBe('naga-shot');
  });

  it('lets the human pick between their shot specials', () => {
    const match = fakeMatch();
    const player = shooter(match, { moves: ['power-shot', 'naga-shot'], spirit: 60 });

    match.hooks.special(match, player);

    expect(match.duel.rounds[0].picked.attack).toBeNull();
    expect(duelOptions(match, 'attack').map((option) => option.id)).toEqual([
      'shoot',
      'power-shot',
      'naga-shot',
    ]);
  });

  it('does nothing without the ball, the spirit or the range', () => {
    const broke = fakeMatch();
    const poor = shooter(broke, { moves: ['naga-shot'], spirit: 10 });

    expect(broke.hooks.special(broke, poor)).toBe(false);

    const far = fakeMatch();
    const distant = shooter(far, { moves: ['naga-shot'], spirit: 99, x: 200 });

    expect(far.hooks.special(far, distant)).toBe(false);

    const loose = fakeMatch();
    const free = shooter(loose, { moves: ['naga-shot'], spirit: 99 });

    loose.ball.owner = null;

    expect(loose.hooks.special(loose, free)).toBe(false);
    expect(loose.phase).toBe('play');
  });
});
