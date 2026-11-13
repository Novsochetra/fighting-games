import { hash } from '../../../../../../src/render/duel/hash.js';
import { headPoint } from '../../../../../../src/render/duel/looks/naga-head.js';
import { band } from '../../../../../../src/render/duel/shapes.js';
import { ENERGY_HEX } from './pixels.js';

const { eye, ember, flash, white } = ENERGY_HEX;

// in head sizes from its middle, as the duel's looks/naga-face.js draws it
const PUPIL = [5, -2.6];

// The eye leaves a streak of its fire behind it as the Naga flies, the way a hero's eyes do in the
// old anime games, and longer as it comes at the keeper; it is broken here and there as it burns.
const STEPS = [
  { until: 0.25, color: ember[4], width: 2 },
  { until: 0.55, color: eye[1], width: 2 },
  { until: 1, color: eye[0], width: 1 },
];

function drawStreak(sheet, { from, angle, burn, frame }) {
  const length = 8 + 24 * burn;
  const thick = burn > 0.4 ? 1 : 0;
  const back = { x: -Math.cos(angle), y: -Math.sin(angle) - 0.12 };
  const pieces = Math.max(2, Math.round(length / 2));

  for (let i = 0; i < pieces; i += 1) {
    const share = i / pieces;
    const step = STEPS.find(({ until }) => share < until);
    const near = { x: from.x + back.x * share * length, y: from.y + back.y * share * length };
    const far = { x: near.x + back.x * (length / pieces), y: near.y + back.y * (length / pieces) };

    if (share < 0.3 || hash(i, Math.floor(frame / 2), 41) > share * 0.5) {
      band(sheet, { from: near, to: far, width: step.width + thick, color: step.color });
    }
  }
}

function drawGlint(sheet, { at, burn, frame }) {
  const flare = burn > 0.5 || hash(Math.floor(frame / 4), 43) < 0.12;
  const reach = Math.round(2 + 4 * burn) + (frame % 4 < 2 ? 1 : 0);

  if (!flare) {
    return;
  }

  sheet.rect([at.x - reach, at.y, reach * 2 + 1, 1], flash);
  sheet.rect([at.x, at.y - reach, 1, reach * 2 + 1], flash);
  sheet.rect([at.x - 1, at.y, 3, 1], eye[2]);
  sheet.dot(at.x, at.y, white);
}

export function drawBurningEye(sheet, { place, burn, frame }) {
  const middle = headPoint(place, PUPIL);
  const at = { x: Math.round(middle.x), y: Math.round(middle.y) };

  drawStreak(sheet, { from: at, angle: place.angle, burn, frame });
  drawGlint(sheet, { at, burn, frame });
}
