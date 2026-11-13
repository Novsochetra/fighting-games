import { SHOT_ART } from '../../colors.js';

const FLARE = [1, 3, 5, 7, 6, 4, 3, 2, 1];

const WINK = { every: 22, arms: [2, 3, 2] };

function armsAt(since) {
  if (since < 0) {
    return 0;
  }

  if (since < FLARE.length) {
    return FLARE[since];
  }

  return WINK.arms[(since - FLARE.length) % WINK.every] ?? 0;
}

function cross(pen, { x, y, reach, color }) {
  pen.rect([x - reach, y, reach * 2 + 1, 1], color);
  pen.rect([x, y - reach, 1, reach * 2 + 1], color);
}

export function drawGlint(pen, { x, y, since }) {
  const arms = armsAt(since);

  if (arms <= 0) {
    return;
  }

  cross(pen, { x, y, reach: arms, color: SHOT_ART.gold[2] });
  cross(pen, { x, y, reach: Math.ceil(arms / 2), color: SHOT_ART.gold[3] });
  cross(pen, { x, y, reach: Math.floor(arms / 3), color: SHOT_ART.white });

  if (arms >= 5) {
    [-1, 1].forEach((dx) => [-1, 1].forEach((dy) => pen.dot(x + dx, y + dy, SHOT_ART.gold[3])));
  }

  pen.dot(x, y, SHOT_ART.white);
}
