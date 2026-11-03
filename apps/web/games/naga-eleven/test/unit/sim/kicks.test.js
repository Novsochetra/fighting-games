import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { kickTo, shootBall, strikeAtGoal } from '../../../src/sim/kicks.js';
import { holdBallAt, matchInPlay } from '../../support/match-driver.js';

const middleOf = (match) => match.pitch.width / 2;

describe('a kick for a spot', () => {
  it('rolls along the grass toward it, and marks the kicker for the animation', () => {
    const match = matchInPlay();
    const kicker = holdBallAt(match, { x: 400, y: 300 });

    kickTo(match, kicker, { spot: { x: 700, y: 300 } });

    expect(match.ball).toMatchObject({ owner: null, vz: 0, lastTouch: kicker.index, kick: 'pass' });
    expect(match.ball.vx).toBeGreaterThan(Math.abs(match.ball.vy) * 5);
    expect(kicker.lastKick).toBe(match.tick);
    expect(kicker.noPickup).toBe(KICK.noPickupTicks);
  });

  it('goes up in the air when lofted', () => {
    const match = matchInPlay();
    const kicker = holdBallAt(match, { x: 400, y: 300 });

    kickTo(match, kicker, { spot: { x: 900, y: 300 }, lofted: true });

    expect(match.ball.vz).toBeGreaterThan(3);
  });

  it('is off its line further for a poor passer', () => {
    const spreadOf = (pass) => {
      let worst = 0;

      for (let seed = 1; seed <= 30; seed += 1) {
        const match = matchInPlay(seed);
        const kicker = holdBallAt(match, { x: 400, y: 300 });

        kicker.stats.pass = pass;
        kickTo(match, kicker, { spot: { x: 800, y: 300 } });
        worst = Math.max(worst, Math.abs(match.ball.vy / match.ball.vx));
      }

      return worst;
    };

    expect(spreadOf(10)).toBeGreaterThan(spreadOf(95) * 2);
  });
});

describe('a shot', () => {
  it('flies at the goal the shooter attacks, faster the more it is charged', () => {
    const soft = matchInPlay(2);
    const hard = matchInPlay(2);
    const spot = { x: soft.pitch.length - 300, y: middleOf(soft) };

    shootBall(soft, holdBallAt(soft, spot), { power: 0.1, aimY: middleOf(soft) });
    shootBall(hard, holdBallAt(hard, spot), { power: 1, aimY: middleOf(hard) });

    expect(soft.ball.vx).toBeGreaterThan(0);
    expect(hard.ball.vx).toBeGreaterThan(soft.ball.vx);
    expect(hard.ball.kick).toBe('shot');
  });

  it('is struck harder by a better shooter', () => {
    const weak = matchInPlay(3);
    const strong = matchInPlay(3);
    const spot = { x: weak.pitch.length - 300, y: middleOf(weak) };
    const weakShooter = holdBallAt(weak, spot);
    const strongShooter = holdBallAt(strong, spot);

    weakShooter.stats.shot = 10;
    strongShooter.stats.shot = 95;
    strikeAtGoal(weak, weakShooter, { power: 1, aimY: middleOf(weak), aimZ: 10 });
    strikeAtGoal(strong, strongShooter, { power: 1, aimY: middleOf(strong), aimZ: 10 });

    expect(strong.ball.vx).toBeGreaterThan(weak.ball.vx);
  });

  it('tells the match it was struck', () => {
    const match = matchInPlay();
    const shooter = holdBallAt(match, { x: match.pitch.length - 200, y: middleOf(match) });

    match.events = [];
    shootBall(match, shooter, { power: 0.5, aimY: middleOf(match) });

    expect(match.events).toEqual([{ type: 'shot', player: shooter.index, power: 0.5, move: null }]);
  });

  it('is struck only by the one who has the ball', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 400, y: 200 });

    shootBall(match, match.players[2], { power: 1, aimY: middleOf(match) });

    expect(match.ball.owner).toBe(carrier.index);
  });
});
