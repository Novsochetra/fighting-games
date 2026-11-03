import { describe, expect, it } from 'vitest';

import { SLID, slideReach, TRIP_OVER } from '../../../../../src/render/duel/clash/trip-over.js';
import { DEFENDER, GROUND } from '../../../../../src/render/duel/paths.js';

const IMPACT = { x: DEFENDER.x - 22, y: GROUND - 5 };

const sceneAt = (sinceHit, ballX = IMPACT.x) => ({
  sinceHit,
  impact: IMPACT,
  ball: { x: ballX, y: GROUND - 5 },
});

describe('a dribbler tripped by a slide', () => {
  it('flies on past the tackle and lands where his dust goes up', () => {
    const path = [0, 3, 6, 10, 14, 30].map((since) => TRIP_OVER.dribbler(sceneAt(since)).x);
    const landed = TRIP_OVER.dribbler(sceneAt(TRIP_OVER.lands));

    expect(path).toEqual([...path].sort((first, second) => first - second));
    expect(path[0]).toBeLessThan(IMPACT.x);
    expect(path.at(-1)).toBeGreaterThan(SLID);
    expect(landed.x).toBe(TRIP_OVER.landing(sceneAt(0)));
  });

  it('is in the air until he lands, then on the grass, the dive drawn the way he ran', () => {
    const poses = [0, 9, 10, 40].map((since) => TRIP_OVER.dribbler(sceneAt(since)));

    expect(poses.map(({ pose }) => pose)).toEqual(['dive', 'dive', 'fallen', 'fallen']);
    expect(poses.every(({ facing, y }) => facing === 1 && y === GROUND)).toBe(true);
  });

  it('starts from before the tackle, held at the moment it met him', () => {
    expect(TRIP_OVER.dribbler(sceneAt(-3))).toEqual(TRIP_OVER.dribbler(sceneAt(0)));
  });
});

describe('the slide tackler who won the ball', () => {
  it('slides no further than his slide reached, then follows the ball', () => {
    expect(TRIP_OVER.winner(sceneAt(0, IMPACT.x)).x).toBe(SLID);
    expect(TRIP_OVER.winner(sceneAt(6, 140)).x).toBe(140 + 22);
  });

  it('stands with the ball a step in front of him, facing the way his side attacks', () => {
    const standing = TRIP_OVER.winner(sceneAt(40, 130.4));

    expect(standing).toEqual({ pose: 'stand', x: 130 + 15, y: GROUND, facing: -1 });
  });

  it('closes from where he stood by how far into the slide he is', () => {
    expect(slideReach(0.55)).toBe(0);
    expect(slideReach(1)).toBe(DEFENDER.x - SLID);
    expect(slideReach(2)).toBe(slideReach(1));
  });
});
