import { DUEL_INK, GOAL_ART, PENALTY_ART } from '../../art/duel/palette.js';
import { hash } from './hash.js';
import { ART, INNER } from './layout.js';
import { PEN_GOAL } from './penalty-layout.js';
import { polygon } from './shapes.js';

// rows of the crowd under the lights, a few of them jumping on every beat
function stands(pen, tick) {
  const [night, dusk, haze] = PENALTY_ART.sky;

  pen.rect([0, INNER.top, ART.width, PEN_GOAL.bar + 10 - INNER.top], night);
  pen.rect([0, INNER.top + 8, ART.width, 4], dusk);

  for (let y = INNER.top + 12; y < PEN_GOAL.bar + 10; y += 3) {
    for (let x = (y % 2) * 2; x < ART.width; x += 4) {
      const hop = hash(x, y, Math.floor(tick / 10)) < 0.1 ? 1 : 0;
      const color = PENALTY_ART.crowd[Math.floor(hash(x, y) * PENALTY_ART.crowd.length)];

      pen.rect([x, y - hop, 2, 2], color);
    }
  }

  pen.rect([0, PEN_GOAL.bar + 9, ART.width, 2], haze);
}

function grass(pen) {
  const [deep, dark, mid, light] = PENALTY_ART.grass;
  const top = PEN_GOAL.bar + 11;

  pen.rect([0, top, ART.width, INNER.bottom - top], dark);

  for (let y = top; y < INNER.bottom; y += 8) {
    pen.rect([0, y, ART.width, 4], (y / 8) % 2 ? mid : dark);
  }

  pen.rect([0, PEN_GOAL.line - 2, ART.width, 2], deep);
  pen.rect([0, PEN_GOAL.line, ART.width, 1], PENALTY_ART.line);
  polygon(
    pen,
    [
      [14, INNER.bottom],
      [60, PEN_GOAL.line + 1],
      [62, PEN_GOAL.line + 1],
      [17, INNER.bottom],
    ],
    PENALTY_ART.line,
  );
  polygon(
    pen,
    [
      [242, INNER.bottom],
      [196, PEN_GOAL.line + 1],
      [194, PEN_GOAL.line + 1],
      [239, INNER.bottom],
    ],
    PENALTY_ART.line,
  );
  pen.rect([124, 121, 8, 3], light);
}

// the goal face on: the net's mesh, then the posts and bar, lit on their left
export function drawPenaltyGoal(pen, { bulge = { x: 0, y: 0, size: 0 } }) {
  const { left, right, bar, line } = PEN_GOAL;

  pen.context.save();
  pen.context.globalAlpha *= 0.45;

  for (let y = bar + 4; y < line; y += 5) {
    pen.rect(
      [left + 3, y + (Math.abs(y - bulge.y) < 10 ? -bulge.size / 3 : 0), right - left - 6, 1],
      GOAL_ART.mesh,
    );
  }

  for (let x = left + 5; x < right - 3; x += 5) {
    pen.rect([x, bar + 3, 1, line - bar - 3], GOAL_ART.mesh);
  }

  pen.context.restore();

  const [shade, base, light] = GOAL_ART.post;

  pen.rect([left - 4, bar - 4, right - left + 8, 6], DUEL_INK);
  pen.rect([left - 4, bar - 4, 6, line - bar + 4], DUEL_INK);
  pen.rect([right - 2, bar - 4, 6, line - bar + 4], DUEL_INK);
  pen.rect([left - 3, bar - 3, right - left + 6, 4], base);
  pen.rect([left - 3, bar - 3, right - left + 6, 1], light);
  pen.rect([left - 3, bar - 3, 4, line - bar + 3], base);
  pen.rect([left - 3, bar - 3, 1, line - bar + 3], light);
  pen.rect([right - 1, bar - 3, 4, line - bar + 3], shade);
  pen.rect([right - 1, bar - 3, 1, line - bar + 3], base);
}

export function drawPenaltyGround(pen, tick) {
  stands(pen, tick);
  grass(pen);
}
