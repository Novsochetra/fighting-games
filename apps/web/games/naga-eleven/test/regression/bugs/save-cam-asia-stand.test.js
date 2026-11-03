import { describe, expect, it } from 'vitest';

import { ASIA_STADIUM } from '../../../src/art/venues/asia-stadium.js';
import { ART } from '../../../src/render/duel/layout.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { drawnSaveCam, pixelsIn } from '../../support/save-cam-pixels.js';

// The save cam at the Asian stadium stood the World Stadium's night stand behind the goal in
// Asia's colours: one flat dark stand, a lamp in each top corner, a row of boards. It stands the
// venue's own bowl now, as on the pitch: banks of floodlights all along its roof's edge, the ring
// of LED panels in the championship's five colours between its two tiers, and its boards
const MOMENT = { shooter: 4, keeper: 5, move: 'power-shot', result: 'saved', aim: { side: 0.6 } };

const asia = () =>
  drawnSaveCam(fakeMatch({ seed: 2 }), MOMENT, { ticks: 4, venue: 'asia-stadium' }).colourAt;

// the rows between the tiers, and those the floodlights hang in under the roof's edge
const RING_ROWS = { x: 0, y: 40, width: ART.width, height: 30 };
const LAMP_ROWS = { x: 0, y: 28, width: ART.width, height: 12 };

describe('the save cam at the Asian stadium stands its own bowl', () => {
  it('rings the stand between its tiers with all five of its panels’ colours', () => {
    const colourAt = asia();

    for (const { back } of ASIA_STADIUM.ads) {
      expect(pixelsIn(colourAt, [back], RING_ROWS).length, back).toBeGreaterThanOrEqual(6);
    }
  });

  it('hangs banks of floodlights all along its roof’s edge, not only in the corners', () => {
    const colourAt = asia();
    const lamps = pixelsIn(colourAt, [ASIA_STADIUM.lamp], LAMP_ROWS);
    const across = new Set(lamps.map(({ x }) => Math.floor(x / 64)));

    expect(across.size).toBe(4);
  });
});
