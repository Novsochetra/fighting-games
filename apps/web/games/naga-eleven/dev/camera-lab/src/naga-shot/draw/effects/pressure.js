import { hash } from '../../../../../../src/render/duel/hash.js';
import { band } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { rampLine } from './kit.js';

const LINES = 40;

const RAMPS = [
  [SHOT_ART.emerald[2], SHOT_ART.emerald[3], SHOT_ART.emerald[4]],
  [SHOT_ART.emerald[3], SHOT_ART.emerald[4], SHOT_ART.white],
];

function pressureLine(pen, { i, beat, centre, inner }) {
  const angle = ((i + hash(i, beat, 162) * 0.7) / LINES) * Math.PI * 2;
  const near = inner + hash(i, beat, 163) * 18;
  const far = near + 26 + hash(i, 164) * 70;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const head = { x: centre.x + cos * near, y: centre.y + sin * near };
  const tail = { x: centre.x + cos * far, y: centre.y + sin * far };

  if (i % 5 === 0) {
    band(pen, { from: head, to: tail, width: 2, color: SHOT_ART.emerald[2] });
  }

  rampLine(pen, { head, tail, ramp: RAMPS[i % 3 === 0 ? 1 : 0] });
}

// a comic's lines closing on what matters, but of a fixed width in art pixels, so a wide view
// draws them as thin as a close one
export function drawPressureLines(pen, { centre, inner, tick, strength }) {
  const beat = Math.floor(tick / 2);

  for (let i = 0; i < LINES; i += 1) {
    if (hash(i, beat, 161) <= strength) {
      pressureLine(pen, { i, beat, centre, inner });
    }
  }
}
