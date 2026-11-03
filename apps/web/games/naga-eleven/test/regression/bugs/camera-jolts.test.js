import { describe, expect, it } from 'vitest';
import { UI_SCALE } from '../../../src/config.js';
import { newSave, teamSpecFor } from '../../../src/campaign/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { watchCamera } from '../../support/camera-watch.js';
import { createDecentHuman } from '../../support/decent-human/index.js';

// In an 11 v 11 the pan's pace jumped by 1.5 pixels or more from one frame to the next 19 to 25
// times a minute (3.8, 8.6, 11.3 pixels a frame as a long pass reached the edge of the view),
// 17 to 23 pixels at the worst: the hold that keeps a ball in view grabbed the camera the moment
// the ball got there. The camera now gathers and sheds pace by at most about a view's half pixel
// a tick, a computer's match or a player's, at either size of pitch.
const STORY_SIDES = { 7: ['chrey-school', 'royal-kids'], 11: ['cambodia-youth', 'japan-youth'] };
const MOST_CHANGE = 0.75 * UI_SCALE;
const USUAL_CHANGE = 0.3 * UI_SCALE;

function played(format, seed, human) {
  if (!human) {
    return watchCamera(createMatch({ seed, format, halfSeconds: 60 }));
  }

  const save = newSave();
  const teams = STORY_SIDES[format].map((id) => teamSpecFor(save, id, TEAMS));
  const match = createMatch({ seed, humanTeam: 0, format, teams, halfSeconds: 60 });

  attachDuels(match);

  return watchCamera(match, { step: createDecentHuman(seed).step });
}

describe.each(['7', '11'])('the pace of the camera over a %s a side match', (format) => {
  it.each([
    ['the computer plays both sides', false],
    ['a player steers one', true],
  ])('never jolts when %s', (_, human) => {
    for (const seed of [1, 3]) {
      const watch = played(format, seed, human);

      expect(watch.sharpestChange).toBeLessThan(MOST_CHANGE);
      expect(watch.sharpChange).toBeLessThan(USUAL_CHANGE);
    }
  });
});
