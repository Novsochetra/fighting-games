import { describe, expect, it } from 'vitest';

import { DUELS } from '../../../../src/data/duels.js';
import { duelOptions } from '../../../../src/sim/duel/index.js';
import { fakeMatch, forwardOn, giveBall } from '../../../support/duel-fixtures.js';

function challenge({ humanTeam = 0, spirit = 100, gap = 30, ...carrierWith } = {}) {
  const match = fakeMatch({ humanTeam });
  const carrier = Object.assign(match.players[3], {
    skill: 'apsara-curl',
    spirit,
    x: 600,
    y: 320,
    ...carrierWith,
  });

  Object.assign(forwardOn(match, 0), { x: 760, y: 220 });
  Object.assign(forwardOn(match, 1), { x: 600 + gap, y: 320, facing: { x: -1, y: 0 } });
  match.players
    .filter((player) => player.team === 1 && player !== forwardOn(match, 1))
    .forEach((player) => Object.assign(player, { x: 950, y: 600 }));
  Object.assign(match, { half: 1, halfTicks: 6000, clock: 6000 });
  giveBall(match, carrier);

  return { match, carrier };
}

describe('a challenge on the human’s man with a skill to pay for', () => {
  it('stops play for the duel menu, his skill on it', () => {
    const { match, carrier } = challenge();

    expect(match.hooks.duel(match)).toBe(true);
    expect(match.duel.rounds[0]).toMatchObject({ kind: 'field', attacker: carrier.index });
    expect(duelOptions(match, 'attack').map((option) => option.id)).toContain('apsara-curl');
    expect(match.duelMemory.commandAt).toBe(match.tick);
  });

  it('lets play run on when he has no spirit for a skill', () => {
    const { match } = challenge({ spirit: 0 });

    expect(match.hooks.duel(match)).toBe(false);
  });

  it('lets the computer’s men play on', () => {
    const { match } = challenge({ humanTeam: 1 });

    expect(match.hooks.duel(match)).toBe(false);
  });

  it('asks again only once the cooldown has run', () => {
    const { match } = challenge();

    match.duelMemory.commandAt = match.tick - DUELS.commandCooldown + 1;
    expect(match.hooks.duel(match)).toBe(false);

    match.duelMemory.commandAt = match.tick - DUELS.commandCooldown;
    expect(match.hooks.duel(match)).toBe(true);
  });

  it('waits while a rival still hunts the hero, so the two meet first', () => {
    const { match } = challenge({ star: 'sochetra', skill: null, moves: ['hanuman-leap'] });

    match.players[8].hunts = 'sochetra';
    expect(match.hooks.duel(match)).toBe(false);

    match.players[8].hunts = undefined;
    expect(match.hooks.duel(match)).toBe(true);
  });

  it('lets a challenger from behind or far off go by', () => {
    for (const gap of [-30, DUELS.range + 5]) {
      const { match } = challenge({ gap });

      expect(match.hooks.duel(match), gap).toBe(false);
    }
  });
});
