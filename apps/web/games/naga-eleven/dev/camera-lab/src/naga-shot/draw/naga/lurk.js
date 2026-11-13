import { hash } from '../../../../../../src/render/duel/hash.js';
import { SHOT_ART } from '../../colors.js';
import { drawGlint } from './glint.js';

// 1 to 4 the fire from rim to core, k the slit of a pupil; the right eye is this one mirrored
const EYE = ['11111........', '.12233k211...', '..12344k43221', '...1233k33222', '....111222211'];

const WIDTH = EYE[0].length;

const FIRE = [null, SHOT_ART.eye[0], SHOT_ART.eye[1], SHOT_ART.eye[2], SHOT_ART.flash];

const OPENING = [[2], [1, 2, 3], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];

function colourOf(mark, { step, flicker }) {
  if (mark === 'k') {
    return step === 4 ? SHOT_ART.ink : FIRE[Math.min(step, 3)];
  }

  const heat = Math.min(Number(mark), step);

  return FIRE[heat === 4 && flicker ? 3 : heat];
}

function drawEye(pen, { left, top, mirror, step, flicker }) {
  OPENING[step - 1].forEach((row) => {
    [...EYE[row]].forEach((mark, i) => {
      if (mark !== '.') {
        pen.dot(
          mirror ? left + WIDTH - 1 - i : left + i,
          top + row,
          colourOf(mark, { step, flicker }),
        );
      }
    });
  });
}

const GAP = 6;

const PUPIL = { across: 6, down: 1 };

export function drawLurkingEyes(pen, { x, y, eyes, lit }) {
  const step = Math.min(4, 1 + Math.floor(eyes * 4));
  const flicker = hash(Math.floor(lit / 3), 91) < 0.3;
  const top = Math.round(y) - 2;
  const lefts = [Math.round(x) - GAP - WIDTH, Math.round(x) + GAP];

  drawEye(pen, { left: lefts[0], top, mirror: false, step, flicker });
  drawEye(pen, { left: lefts[1], top, mirror: true, step, flicker });
  drawGlint(pen, { x: lefts[0] + PUPIL.across, y: top + PUPIL.down, since: lit });
  drawGlint(pen, {
    x: lefts[1] + WIDTH - 1 - PUPIL.across,
    y: top + PUPIL.down,
    since: lit - 4,
  });
}
