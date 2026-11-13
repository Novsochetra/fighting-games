import { describe, expect, it } from 'vitest';

import { ballAt } from '../../../../../../dev/camera-lab/src/naga-shot/tracks/ball.js';
import { keeperAt } from '../../../../../../dev/camera-lab/src/naga-shot/tracks/keeper.js';
import { CONTACTS, KEEPER_SPOT } from '../../../../../../dev/camera-lab/src/naga-shot/world.js';
import { everyClock, firstOf, lastOf } from '../every-clock.js';

const FULL = { camera: 'full' };

describe("the Naga Shot's keeper", () => {
  it('stands his ground until the Naga comes at him', () => {
    for (const clock of everyClock(FULL).filter((each) => each.stage === 'flight')) {
      expect(keeperAt(clock, 'catch')).toMatchObject({ ...KEEPER_SPOT, animation: 'idle' });
    }
  });

  it.each(['catch', 'punch', 'parry'])(
    'meets the ball with his gloves at the top of his dive on a %s',
    (ending) => {
      const contact = firstOf(FULL, 'collision');
      const keeper = keeperAt(contact, ending);

      expect(keeper).toMatchObject({ animation: 'dive', frame: 3 });
      expect(keeper.hands.x).toBeCloseTo(CONTACTS[ending].x, 0);
      expect(keeper.hands.y).toBeCloseTo(CONTACTS[ending].y, 0);
      expect(ballAt(contact, ending)).toMatchObject({ x: keeper.hands.x, y: keeper.hands.y });
    },
  );

  it('goes too late on a goal', () => {
    expect(keeperAt(firstOf(FULL, 'collision'), 'goal').frame).toBeLessThan(3);
  });

  it.each(['goal', 'catch', 'punch', 'parry', 'post'])(
    'ends down on the grass after a %s',
    (ending) => {
      expect(keeperAt(lastOf(FULL, 'aftermath'), ending)).toMatchObject({
        animation: 'dive',
        y: KEEPER_SPOT.y,
      });
    },
  );

  it('is lit most by the Naga as it meets him, and it fades after', () => {
    const lit = (clock) => keeperAt(clock, 'goal').lit;

    expect(lit(firstOf(FULL, 'awakening'))).toBe(0);
    expect(lit(lastOf(FULL, 'keeper'))).toBeGreaterThan(lit(firstOf(FULL, 'keeper')));
    expect(lit(firstOf(FULL, 'collision'))).toBe(1);
    expect(lit(lastOf(FULL, 'aftermath'))).toBe(0);
  });
});
