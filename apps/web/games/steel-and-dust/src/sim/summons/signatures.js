import { announceTechnique } from '../fx/technique-announce.js';
import { releaseComboFireflies } from './fireflies.js';
import { chargeComboStags } from './stags.js';
import { raiseComboThorns } from './thorns.js';

// a Shade's style marks some moves with a signature that fires on the strike's first active frame
export const SIGNATURE_STRIKES = [
  [(_fighter, move) => move.technique, announceTechnique],
  [
    (_fighter, move) => move.thorns,
    (game, fighter, move) =>
      raiseComboThorns(game, fighter, {
        count: move.thorns,
        ring: move.thornRing,
        ahead: move.thornsAhead,
      }),
  ],
  [
    (_fighter, move) => move.fireflies,
    (game, fighter, move) => releaseComboFireflies(game, fighter, move.fireflies),
  ],
  [
    (_fighter, move) => move.stags,
    (game, fighter, move) => chargeComboStags(game, fighter, move.stags),
  ],
];
