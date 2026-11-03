import { describe, expect, it } from 'vitest';

import { SAVE_CAM_ART } from '../../../src/art/save-cam.js';
import { SAVE_CAM_SCHOOL } from '../../../src/art/save-cam/venues/school.js';
import { SAVE_CAM_VILLAGE } from '../../../src/art/save-cam/venues/village.js';
import { INNER, UNIT } from '../../../src/render/duel/layout.js';
import { drawSaveCam } from '../../../src/render/save-cam/index.js';
import { FRAME } from '../../../src/render/save-cam/view.js';
import { stepMatchShows } from '../../../src/ui/flow/match-shows.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// The save cam and the keeper duel always stood at night, under the floodlights, a white metal
// goal in front of the stand, even at the daytime village field with its bamboo goals and the
// school stadium at sunset. The cam now stands at the match's own venue: the village's morning
// sky over its bamboo goal, the school's sunset over its white one
const hexAt = (canvas, x, y) => {
  const at = ((y * UNIT + 1) * canvas.width + x * UNIT + 1) * 4;

  return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

// open play pauses for a save at the session's venue and the show draws it
function savedAt(venue) {
  const match = fakeMatch();
  const session = { match, venue, duelShow: null, saveCamShow: null };
  const canvas = createPixelCanvas(768, 432);

  Object.assign(match, {
    phase: 'saveCam',
    saveCam: {
      shooter: 4,
      keeper: 5,
      move: 'naga-shot',
      result: 'saved',
      aim: { side: 0.6, height: 0.5 },
    },
  });
  stepMatchShows(session, {});
  drawSaveCam(canvas.getContext('2d'), session.saveCamShow, { tick: 1, bars: false });

  return (x, y) => hexAt(canvas, x, y);
}

// a bit of clear sky over the bar, and the left post halfway up it
const SKY = { x: 128, y: INNER.top + 2 };

describe('the save cam stands at the match’s own venue', () => {
  it('at the village field: the morning sky, and the bamboo goal', () => {
    const colourAt = savedAt('village-field');

    expect(SAVE_CAM_VILLAGE.sky).toContain(colourAt(SKY.x, SKY.y));
    expect(SAVE_CAM_ART.sky).not.toContain(colourAt(SKY.x, SKY.y));
    expect(SAVE_CAM_VILLAGE.goal.post).toContain(colourAt(FRAME.left - 2, 70));
    expect(SAVE_CAM_ART.post).not.toContain(colourAt(FRAME.left - 2, 70));
  });

  it('at the school stadium: the sunset sky over the terraces', () => {
    const colourAt = savedAt('city-school-stadium');
    const clear = { x: 96, y: SKY.y };

    expect(SAVE_CAM_SCHOOL.sky).toContain(colourAt(clear.x, clear.y));
    expect(SAVE_CAM_ART.sky).not.toContain(colourAt(clear.x, clear.y));
  });

  it('at the World Stadium: the floodlit night, as before', () => {
    const colourAt = savedAt('world-stadium');

    expect(colourAt(SKY.x, SKY.y)).toBe(SAVE_CAM_ART.sky[0]);
    expect(SAVE_CAM_ART.post).toContain(colourAt(FRAME.left - 2, 70));
  });
});
