import { describe, expect, it } from 'vitest';
import { computerRestart, humanCross } from '../../../src/sim/restart-choice.js';
import { startRestart } from '../../../src/sim/restart-setup.js';
import { restartSpotOf } from '../../../src/sim/restart-spots.js';
import { planTeams } from '../../../src/sim/team-plan.js';
import { inBoxOf } from '../../../src/sim/pitch.js';
import { looseBallAt, matchInPlay } from '../../support/match-driver.js';

// the players stand where they go for the restart before the taker picks
function choiceAt(seed, fields) {
  const match = matchInPlay(seed, { humanTeam: null });

  looseBallAt(match, fields);
  startRestart(match);
  planTeams(match);

  for (const player of match.players) {
    Object.assign(player, restartSpotOf(match, player));
  }

  return { match, choice: computerRestart(match, match.players[match.restart.taker]) };
}

describe('the computer at a restart', () => {
  it('swings most corners into the box in the air', () => {
    let crosses = 0;

    for (let seed = 1; seed <= 20; seed += 1) {
      const { match, choice } = choiceAt(seed, { x: 1810, y: 100, lastTouch: 13 });

      expect(choice.kind).toBe('pass');
      crosses += choice.lofted && inBoxOf(match, 1, match.players[choice.target]) ? 1 : 0;
    }

    expect(crosses).toBeGreaterThan(10);
  });

  it('throws a throw-in to a mate within a throw', () => {
    const { match, choice } = choiceAt(2, { x: 700, y: 1090, lastTouch: 14 });
    const taker = match.players[match.restart.taker];
    const mate = match.players[choice.target];

    expect(mate.team).toBe(taker.team);
    expect(Math.hypot(mate.x - taker.x, mate.y - taker.y)).toBeLessThan(400);
  });

  it('plays a goal kick to a mate', () => {
    const { match, choice } = choiceAt(3, { x: -10, y: 300, lastTouch: 15 });

    expect(match.players[choice.target].team).toBe(0);
  });

  it('swings the player’s held corner in at head height to a mate in the box', () => {
    const { match } = choiceAt(3, { x: 1810, y: 100, vx: 3, lastTouch: 13 });
    const taker = match.players[match.restart.taker];
    const cross = humanCross(match, taker, {
      kind: 'pass',
      aim: { x: -0.5, y: 0.87 },
      lofted: true,
    });

    expect(cross.height).toBeGreaterThan(30);
    expect(inBoxOf(match, 1, match.players[cross.target])).toBe(true);
  });
});
