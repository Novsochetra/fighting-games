import { describe, expect, it } from 'vitest';

import { DIVE_INKS } from '../../../src/art/save-cam/keeper-dive/index.js';
import { BEATS, contactTick } from '../../../src/render/save-cam/timing.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { drawnSaveCam, pixelsIn } from '../../support/save-cam-pixels.js';

// The move's beast was drawn over the diving keeper: the Flying Naga's head (tick 32, the Asian
// stadium), the Garuda's wings (the World stadium) and the Seven-Headed Naga (tick 22, the keeper
// hidden whole) lay over his head and his reaching gloves, so the dive did not read. From his
// push-off on the beast goes behind him and the ball stays in front: his gloves and the whites of
// his eyes show as much as with a plain shot, whose streak hides nothing of him
const BEASTS = ['seven-headed-naga', 'flying-naga', 'garuda-volley', 'naga-shot', 'twin-naga'];

const KEEPER = ['G', 'H', 'I', 'J', 'E'].map((letter) => DIVE_INKS[letter]);

// through the stretch to the contact, and on through the hold once the flash has gone
const TICKS = [34, 36, 38, 39, contactTick() + BEATS.hitStop, contactTick() + BEATS.hitStop + 4];

const SAVES = [
  { result: 'saved', style: 'catch', aim: { side: 0.5, height: 0.6 }, dive: 1 },
  { result: 'parried', style: 'punch', aim: { side: -0.45, height: 0.85 }, dive: -1 },
];

const keeperShowing = (move, save, ticks) =>
  pixelsIn(
    drawnSaveCam(fakeMatch({ seed: 2 }), { shooter: 4, keeper: 5, move, ...save }, { ticks })
      .colourAt,
    KEEPER,
  ).length;

describe('the move’s beast keeps clear of the diving keeper', () => {
  it.each(BEASTS)('%s', (move) => {
    for (const save of SAVES) {
      for (const ticks of TICKS) {
        const plain = keeperShowing('power-shot', save, ticks);

        expect(plain, `${save.result} ${ticks}`).toBeGreaterThan(20);
        expect(keeperShowing(move, save, ticks), `${save.result} ${ticks}`).toBeGreaterThanOrEqual(
          plain,
        );
      }
    }
  });
});
