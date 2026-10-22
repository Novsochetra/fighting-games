import { markPillars } from '../hazards/gaze-pillars.js';
import { burstRoots } from '../hazards/fig-roots.js';
import { raiseFace } from '../hazards/stone-faces.js';
import { collapse, reform } from './crumble.js';

const faceAt = (move, time) => move.faces?.find((face) => face.at === time);

// the Bayon Guardian's beats, read with the other bosses' in move-cues.js: the gaze marks its
// spots, the fists drive the roots up, the four faces rise in turn, and he crumbles and reforms
export const BAYON_CUES = [
  [(move, time) => time === move.gaze?.lockAt, markPillars],
  [(move, time) => Boolean(move.roots) && time === move.startup, burstRoots],
  [
    (move, time) => Boolean(faceAt(move, time)),
    (game, boss, move, time) => raiseFace(game, boss, faceAt(move, time).side),
  ],
  [(move, time) => time === move.collapseAt, collapse],
  [(move, time) => time === move.reformAt, reform],
];
