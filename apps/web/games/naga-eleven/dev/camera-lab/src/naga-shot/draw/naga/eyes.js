import { drawInked } from '../../../../../../src/render/duel/looks/naga-ink.js';
import { shiftedPen } from '../../../../../../src/render/duel/pen.js';
import { NAGA_ART, SHOT_ART } from '../../colors.js';
import { eyeMiddle, eyeParts } from './figure.js';
import { drawGlint } from './glint.js';

const [EMBER, FIRE, WHITE_HOT] = SHOT_ART.eye;

// lid, iris and pupil, from a smoulder to white-hot
const KINDLING = [
  [EMBER, EMBER, FIRE],
  [EMBER, FIRE, FIRE],
  [EMBER, FIRE, WHITE_HOT],
];

const CATCHING = { ticks: 3, eye: [FIRE, WHITE_HOT, SHOT_ART.flash] };

const kindlingOf = (eyes, lit) =>
  lit >= 0 && lit < CATCHING.ticks ? CATCHING.eye : KINDLING[Math.min(2, Math.floor(eyes * 3))];

// the bake has the eye dark, so it is lit over it; `lit` is ticks since it caught
export function drawEyeFire(pen, { at, size, eyes, lit }) {
  const art = { ...NAGA_ART, eye: kindlingOf(eyes, lit) };
  const middle = eyeMiddle(size);

  drawInked(shiftedPen(pen, at.x, at.y), eyeParts({ size, art }));
  drawGlint(pen, { x: at.x + Math.round(middle.x), y: at.y + Math.round(middle.y), since: lit });
}
