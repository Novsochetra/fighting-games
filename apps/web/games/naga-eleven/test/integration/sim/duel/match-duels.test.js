import { describe, expect, it } from 'vitest';

import { DUELS } from '../../../../src/data/duels.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import {
  attachDuels,
  chooseDuel,
  duelOptions,
  finishDuel,
  humanSideOf,
} from '../../../../src/sim/duel/index.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { plainTeams } from '../../../../src/sim/plain-teams.js';
import { tick } from '../../../../src/sim/tick.js';
import { holdBallAt, playUntil } from '../../../support/match-driver.js';

const STARS = [
  { star: 'sochetra', moves: ['naga-shot', 'hanuman-leap', 'power-shot'] },
  { star: 'rithy', moves: ['preah-khan-strike', 'power-shot'] },
  { star: 'haruto', moves: ['silent-moon', 'mirror-step'] },
  { star: 'lukas', moves: ['iron-gate'] },
];

// two sides of seven where every outfield player is a named star with their moves, and the
// keepers have their saves
function starTeams() {
  return plainTeams('7').map((team, side) => ({
    ...team,
    players: team.players.map((player, i) => {
      if (player.role === 'keeper') {
        return {
          ...player,
          star: side === 0 ? 'dara' : 'farhad',
          moves: [side === 0 ? 'angkor-wall' : 'mountain-guard'],
        };
      }

      return { ...player, ...STARS[(i + side) % STARS.length], spiritMax: 100 };
    }),
  }));
}

const isFinite = (value) => Number.isFinite(value);

function expectSane(match) {
  for (const player of match.players) {
    expect([player.x, player.y, player.vx, player.vy].every(isFinite)).toBe(true);
  }

  expect([match.ball.x, match.ball.y, match.ball.z].every(isFinite)).toBe(true);
}

describe('duels in a real match', () => {
  it('meets star against star through a whole match, every duel ending and the match playing on', () => {
    const match = attachDuels(
      createMatch({ seed: 7, format: '7', teams: starTeams(), halfSeconds: 45 }),
    );
    const counts = { duel: 0, duelEnd: 0, special: 0 };
    let longestDuel = 0;
    let duelTicks = 0;

    for (let i = 0; i < 20000 && match.phase !== 'over'; i += 1) {
      tick(match);
      duelTicks = match.phase === 'duel' ? duelTicks + 1 : 0;
      longestDuel = Math.max(longestDuel, duelTicks);

      for (const event of drainEvents(match)) {
        counts[event.type] = (counts[event.type] ?? 0) + 1;
      }
    }

    expect(match.phase).toBe('over');
    expect(counts.duel).toBeGreaterThan(2);
    expect(counts.duelEnd).toBe(counts.duel);
    expect(counts.special).toBeGreaterThan(0);
    expect(longestDuel).toBeLessThan(10);
    expectSane(match);
  });

  it("waits for the human's pick, then plays on once the show finishes the duel", () => {
    const match = attachDuels(
      createMatch({ seed: 3, humanTeam: 0, format: '7', teams: starTeams() }),
    );

    playUntil(match, (each) => each.phase === 'play');
    // no duel starts right after a kick off: the meeting is staged as if it was a while ago
    match.lastKickoff = match.tick - DUELS.kickoffQuietTicks;

    const carrier = match.players.find((player) => player.team === 0 && player.role === 'forward');
    const rival = match.players.find((player) => player.team === 1 && player.role !== 'keeper');

    match.controlled = carrier.index;
    holdBallAt(match, { x: match.pitch.length * 0.6, y: match.pitch.width / 2 }, carrier);
    Object.assign(rival, { x: carrier.x + 24, y: carrier.y, vx: 0, vy: 0, stun: 0 });
    tick(match);

    expect(match.phase).toBe('duel');

    const side = humanSideOf(match, match.duel.rounds[0]);

    for (let i = 0; i < 120; i += 1) {
      tick(match);
    }

    expect(match.duel.stage).toBe('choose');
    expect(chooseDuel(match, side, duelOptions(match, side)[0].id)).toBe(true);
    playUntil(match, (each) => each.duel?.stage === 'done', 10);
    finishDuel(match);

    expect(['play', 'goal']).toContain(match.phase);

    for (let i = 0; i < 300; i += 1) {
      tick(match);
    }

    expect(match.clock).toBeLessThan(match.halfTicks);
    expectSane(match);
  });

  it('takes a special shot to the keeper when the sim lets one go', () => {
    const match = attachDuels(
      createMatch({ seed: 5, humanTeam: null, format: '7', teams: starTeams() }),
    );

    playUntil(match, (each) => each.phase === 'play');

    const shooter = match.players.find((player) => player.star === 'sochetra');

    holdBallAt(match, { x: match.pitch.length * 0.8, y: match.pitch.width / 2 }, shooter);
    shooter.spirit = 100;

    expect(match.hooks.special(match, shooter)).toBe(true);

    playUntil(match, (each) => each.phase !== 'duel', 10);
    drainEvents(match);

    expect(['play', 'goal']).toContain(match.phase);
    expect(shooter.spirit).toBeLessThan(100);
    expectSane(match);
  });
});
