import { describe, expect, it } from 'vitest';
import { PASS_COMBO } from '../../../../src/data/combos.js';
import { finisherOf } from '../../../../src/sim/combos/finisher.js';
import { matchInPlay } from '../../../support/match-driver.js';

const holding = (match, team, level) => {
  const holder = match.sides[team][9];

  match.combo = {
    team,
    level,
    holder: holder.index,
    since: match.tick,
    passer: null,
    before: null,
  };

  return holder;
};

describe('a pass combo’s finisher', () => {
  it('is the holder’s from x3, his side’s style, stronger from x5', () => {
    const match = matchInPlay();

    expect(finisherOf(match, holding(match, 0, 2))).toBeNull();
    expect(finisherOf(match, holding(match, 0, 3))).toMatchObject({
      move: { id: PASS_COMBO.finishers.khmer[3] },
      level: 3,
    });
    expect(finisherOf(match, holding(match, 0, 5)).move.id).toBe(PASS_COMBO.finishers.khmer[5]);
    expect(finisherOf(match, holding(match, 1, 4)).move.id).toBe(PASS_COMBO.finishers.world[3]);
  });

  it('is nobody else’s, and none before the story brings combos in', () => {
    const match = matchInPlay();

    holding(match, 0, 4);
    expect(finisherOf(match, match.players[8])).toBeNull();

    match.systems.passCombo = false;
    expect(finisherOf(match, match.players[9])).toBeNull();
  });
});
