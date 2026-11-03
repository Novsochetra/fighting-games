import { describe, expect, it } from 'vitest';
import { playTick } from '../../../src/sim/play.js';
import { holdBallAt, looseBallAt, matchInPlay } from '../../support/match-driver.js';

describe('a tick of play', () => {
  it('asks the duels after the players move, and stops there when one begins', () => {
    const match = matchInPlay();
    const seen = [];

    match.hooks = {
      duel(each) {
        seen.push(each.tick);
        each.phase = 'duel';

        return true;
      },
    };

    const clock = match.clock;

    playTick(match);

    expect(seen).toEqual([match.tick]);
    expect(match.clock).toBe(clock);
  });

  it('plays on, the clock running, with no hooks', () => {
    const match = matchInPlay();
    const clock = match.clock;

    playTick(match);

    expect(match.clock).toBe(clock - 1);
  });

  it('scores a ball that goes in, and stops play for one that goes out', () => {
    const scored = matchInPlay();

    looseBallAt(scored, { x: scored.pitch.length - 4, y: 540, vx: 10, z: 5, lastTouch: 9 });
    playTick(scored);

    expect(scored.phase).toBe('goal');
    expect(scored.score).toEqual([1, 0]);

    const out = matchInPlay();

    looseBallAt(out, { x: 600, y: out.pitch.width - 2, vy: 9, lastTouch: 9 });
    playTick(out);

    expect(out.phase).toBe('restart');
    expect(out.restart).toMatchObject({ kind: 'throwIn', team: 1 });
  });

  it('refills each player’s spirit', () => {
    const match = matchInPlay();
    const player = match.players[5];

    player.spirit = 10;
    playTick(match);

    expect(player.spirit).toBeGreaterThan(10);
  });

  it('carries the ball at the carrier’s feet', () => {
    const match = matchInPlay(1, { humanTeam: null });
    const carrier = holdBallAt(match, { x: 900, y: 540 }, match.players[6]);

    playTick(match);

    expect(Math.hypot(match.ball.x - carrier.x, match.ball.y - carrier.y)).toBeLessThan(20);
  });
});
