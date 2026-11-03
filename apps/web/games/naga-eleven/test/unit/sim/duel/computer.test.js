import { describe, expect, it } from 'vitest';

import { computerChoice, pickWeighted } from '../../../../src/sim/duel/computer.js';
import { createRound } from '../../../../src/sim/duel/rounds.js';
import { createRandom } from '../../../../src/sim/random.js';
import { fakeMatch, forwardOn, keeperOn } from '../../../support/duel-fixtures.js';

function choicesOver(seeds, setUp) {
  const counts = {};

  for (let seed = 1; seed <= seeds; seed += 1) {
    const match = fakeMatch({ seed, humanTeam: null });
    const { round, side } = setUp(match);
    const option = computerChoice(match, round, side);

    counts[option.id] = (counts[option.id] ?? 0) + 1;
  }

  return counts;
}

describe("the computer's duel choice", () => {
  it('spends its spirit on a special it can afford, more often than not', () => {
    const counts = choicesOver(300, (match) => {
      const attacker = Object.assign(forwardOn(match, 0), {
        x: 760,
        moves: ['naga-shot'],
        spirit: 60,
        star: 'sochetra',
      });

      return {
        round: createRound({ kind: 'field', attacker, defender: forwardOn(match, 1) }),
        side: 'attack',
      };
    });

    expect(counts['naga-shot']).toBeGreaterThan(120);
    expect(counts.dribble).toBeGreaterThan(0);
  });

  it('never picks a special it cannot afford', () => {
    const counts = choicesOver(200, (match) => {
      const attacker = Object.assign(forwardOn(match, 0), {
        x: 760,
        moves: ['seven-headed-naga'],
        spirit: 79,
      });

      return {
        round: createRound({ kind: 'field', attacker, defender: forwardOn(match, 1) }),
        side: 'attack',
      };
    });

    expect(counts['seven-headed-naga']).toBeUndefined();
  });

  it('shoots more near the goal than far from it', () => {
    const shotsFrom = (x) =>
      choicesOver(300, (match) => {
        const attacker = Object.assign(forwardOn(match, 0), { x });

        return {
          round: createRound({ kind: 'field', attacker, defender: forwardOn(match, 1) }),
          side: 'attack',
        };
      }).shoot ?? 0;

    expect(shotsFrom(900)).toBeGreaterThan(shotsFrom(680));
  });

  it('keeps goal with what a keeper has', () => {
    const counts = choicesOver(200, (match) => {
      const keeper = Object.assign(keeperOn(match, 1), { moves: ['angkor-wall'], spirit: 40 });
      const round = createRound({
        kind: 'keeper',
        attacker: forwardOn(match, 0),
        defender: keeper,
      });

      return { round, side: 'defend' };
    });

    expect(Object.keys(counts).sort()).toEqual(['angkor-wall', 'catch', 'punch']);
  });

  it('picks by weight, every entry now and then', () => {
    const random = createRandom(7);
    const seen = new Set();

    for (let i = 0; i < 200; i += 1) {
      seen.add(
        pickWeighted(random, [
          { value: 'a', weight: 1 },
          { value: 'b', weight: 5 },
        ]),
      );
    }

    expect([...seen].sort()).toEqual(['a', 'b']);
  });
});
