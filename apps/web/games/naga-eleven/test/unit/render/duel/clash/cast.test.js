import { describe, expect, it } from 'vitest';

import { looksOf } from '../../../../../src/render/actors/looks.js';
import { castOf } from '../../../../../src/render/duel/clash/cast.js';
import { createDuelShow } from '../../../../../src/render/duel/show.js';
import { fakeMatch, startMeeting } from '../../../../support/duel-fixtures.js';

function shownDuel() {
  const match = fakeMatch({ seed: 4 });

  startMeeting(match, { at: 600 });

  return { match, show: createDuelShow(match) };
}

describe('who a side sends into the clash', () => {
  it('is the round attacker and defender, each in his own look and number', () => {
    const { match, show } = shownDuel();
    const round = match.duel.rounds[0];
    const looks = looksOf(match).players;

    expect(castOf(show, 'attack')).toEqual({
      look: looks[round.attacker],
      number: match.players[round.attacker].number,
    });
    expect(castOf(show, 'defend')).toEqual({
      look: looks[round.defender],
      number: match.players[round.defender].number,
    });
    expect(castOf(show, 'attack').look.key).not.toBe(castOf(show, 'defend').look.key);
  });

  it('is nobody without a show, a round or a side', () => {
    const { show } = shownDuel();

    expect(castOf(null, 'attack')).toBeNull();
    expect(castOf(show, undefined)).toBeNull();
    expect(castOf({ ...show, duel: null }, 'attack')).toBeNull();
  });
});
