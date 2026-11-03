import { describe, expect, it } from 'vitest';

import { LOOK_ART } from '../../../src/art/duel/looks.js';
import { INNER } from '../../../src/render/duel/layout.js';
import { FRAME } from '../../../src/render/save-cam/view.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { drawnSaveCam, pixelsIn } from '../../support/save-cam-pixels.js';

// The lines rushing in on the aim were the duel's, wedges as wide as a finger at the view's edge in
// the move's deep colour: thick brown spokes across the sky and the venue on every plain shot or
// Power Shot and on the Seven-Headed Naga, plainest at the village field and the provincial
// ground. They are thin now, in the move's palest light, and the venue shows through them
const SHOTS = [
  { move: 'power-shot', look: 'plain', venues: ['village-field', 'provincial-ground'] },
  { move: 'seven-headed-naga', look: 'seven-naga', venues: ['village-field', 'world-stadium'] },
];

// the sky and the stand to the left of the goal, which the ball and its beast never cross
const LEFT = { x: 0, y: INNER.top, width: FRAME.left - 8, height: FRAME.line - INNER.top };

function deepIn({ move, look }, venue, ticks) {
  const { colourAt } = drawnSaveCam(
    fakeMatch({ seed: 2 }),
    { shooter: 4, keeper: 5, move, result: 'saved', aim: { side: 0.5, height: 0.6 }, dive: 1 },
    { ticks, venue },
  );

  return pixelsIn(colourAt, LOOK_ART[look].body.slice(0, 2), LEFT).length;
}

describe('the save cam’s focus lines are thin and light', () => {
  it.each(SHOTS.flatMap((shot) => shot.venues.map((venue) => [shot.move, venue, shot])))(
    '%s at %s',
    (_, venue, shot) => {
      for (const ticks of [24, 30, 36]) {
        expect(deepIn(shot, venue, ticks), `${ticks}`).toBe(0);
      }
    },
  );
});
