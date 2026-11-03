import { describe, expect, it } from 'vitest';
import { TICKS_PER_SECOND } from '../../../src/config.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { tick } from '../../../src/sim/tick.js';
import { playUntil } from '../../support/match-driver.js';
import { sidesOf, storyMatch } from '../../support/story-matches.js';

// Sochetra kicked off, carried it at Rithy waiting in front of him, and a duel cut in half a
// second after nearly every kick off of the player's
function kickedOff(seed) {
  const entry = storyMatch('ch1-final');
  const match = attachDuels(
    createMatch({ seed, humanTeam: 0, format: '7', teams: sidesOf({ ...entry }) }),
  );

  playUntil(match, (each) => each.phase === 'play');

  const hero = match.players.find((player) => player.team === 0 && player.star === 'sochetra');
  const rival = match.players.find((player) => player.team === 1 && player.star === 'rithy');

  Object.assign(match.ball, { owner: hero.index });
  match.controlled = hero.index;

  return { match, hero, rival };
}

// the rival stands right in front of the carrier, every tick
function meetEachTick(match, hero, rival, ticks) {
  for (let i = 0; i < ticks && match.phase === 'play'; i += 1) {
    Object.assign(rival, { x: hero.x + hero.facing.x * 24, y: hero.y, vx: 0, vy: 0, stun: 0 });
    Object.assign(match.ball, { owner: hero.index });
    tick(match);
  }
}

describe('a kick off', () => {
  it.each([1, 2, 3])('starts no duel with the rival for its first seconds (seed %i)', (seed) => {
    const { match, hero, rival } = kickedOff(seed);

    meetEachTick(match, hero, rival, Math.round(TICKS_PER_SECOND * 3.8));

    expect(match.phase).toBe('play');

    meetEachTick(match, hero, rival, TICKS_PER_SECOND);

    expect(match.phase).toBe('duel');
  });
});
