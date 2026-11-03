import { describe, expect, it } from 'vitest';

import { KNOCK_BACK } from '../../../../../src/render/duel/clash/knock-back.js';
import { SLID } from '../../../../../src/render/duel/clash/trip-over.js';
import { DEFENDER, GROUND } from '../../../../../src/render/duel/paths.js';

const IMPACT = { x: DEFENDER.x - 22, y: GROUND - 5 };

const sceneAt = (sinceHit, kind = 'block') => ({ sinceHit, impact: IMPACT, defend: { kind } });

describe('a dribbler stopped dead', () => {
  it('is thrown back the way he came and lies flat there, head first', () => {
    const down = [0, 4, 8, 30].map((since) => KNOCK_BACK.dribbler(sceneAt(since)));
    const xs = down.map(({ x }) => x);

    expect(xs).toEqual([...xs].sort((first, second) => second - first));
    expect(down.map(({ sheet, frame, facing }) => [sheet, frame, facing])).toEqual([
      ['knocked', 0, 1],
      ['knocked', 1, 1],
      ['trip', 7, -1],
      ['trip', 7, -1],
    ]);
    expect(xs.at(-1)).toBe(KNOCK_BACK.landing(sceneAt(0)));
  });
});

describe('the tackler who stopped him', () => {
  it('holds what he stopped him with while the ball comes back', () => {
    const acting = { pose: 'block', x: DEFENDER.x, y: GROUND, facing: -1 };

    expect(KNOCK_BACK.winner(sceneAt(3), acting)).toBe(acting);
    expect(KNOCK_BACK.winner(sceneAt(30), acting)).toEqual({ ...acting, pose: 'stand' });
  });

  it('gets up out of a slide where it ended', () => {
    const acting = { pose: 'slide', frame: 2, x: SLID, y: GROUND, facing: -1 };

    expect(KNOCK_BACK.winner(sceneAt(10, 'tackle'), acting)).toMatchObject({
      pose: 'run',
      sheet: 'rise',
      x: SLID,
    });
    expect(KNOCK_BACK.winner(sceneAt(30, 'tackle'), acting)).toMatchObject({
      pose: 'stand',
      x: SLID,
    });
  });

  it('gets the ball back at his feet, on his own side of the man he stopped', () => {
    const start = KNOCK_BACK.ball(sceneAt(0));
    const rest = KNOCK_BACK.ball(sceneAt(40));
    const dribbler = KNOCK_BACK.dribbler(sceneAt(40));

    expect(start).toEqual(IMPACT);
    expect(rest).toEqual({ x: DEFENDER.x - 15, y: GROUND - 5 });
    expect(KNOCK_BACK.ball(sceneAt(5)).y).toBeLessThan(GROUND - 5);
    expect(rest.x - dribbler.x).toBeGreaterThan(40);
  });
});
