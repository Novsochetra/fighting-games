import { describe, expect, it } from 'vitest';

import { resolveRound } from '../../../../src/sim/duel/resolve.js';
import { createRound } from '../../../../src/sim/duel/rounds.js';
import { fakeMatch, forwardOn, keeperOn, statsOf } from '../../../support/duel-fixtures.js';

const option = (kind, power = 0) => ({ id: kind, kind, power, move: null, cost: 0 });

function winsOver(seeds, { attackLevel, defendLevel, kind = 'field', attack, defend }) {
  let wins = 0;

  for (let seed = 1; seed <= seeds; seed += 1) {
    const match = fakeMatch({ seed });
    const attacker = Object.assign(forwardOn(match, 0), { stats: statsOf(attackLevel), x: 800 });
    const defender = kind === 'keeper' ? keeperOn(match, 1) : forwardOn(match, 1);

    defender.stats = statsOf(defendLevel);

    const round = createRound({ kind, attacker, defender });

    round.picked = { attack, defend };
    wins += resolveRound(match, round).side === 'attack' ? 1 : 0;
  }

  return wins / seeds;
}

describe('resolving a duel', () => {
  it('lets the stronger dribbler through more often, but not every time', () => {
    const duel = { attack: option('dribble'), defend: option('tackle') };
    const strong = winsOver(400, { attackLevel: 80, defendLevel: 50, ...duel });
    const weak = winsOver(400, { attackLevel: 50, defendLevel: 80, ...duel });

    expect(strong).toBeGreaterThan(0.6);
    expect(strong).toBeLessThan(1);
    expect(weak).toBeLessThan(0.4);
    expect(weak).toBeGreaterThan(0);
  });

  it('gives a special the edge over a plain move between equals', () => {
    const plain = winsOver(400, {
      attackLevel: 60,
      defendLevel: 60,
      attack: option('dribble'),
      defend: option('tackle'),
    });
    const special = winsOver(400, {
      attackLevel: 60,
      defendLevel: 60,
      attack: option('dribble', 30),
      defend: option('tackle'),
    });

    expect(special).toBeGreaterThan(plain + 0.15);
  });

  it('beats the keeper with the stronger shot more often, never always', () => {
    const duel = { kind: 'keeper', attack: option('shot', 22), defend: option('catch') };
    const goals = winsOver(400, { attackLevel: 75, defendLevel: 45, ...duel });

    expect(goals).toBeGreaterThan(0.55);
    expect(goals).toBeLessThan(0.95);
  });

  it('names each result by what the attack was', () => {
    const match = fakeMatch();
    const round = createRound({
      kind: 'field',
      attacker: forwardOn(match, 0),
      defender: forwardOn(match, 1),
    });

    round.picked = { attack: option('pass'), defend: option('intercept') };

    expect(['passed', 'cut']).toContain(resolveRound(match, round).word);

    round.picked = { attack: option('shot'), defend: option('block') };

    expect(['through', 'blocked']).toContain(resolveRound(match, round).word);
  });

  it('comes to goal, saved, parried or wide against a keeper', () => {
    const words = new Set();

    for (let seed = 1; seed <= 300; seed += 1) {
      const match = fakeMatch({ seed });
      const attacker = Object.assign(forwardOn(match, 0), { x: 700 });
      const round = createRound({ kind: 'keeper', attacker, defender: keeperOn(match, 1) });

      round.picked = { attack: option('shot'), defend: option(seed % 2 ? 'catch' : 'punch') };
      words.add(resolveRound(match, round).word);
    }

    expect([...words].sort()).toEqual(['goal', 'parried', 'saved', 'wide']);
  });
});
