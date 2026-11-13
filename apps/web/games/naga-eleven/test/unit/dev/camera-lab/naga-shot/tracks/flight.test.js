import { describe, expect, it } from 'vitest';

import {
  flightPoint,
  flightShare,
  launchPoint,
} from '../../../../../../dev/camera-lab/src/naga-shot/tracks/flight.js';
import { CONTACTS, ENDINGS } from '../../../../../../dev/camera-lab/src/naga-shot/world.js';
import { everyClock, EVERY_CASE } from '../every-clock.js';

describe("the Naga Shot's flight", () => {
  it.each(EVERY_CASE)(
    'is not under way before the kick, and only grows after (%s)',
    (_, settings) => {
      const clocks = everyClock(settings);
      const shares = clocks.map(flightShare);
      const flown = shares.filter((share) => share !== null);
      const buildUp = clocks.filter((clock) =>
        ['awakening', 'charge', 'manifest'].includes(clock.stage),
      );

      expect(buildUp.map(flightShare).every((share) => share === null)).toBe(true);
      flown.slice(1).forEach((share, i) => expect(share).toBeGreaterThanOrEqual(flown[i]));
      expect(flown.at(-1)).toBe(1);
    },
  );

  it.each(ENDINGS)('leaves the boot and meets the goal where %s says', (ending) => {
    expect(flightPoint(ending, 0)).toEqual(launchPoint());
    expect(flightPoint(ending, 1)).toEqual(CONTACTS[ending]);
  });

  it('rears up over the field on its way', () => {
    const top = flightPoint('goal', 0.5);

    expect(top.y).toBeLessThan(Math.min(launchPoint().y, CONTACTS.goal.y) - 30);
  });
});
