import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawParts } from '../../duel/parts.js';
import { headingAt } from './path.js';

function feather(root, { turn, length, width, color }) {
  const tip = { x: root.x + Math.cos(turn) * length, y: root.y + Math.sin(turn) * length };
  const side = { x: -Math.sin(turn) * width, y: Math.cos(turn) * width };

  return {
    kind: 'poly',
    points: [
      [root.x + side.x * 0.5, root.y + side.y * 0.5],
      [root.x + (tip.x - root.x) * 0.6 + side.x, root.y + (tip.y - root.y) * 0.6 + side.y],
      [tip.x, tip.y],
      [root.x - side.x * 0.5, root.y - side.y * 0.5],
    ],
    color,
  };
}

// Garuda's wings spread either side of the ball, beating, feathers in rows of red, orange, gold
export function wings(pen, { points, art, tick }) {
  const ball = points.at(-1);
  const near = points[Math.max(0, points.length - 4)];
  const { side } = headingAt(points, points.length - 1);
  const base = Math.atan2(side.y, side.x);
  const flap = Math.sin(tick / 3) * 0.35;
  const span = Math.max(10, near.radius * 7);
  const rows = [
    { length: 1, color: art.body[2] },
    { length: 0.72, color: art.body[3] },
    { length: 0.42, color: art.accent[2] },
  ];

  const feathers = [-1, 1].flatMap((wing) =>
    rows.flatMap((row) =>
      Array.from({ length: 6 }, (_, i) =>
        feather(ball, {
          turn:
            base + (wing < 0 ? Math.PI : 0) + (i / 5 - 0.5) * 0.9 * wing + flap * wing - 0.3 * wing,
          length: span * row.length * (0.7 + i * 0.06),
          width: span * 0.08,
          color: row.color,
        }),
      ),
    ),
  );

  drawParts(pen, feathers);
  pen.rect([ball.x - 1, ball.y - ball.radius - 3, 3, 2], DUEL_UI.white);
}
