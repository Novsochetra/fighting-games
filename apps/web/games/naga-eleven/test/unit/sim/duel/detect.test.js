import { describe, expect, it } from 'vitest';

import { DUELS } from '../../../../src/data/duels.js';
import { finishDuel } from '../../../../src/sim/duel/index.js';
import { fakeMatch, forwardOn, meeting, settleDuel } from '../../../support/duel-fixtures.js';

describe('when two stars meet', () => {
  it('starts a duel when a star with the ball meets a star close in front', () => {
    const match = fakeMatch();
    const { carrier, rival } = meeting(match);

    expect(match.hooks.duel(match)).toBe(true);
    expect(match.phase).toBe('duel');
    expect(match.duel.rounds[0]).toMatchObject({
      kind: 'field',
      attacker: carrier.index,
      defender: rival.index,
    });
    expect(match.events.map((event) => event.type)).toEqual(['duel']);
  });

  it('lets a rival behind the carrier, a plain player or one far off go by', () => {
    const behind = fakeMatch();

    meeting(behind, { gap: -30 });

    const plain = fakeMatch({ humanTeam: null });

    meeting(plain, { defender: { star: null } });

    const far = fakeMatch();

    meeting(far, { gap: DUELS.range + 5 });

    for (const match of [behind, plain, far]) {
      expect(match.hooks.duel(match)).toBe(false);
      expect(match.phase).toBe('play');
    }
  });

  it("meets the opponent's star with whoever the human steers", () => {
    const match = fakeMatch({ humanTeam: 1 });
    const carrier = Object.assign(forwardOn(match, 0), { star: 'rafael', x: 600 });

    Object.assign(forwardOn(match, 1), { star: null, x: 630, y: 320 });
    match.controlled = forwardOn(match, 1).index;
    Object.assign(match.ball, { owner: carrier.index });

    expect(match.hooks.duel(match)).toBe(true);
  });

  it('only duels in play', () => {
    const match = fakeMatch();

    meeting(match);
    match.phase = 'restart';

    expect(match.hooks.duel(match)).toBe(false);
  });

  it('keeps the same two apart for a while after they meet', () => {
    const match = fakeMatch({ watched: false });

    meeting(match, { attacker: { stats: { dribble: 99, speed: 99 } } });
    match.hooks.duel(match);
    settleDuel(match);
    finishDuel(match);
    meeting(match, { defender: { stun: 0 } });
    match.players.forEach((player) => Object.assign(player, { stun: 0 }));
    match.tick += DUELS.quietTicks + 1;

    expect(match.hooks.duel(match)).toBe(false);

    match.tick += DUELS.pairCooldown;

    expect(match.hooks.duel(match)).toBe(true);
  });

  it('starts none in the first seconds after a kick off', () => {
    const match = fakeMatch();

    meeting(match);
    match.lastKickoff = match.tick - DUELS.kickoffQuietTicks + 1;

    expect(match.hooks.duel(match)).toBe(false);

    match.lastKickoff = match.tick - DUELS.kickoffQuietTicks;

    expect(match.hooks.duel(match)).toBe(true);
  });
});
