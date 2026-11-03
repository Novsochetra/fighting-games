import { describe, expect, it } from 'vitest';

import { ART, UNIT } from '../../../src/render/duel/layout.js';
import { SAVE_CAM_VENUES } from '../../../src/render/save-cam/backdrops/index.js';
import { shakeOf } from '../../../src/render/save-cam/effects.js';
import { createSaveCam, drawSaveCam } from '../../../src/render/save-cam/index.js';
import { BEATS, contactTick } from '../../../src/render/save-cam/timing.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// In open play the save cam is drawn over the match. Its shake at the contact moved the whole
// scene a pixel or two, and the strip of the view it left uncovered showed the live pitch under it
// (the National stadium, a Kite Header); and the night stadiums' stand stopped two rows short of
// its boards, where the pitch showed all the while. The venue now fills the view between the
// film's bars, still or shaking
const PITCH = [255, 0, 255];

// the ticks the view shakes once its flash has gone, so nothing is laid over the strip but the cam
const SHAKEN = Array.from({ length: 6 }, (_, i) => contactTick() + BEATS.hitStop + i).filter(
  (ticks) => shakeOf(ticks).x !== 0 || shakeOf(ticks).y !== 0,
);

function pitchShowing(venue, ticks) {
  const canvas = createPixelCanvas(ART.width * UNIT, ART.height * UNIT);
  const context = canvas.getContext('2d');
  const cam = createSaveCam(
    fakeMatch({ seed: 2 }),
    {
      shooter: 4,
      keeper: 5,
      move: 'kite-header',
      result: 'saved',
      aim: { side: 0.4, height: 0.6 },
    },
    { length: 90, venue },
  );
  let showing = 0;

  context.fillStyle = `rgb(${PITCH.join(',')})`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  cam.ticks = ticks;
  drawSaveCam(context, cam, { tick: ticks });

  for (let at = 0; at < canvas.data.length; at += 4) {
    if (PITCH.every((value, i) => canvas.data[at + i] === value)) {
      showing += 1;
    }
  }

  return showing;
}

describe('the save cam covers the whole view, still or shaking', () => {
  it('shakes on some ticks after its flash', () => {
    expect(SHAKEN.length).toBeGreaterThan(0);
  });

  it.each(SAVE_CAM_VENUES)('at %s', (venue) => {
    for (const ticks of [20, ...SHAKEN]) {
      expect(pitchShowing(venue, ticks), `${ticks}`).toBe(0);
    }
  });
});
