import { polygon } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { phaseOf } from '../../tracks/ease.js';
import { dotLine } from './kit.js';

const SHOWN = { from: 0.16, to: 0.52 };

const BESIDE_HEAD = { x: 11, y: -68 };

function wedge(pen, { x, y, pad, color }) {
  polygon(
    pen,
    [
      [x - 2 - pad, y - pad],
      [x + 4 + pad, y - pad],
      [x + 2 + pad, y + 12 + pad],
      [x - pad, y + 12 + pad],
    ],
    color,
  );
  pen.rect([x - pad, y + 14 - pad, 3 + pad * 2, 3 + pad * 2], color);
}

const BURSTS = [
  [-7, -1, -11, -5],
  [-2, -4, -3, -9],
  [7, -1, 11, -5],
];

export function drawAlert(pen, { keeper, clock }) {
  const shown = phaseOf(clock.share, SHOWN.from, SHOWN.to - SHOWN.from);

  if (shown <= 0 || shown >= 1) {
    return;
  }

  const popped = Math.max(0, 3 - Math.floor(clock.ticks - SHOWN.from * clock.length));
  const x = Math.round(keeper.x + BESIDE_HEAD.x);
  const y = Math.round(keeper.y + BESIDE_HEAD.y - popped);

  wedge(pen, { x, y, pad: 1, color: SHOT_ART.ink });
  wedge(pen, { x, y, pad: 0, color: SHOT_ART.gold[3] });
  pen.rect([x - 1, y, 2, 6], SHOT_ART.white);

  BURSTS.forEach(([fromX, fromY, toX, toY]) => {
    dotLine(pen, {
      from: { x: x + fromX, y: y + fromY },
      to: { x: x + toX, y: y + toY },
      color: SHOT_ART.white,
    });
  });
}
