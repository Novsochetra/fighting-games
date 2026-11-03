import { describe, expect, it } from 'vitest';
import { TACKLE } from '../../../src/data/tuning.js';
import { challenge, resolveTackles, startTackle } from '../../../src/sim/tackle.js';
import { tackleOddsOf } from '../../../src/sim/stats.js';
import { holdBallAt, matchInPlay, steered } from '../../support/match-driver.js';

function slideAt(match, seed) {
  const carrier = holdBallAt(match, { x: 600, y: 400 });
  const slider = Object.assign(match.players[14], { x: 620, y: 400, facing: { x: -1, y: 0 } });

  match.random.state = seed;
  startTackle(match, slider);
  resolveTackles(match);

  return { carrier, slider };
}

describe('a slide tackle', () => {
  it('lunges the slider where they face and leaves them to get up after', () => {
    const match = matchInPlay();
    const slider = match.players[14];

    slider.facing = { x: -1, y: 0 };
    startTackle(match, slider);

    expect(slider.tackle).toBe(TACKLE.ticks);
    expect(slider.vx).toBeCloseTo(-TACKLE.speed);
    expect(slider.recover).toBe(TACKLE.recoverTicks);
  });

  it('cannot start again while the slider gets up', () => {
    const match = matchInPlay();
    const slider = match.players[14];

    slider.recover = 3;
    startTackle(match, slider);

    expect(slider.tackle).toBe(0);
  });

  it('knocks the ball loose and floors the carrier, or misses and floors the slider', () => {
    const outcomes = new Set();

    for (let seed = 1; seed <= 20; seed += 1) {
      const match = matchInPlay();

      match.events = [];

      const { carrier, slider } = slideAt(match, seed);
      const [event] = match.events;

      expect(event).toMatchObject({ type: 'tackle', player: slider.index, target: carrier.index });

      if (event.won) {
        expect(match.ball.owner).toBe(null);
        expect(carrier.stun).toBe(TACKLE.stunTicks);
      } else {
        expect(match.ball.owner).toBe(carrier.index);
        expect(slider.stun).toBeGreaterThan(0);
      }

      outcomes.add(event.won);
    }

    expect(outcomes.size).toBe(2);
  });

  it('misses a carrier out of reach, and never takes the ball off a keeper in their box', () => {
    const match = matchInPlay();
    const slider = match.players[14];

    holdBallAt(match, { x: 400, y: 200 });
    Object.assign(slider, { x: 460, y: 200, tackle: 5 });
    resolveTackles(match);

    expect(match.ball.owner).toBe(steered(match).index);

    const keeper = match.players[0];

    Object.assign(keeper, { x: 18, y: 540 });
    Object.assign(match.ball, { owner: 0, x: 30, y: 540 });
    Object.assign(slider, { x: 34, y: 540, tackle: 5 });
    resolveTackles(match);

    expect(match.ball.owner).toBe(0);
  });
});

describe('a tackle on the feet', () => {
  it('takes the ball off the carrier or leaves the tackler beaten', () => {
    const outcomes = new Set();

    for (let seed = 1; seed <= 20; seed += 1) {
      const match = matchInPlay();
      const carrier = holdBallAt(match, { x: 600, y: 400 });
      const tackler = Object.assign(match.players[14], { x: 620, y: 400, recover: 0 });

      match.random.state = seed;
      challenge(match, tackler);

      const won = match.ball.owner === tackler.index;

      expect(won || (match.ball.owner === carrier.index && tackler.recover > 0)).toBe(true);
      outcomes.add(won);
    }

    expect(outcomes.size).toBe(2);
  });

  it('does nothing out of reach', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 600, y: 400 });

    challenge(match, Object.assign(match.players[14], { x: 700, y: 400 }));

    expect(match.ball.owner).toBe(carrier.index);
  });
});

describe('tackle against dribble', () => {
  it('wins more for the better tackler and less against the better dribbler', () => {
    const plain = { stats: { tackle: 50, dribble: 50 } };
    const hard = { stats: { tackle: 90, dribble: 50 } };
    const slippery = { stats: { tackle: 50, dribble: 90 } };

    expect(tackleOddsOf(hard, plain)).toBeGreaterThan(tackleOddsOf(plain, plain));
    expect(tackleOddsOf(plain, slippery)).toBeLessThan(tackleOddsOf(plain, plain));
  });
});
