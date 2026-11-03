import { describe, expect, it } from 'vitest';

import { DUELS } from '../../../../src/data/duels.js';
import { chooseDuel, duelOptions } from '../../../../src/sim/duel/index.js';
import { fakeMatch, startMeeting } from '../../../support/duel-fixtures.js';

const tickTimes = (match, count) => {
  for (let i = 0; i < count; i += 1) {
    match.hooks.duelTick(match);
  }
};

describe('a duel tick by tick', () => {
  it('waits for the human, then decides once both sides have chosen', () => {
    const match = fakeMatch();

    startMeeting(match);
    tickTimes(match, 30);

    expect(match.duel.stage).toBe('choose');
    expect(match.duel.rounds[0].picked.defend).not.toBeNull();
    expect(chooseDuel(match, 'attack', 'dribble')).toBe(true);
    expect(chooseDuel(match, 'attack', 'shoot')).toBe(false);

    tickTimes(match, 1);

    expect(match.duel.stage).toBe('done');
    expect(['broke', 'stolen']).toContain(match.duel.outcome.result);
    expect([0, 1]).toContain(match.duel.outcome.winner);
  });

  it("refuses an option that is not on offer, or the other side's pick", () => {
    const match = fakeMatch();

    startMeeting(match, { at: 300 });

    expect(chooseDuel(match, 'attack', 'naga-shot')).toBe(false);
    expect(chooseDuel(match, 'defend', 'tackle')).toBe(false);
    expect(duelOptions(match, 'attack').length).toBeGreaterThan(0);
  });

  it('goes on to the keeper when a shot gets past the defender', () => {
    let reached = null;

    for (let seed = 1; seed <= 40 && !reached; seed += 1) {
      const match = fakeMatch({ seed, watched: false });

      startMeeting(match, { at: 850 });
      match.duel.rounds[0].picked.attack = duelOptions(match, 'attack').find(
        (option) => option.id === 'shoot',
      );
      tickTimes(match, 1);
      reached = match.duel?.rounds.length === 2 ? match : null;
    }

    expect(reached.duel.rounds[1]).toMatchObject({ kind: 'keeper', carried: true });
    expect(reached.duel).toMatchObject({ shooter: 4, keeper: reached.duel.rounds[1].defender });
  });

  it('spends the spirit of a special once, and pushes it', () => {
    const match = fakeMatch();

    startMeeting(match, { at: 850, attacker: { moves: ['naga-shot'], spirit: 70 } });
    chooseDuel(match, 'attack', 'naga-shot');
    tickTimes(match, 4);

    const spent = 70 - match.players[4].spirit;

    expect([40, 40 - DUELS.winSpirit]).toContain(spent);
    expect(match.events.filter((event) => event.type === 'special')).toHaveLength(1);
  });

  it('finishes an unwatched duel by itself and plays on', () => {
    const match = fakeMatch({ watched: false });

    startMeeting(match);
    tickTimes(match, 6);

    expect(match.duel).toBeNull();
    expect(['play', 'goal']).toContain(match.phase);
    expect(match.events.at(-1).type).toBe('duelEnd');
  });

  it('ends a watched duel whose show never finishes', () => {
    const match = fakeMatch();

    startMeeting(match);
    chooseDuel(match, 'attack', 'dribble');
    tickTimes(match, DUELS.showTimeout + 2);

    expect(match.duel).toBeNull();
  });
});
