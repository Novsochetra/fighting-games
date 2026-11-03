import { describe, expect, it } from 'vitest';
import { UI_SCALE } from '../../../src/config.js';
import { newSave, teamSpecFor } from '../../../src/campaign/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { watchCamera } from '../../support/camera-watch.js';
import { createDecentHuman } from '../../support/decent-human/index.js';

// "the camera movement make me so dizzy": the view ran far ahead of the ball and toward the goal
// of whoever had it, so each pass and change of owner swung it a long way, often both ways; it
// tilted after the ball's every step in depth and jolted on each hard shot and save. It turned
// round 30 to 60 times a minute and slid 70 to 120 pixels a second in depth. These lock in the
// calm broadcast camera: it holds still while the play stays in the middle of the view. Pixels
// are the world's, UI_SCALE to each of the view the limits were first set in.
const SEEDS = [1, 2];
const MOST_DEPTH_PER_SECOND = { 7: 40 * UI_SCALE, 11: 60 * UI_SCALE };
const STORY_SIDES = { 7: ['chrey-school', 'royal-kids'], 11: ['cambodia-youth', 'japan-youth'] };

const computerOnly = (format, seed) => watchCamera(createMatch({ seed, format, halfSeconds: 60 }));

// a decent player steering one side, as the user plays
function withHuman(format, seed) {
  const save = newSave();
  const teams = STORY_SIDES[format].map((id) => teamSpecFor(save, id, TEAMS));
  const match = createMatch({ seed, humanTeam: 0, format, teams, halfSeconds: 60 });

  attachDuels(match);

  return watchCamera(match, { step: createDecentHuman(seed).step });
}

describe.each(['7', '11'])('the live camera over a %s a side match', (format) => {
  const watches = [
    ...SEEDS.map((seed) => computerOnly(format, seed)),
    ...SEEDS.map((seed) => withHuman(format, seed)),
  ];

  it('turns round between pans an eye sees at most 24 times a minute along, 13 in depth', () => {
    for (const watch of watches) {
      expect(watch.turnsPerMinute.along).toBeLessThan(24);
      expect(watch.turnsPerMinute.depth).toBeLessThan(13);
    }
  });

  it('pans slowly: nineteen ticks in twenty move the view under 9 of its pixels', () => {
    for (const watch of watches) {
      expect(watch.fastAlong).toBeLessThan(9 * UI_SCALE);
    }
  });

  it('tilts gently in open play', () => {
    for (const watch of watches) {
      expect(watch.depthPerSecondInPlay).toBeLessThan(MOST_DEPTH_PER_SECOND[format]);
    }
  });

  it('seldom turns round when the ball changes feet', () => {
    for (const watch of watches) {
      expect(watch.ownerTurnShare).toBeLessThan(0.33);
    }
  });
});
