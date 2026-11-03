import { describe, expect, it } from 'vitest';
import { SAVE_CAM } from '../../../../src/data/save-cam.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { attachDuels } from '../../../../src/sim/duel/index.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { tick } from '../../../../src/sim/tick.js';
import { createDecentHuman } from '../../../support/decent-human/index.js';

// a whole match, the decent player on side 0 when one is watching: every save cam, and the
// longest the match stood still for one
function playWatchingCams(seed, { watched }) {
  const match = attachDuels(createMatch({ seed, humanTeam: watched ? 0 : null }), { watched });
  const human = watched ? createDecentHuman(seed) : null;
  const seen = { cams: [], longest: 0 };

  while (match.phase !== 'over') {
    human?.step(match);
    tick(match);

    for (const event of drainEvents(match).filter((each) => each.type === 'saveCam')) {
      seen.cams.push({ seed, tick: match.tick, half: match.half, moment: event.moment });
    }

    seen.longest = Math.max(seen.longest, match.phase === 'saveCam' ? match.phaseTicks : 0);
  }

  return seen;
}

describe('the save cam in whole matches', () => {
  const played = [1, 2, 3].map((seed) => playWatchingCams(seed, { watched: true }));
  const cams = played.flatMap((seen) => seen.cams);

  it('pauses a watched match now and then, for a moment the show can draw', () => {
    expect(cams.length).toBeGreaterThan(0);

    for (const { moment } of cams) {
      expect(['saved', 'parried', 'goal']).toContain(moment.result);
      expect(Number.isInteger(moment.shooter)).toBe(true);
      expect(['catch', 'punch', 'wall']).toContain(moment.style);
    }
  });

  it('keeps to its limits: far apart, a couple a half, and over within its time', () => {
    for (const seed of [1, 2, 3]) {
      const own = cams.filter((cam) => cam.seed === seed);

      for (const half of [1, 2]) {
        expect(own.filter((cam) => cam.half === half).length).toBeLessThanOrEqual(
          SAVE_CAM.mostPerHalf,
        );
      }

      own
        .slice(1)
        .forEach((cam, i) =>
          expect(cam.tick - own[i].tick).toBeGreaterThanOrEqual(SAVE_CAM.gapTicks),
        );
    }

    expect(Math.max(...played.map((seen) => seen.longest))).toBeLessThanOrEqual(SAVE_CAM.timeout);
  });

  it('never stops a match nobody watches', () => {
    expect(playWatchingCams(1, { watched: false })).toEqual({ cams: [], longest: 0 });
  });
});
