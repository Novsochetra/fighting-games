import { describe, expect, it } from 'vitest';

import { attackerOf, defenderOf } from '../../../../src/render/duel/clash-actors.js';
import { DEFENDER, GROUND, KICKER } from '../../../../src/render/duel/paths.js';
import { IMPACT_TICK } from '../../../../src/render/duel/stages.js';

// a clash so many ticks in, the approach eased in as the scene works it out
function sceneAt(
  ticks,
  { attack = 'dribble', defend = 'tackle', word = 'broke', wins = true } = {},
) {
  const share = Math.min(1, Math.max(0, (ticks - 8) / (IMPACT_TICK - 8)));

  return {
    t: ticks,
    tick: 200 + ticks,
    keeper: false,
    attack: { kind: attack },
    defend: { kind: defend },
    word,
    attackWins: wins,
    approach: share * share,
    hit: ticks >= IMPACT_TICK,
    sinceHit: ticks - IMPACT_TICK,
    impact: { x: DEFENDER.x - 22, y: GROUND - 5 },
    ball: { x: 120, y: GROUND - 5 },
  };
}

describe('the dribbler in the clash', () => {
  it('runs with the ball at his feet up to the tackle', () => {
    const runner = attackerOf(sceneAt(30));

    expect(runner).toMatchObject({ x: 120 - 16, y: GROUND, facing: 1 });
    expect(['run', 'run2']).toContain(runner.pose);
  });

  it('goes over a slide tackle that wins and comes down flat beyond it', () => {
    const trip = [0, 4, 8, 11, 20].map((since) =>
      attackerOf(sceneAt(IMPACT_TICK + since, { word: 'stolen', wins: false })),
    );

    expect(trip.map(({ frame }) => frame)).toEqual([2, 4, 5, 6, 7]);
    expect(trip.every(({ sheet }) => sheet === 'trip')).toBe(true);
    expect(trip.at(-1)).toMatchObject({ pose: 'fallen', facing: 1 });
    expect(trip.at(-1).x).toBeGreaterThan(DEFENDER.x);
  });

  it('is thrown back flat by a block or a stretch that wins', () => {
    for (const defend of ['block', 'intercept']) {
      const down = [0, 5, 12].map((since) =>
        attackerOf(sceneAt(IMPACT_TICK + since, { defend, word: 'stolen', wins: false })),
      );

      expect(down.map(({ sheet, frame }) => [sheet, frame])).toEqual([
        ['knocked', 0],
        ['knocked', 1],
        ['trip', 7],
      ]);
      expect(down[2]).toMatchObject({ pose: 'fallen', facing: -1 });
      expect(down[2].x).toBeLessThan(down[0].x);
    }
  });
});

describe('the striker of a pass or a shot', () => {
  it('winds up, strikes, follows through, then stands and watches', () => {
    const poses = [4, 12, 20, 50].map((ticks) => attackerOf(sceneAt(ticks, { attack: 'shot' })));

    expect(poses.map(({ pose, frame }) => [pose, frame])).toEqual([
      ['windup', undefined],
      ['kick', 1],
      ['kick', 2],
      ['stand', undefined],
    ]);
    expect(poses.every(({ x }) => x === KICKER.x)).toBe(true);
  });
});

describe('the defender in the clash', () => {
  it('jockeys in a crouch of the sheets while he waits, a stand for the shadow', () => {
    expect(defenderOf(sceneAt(20))).toMatchObject({ pose: 'stand', sheet: 'guard', x: DEFENDER.x });
  });

  it('slides in step by step and along the grass as the ball comes', () => {
    const slides = [44, 48, 52].map((ticks) => defenderOf(sceneAt(ticks)));

    expect(slides.map(({ pose }) => pose)).toEqual(['slide', 'slide', 'slide']);
    expect(slides.map(({ frame }) => frame)).toEqual([0, 1, 2]);
    expect(slides[2].x).toBeLessThan(slides[0].x);
    expect(slides.every(({ sheet }) => sheet === undefined)).toBe(true);
  });

  it('braces for a shot and stretches for a pass', () => {
    expect(defenderOf(sceneAt(50, { attack: 'shot', defend: 'block' }))).toMatchObject({
      pose: 'block',
      frame: undefined,
    });
    expect(defenderOf(sceneAt(50, { attack: 'pass', defend: 'intercept' }))).toMatchObject({
      pose: 'lunge',
      frame: 2,
    });
  });

  it('goes down when beaten', () => {
    expect(defenderOf(sceneAt(IMPACT_TICK + 10))).toMatchObject({
      pose: 'fallen',
      sheet: 'sat',
      x: DEFENDER.x + 14,
    });
  });

  it('slides on with the ball he won, gets up and stands over it', () => {
    const won = [4, 12, 30].map((since) =>
      defenderOf(sceneAt(IMPACT_TICK + since, { word: 'stolen', wins: false })),
    );

    expect(won.map(({ pose, sheet, frame }) => [pose, sheet, frame])).toEqual([
      ['slide', undefined, 2],
      ['run', 'rise', undefined],
      ['stand', undefined, undefined],
    ]);
    expect(won.map(({ x }) => x)).toEqual([120 + 22, 120 + 22, 120 + 15]);
  });

  it('holds his block when it wins, then stands where he blocked', () => {
    const block = { defend: 'block', word: 'stolen', wins: false };

    expect(defenderOf(sceneAt(IMPACT_TICK + 4, block))).toMatchObject({ pose: 'block' });
    expect(defenderOf(sceneAt(IMPACT_TICK + 20, block))).toMatchObject({
      pose: 'stand',
      x: DEFENDER.x,
    });
  });
});
