import { describe, expect, it } from 'vitest';
import { BALL, PLAYER } from '../../../src/data/tuning.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { playOut } from '../../support/match-driver.js';

const SEEDS = [1, 2, 3, 4, 5, 6];

function isOutside({ ball, players, pitch }) {
  const margin = PLAYER.worldMargin;
  const ballOut =
    !Number.isFinite(ball.x) ||
    Math.abs(ball.x - pitch.length / 2) > pitch.length / 2 + BALL.runoff ||
    Math.abs(ball.y - pitch.width / 2) > pitch.width / 2 + BALL.runoff;
  const playerOut = players.some(
    (player) =>
      Math.abs(player.x - pitch.length / 2) > pitch.length / 2 + margin ||
      Math.abs(player.y - pitch.width / 2) > pitch.width / 2 + margin,
  );

  return ballOut || playerOut;
}

const whistleOf = (match, event) =>
  event.kind === 'kickoff'
    ? `kickoff ${event.half} ${match.kickoffTeam}`
    : `${event.kind} ${event.half}`;

// a pass by the side that made the last one goes on its chain; one by the other starts another
function countPass(match, seen, event) {
  const team = match.players[event.player].team;

  seen.chain = team === seen.chainTeam ? seen.chain + 1 : 1;
  seen.chainTeam = team;
  seen.longest = Math.max(seen.longest, seen.chain);
}

const COUNTERS = {
  goal: (match, seen, event) => {
    seen.goals[event.team] += 1;
  },
  out: (match, seen, event) => {
    seen.restarts[event.kind] = (seen.restarts[event.kind] ?? 0) + 1;
  },
  whistle: (match, seen, event) => seen.whistles.push(whistleOf(match, event)),
  pass: countPass,
};

function countTurnover(match, seen) {
  const owner = match.ball.owner === null ? null : match.players[match.ball.owner];

  if (owner && seen.owningTeam !== null && owner.team !== seen.owningTeam) {
    seen.turnovers += 1;
  }

  seen.owningTeam = owner ? owner.team : seen.owningTeam;
}

// what a whole match the computer plays shows: goals, restarts, whistles, passing and who has it
function watch(match) {
  const seen = {
    goals: [0, 0],
    restarts: {},
    whistles: [],
    outside: 0,
    chain: 0,
    chainTeam: null,
    longest: 0,
    turnovers: 0,
    owningTeam: null,
  };

  playOut(match, (each, events) => {
    countTurnover(each, seen);
    seen.outside += isOutside(each) ? 1 : 0;

    for (const event of events) {
      COUNTERS[event.type]?.(each, seen, event);
    }
  });

  return seen;
}

const matchesOf = (format) => SEEDS.map((seed) => ({ match: createMatch({ seed, format }), seed }));

describe.each(['7', '11'])('whole matches of the format %s the computer plays', (format) => {
  const played = matchesOf(format).map(({ match }) => ({ match, seen: watch(match) }));

  it('runs both halves: half time, the other side kicks off the second, full time', () => {
    for (const { match, seen } of played) {
      const afterHalfTime = seen.whistles.indexOf('halfTime 1') + 1;

      expect(seen.whistles.filter((whistle) => !whistle.startsWith('kickoff'))).toEqual([
        'halfTime 1',
        'fullTime 2',
      ]);
      expect(seen.whistles[0]).toBe('kickoff 1 0');
      expect(seen.whistles[afterHalfTime]).toBe('kickoff 2 1');
      expect(match.minute).toBe(format === '7' ? 40 : 90);
    }
  });

  it('scores at both ends, the score the goals it saw', () => {
    const goals = played.reduce(
      (sum, { seen }) => [sum[0] + seen.goals[0], sum[1] + seen.goals[1]],
      [0, 0],
    );

    expect(goals[0]).toBeGreaterThan(0);
    expect(goals[1]).toBeGreaterThan(0);

    for (const { match, seen } of played) {
      expect(match.score).toEqual(seen.goals);
    }
  });

  it('scores a fair few goals but not a flood', () => {
    const goals = played.map(({ match }) => match.score[0] + match.score[1]);
    const average = goals.reduce((sum, count) => sum + count, 0) / goals.length;

    expect(average).toBeGreaterThan(1.5);
    expect(average).toBeLessThan(6.5);
  });

  it('has throw-ins, goal kicks and corners', () => {
    const kinds = new Set(played.flatMap(({ seen }) => Object.keys(seen.restarts)));

    expect([...kinds].sort()).toEqual(['corner', 'goalKick', 'throwIn']);
  });

  it('keeps everyone and the ball in the world', () => {
    for (const { seen } of played) {
      expect(seen.outside).toBe(0);
    }
  });

  it('strings passes together and swaps the ball between the sides', () => {
    for (const { seen } of played) {
      expect(seen.longest).toBeGreaterThanOrEqual(4);
      expect(seen.turnovers).toBeGreaterThan(15);
    }
  });
});

describe('a match played again', () => {
  it('plays the same from the same seed', { timeout: 60000 }, () => {
    for (const format of ['7', '11']) {
      const first = createMatch({ seed: 9, format });
      const second = createMatch({ seed: 9, format });

      playOut(first);
      playOut(second);

      expect(second.score).toEqual(first.score);
      expect(second.ball).toEqual(first.ball);
      expect(second.players.map((player) => [player.x, player.y])).toEqual(
        first.players.map((player) => [player.x, player.y]),
      );
    }
  });
});
