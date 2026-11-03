import { drawParts } from '../../duel/parts.js';
import { drawEclipse } from '../../duel/looks/eclipse.js';
import { drawKiteTail, kiteParts } from '../../duel/looks/kite.js';
import { band, disc, ring } from '../../duel/shapes.js';

// rings of air spreading quietly where the ball passed, the Silent Moon's
function ripples(pen, { points, art, tick }) {
  points.forEach((at, i) => {
    if ((i + Math.floor(tick / 3)) % 4 === 0 && i < points.length - 1) {
      ring(pen, {
        x: at.x,
        y: at.y,
        radius: at.radius * 2,
        width: 1,
        color: i % 8 ? art.body[2] : art.body[4],
      });
    }
  });
}

// a crescent of light riding the ball, cut from the dark by a second disc
export function crescent(pen, { points, art, tick }) {
  const ball = points.at(-1);
  const radius = Math.max(4, ball.radius * 2.2);

  ripples(pen, { points, art, tick });
  disc(pen, { x: ball.x, y: ball.y, radius: radius + 1, color: art.body[1] });
  disc(pen, { x: ball.x, y: ball.y, radius, color: art.body[4] });
  disc(pen, {
    x: ball.x + radius * 0.45,
    y: ball.y - radius * 0.35,
    radius: radius * 0.95,
    color: art.sky[0],
  });
}

// the moon gone dark round the ball, its corona gold
export function eclipse(pen, { points, art, tick }) {
  const ball = points.at(-1);

  ripples(pen, { points, art: { ...art, body: art.accent.concat(art.accent[3]) }, tick });
  drawEclipse(pen, {
    x: ball.x,
    y: ball.y,
    radius: Math.max(5, ball.radius * 2.4),
    cover: 1,
    art,
    sky: art.sky[0],
    tick,
  });
}

// a sword's arc: a broad sweep of steel light after the ball, curving up off its way, keen and
// white along its edge
export function blade(pen, { points, art }) {
  const sweep = points.map((at, i) => {
    const share = i / Math.max(1, points.length - 1);

    return {
      x: at.x - at.radius * 0.5,
      y: at.y - Math.sin(share * Math.PI) * at.radius * 3.5,
      share,
      radius: at.radius,
    };
  });

  sweep.slice(1).forEach((to, i) => {
    const from = sweep[i];
    const width = Math.max(1, to.radius * 1.4 * Math.sin(to.share * Math.PI) + 1);

    band(pen, { from, to, width: width + 2, color: art.body[1] });
    band(pen, { from, to, width, color: art.body[3] });
    band(pen, {
      from: { x: from.x, y: from.y - width / 3 },
      to: { x: to.x, y: to.y - width / 3 },
      width: 1,
      color: art.body[4],
    });
  });
}

// the khleng kite flying over the ball on its string, its tail down the wind behind
export function kite(pen, { points, art, tick }) {
  const ball = points.at(-1);
  const size = Math.max(0.8, ball.radius / 3);
  const at = { x: ball.x - 4 * size, y: ball.y - 14 * size };
  const tail = points.map((point) => ({
    x: point.x - 4 * size,
    y: point.y - 10 * size + Math.sin(tick / 4 + point.x / 9) * 2,
  }));

  drawKiteTail(pen, {
    points: [...tail, { x: at.x, y: at.y + 10 * size }],
    art,
    size: Math.max(1, size * 0.8),
  });
  band(pen, { from: at, to: ball, width: 1, color: art.body[4] });
  drawParts(pen, kiteParts({ ...at, size, angle: Math.sin(tick / 6) * 0.2, art }));
}

// a kouprey's horns of dust thrown back after the ball toward the camera: two curved rows of
// puffs, sweeping out and up from it, ivory where they are thickest
export function horns(pen, { points, art, tick }) {
  const ball = points.at(-1);
  const reach = Math.min(40, ball.radius * 9);

  [-1, 1].forEach((side) => {
    for (let i = 0; i < 9; i += 1) {
      const share = i / 8;
      const x = ball.x + side * reach * Math.sin(share * 1.3);
      const y = ball.y - reach * 0.55 * Math.sin(share * 2.6) + share * reach * 0.3;
      const radius = Math.max(1, ball.radius * (1.1 - share * 0.7));
      const puff = (tick + i * 3) % 12;

      disc(pen, {
        x: x + side * puff * 0.3,
        y: y - puff * 0.2,
        radius: radius + 1.5,
        color: art.body[1 + (i % 2)],
      });
      disc(pen, { x, y, radius, color: art.accent[share < 0.5 ? 2 : 1] });
    }
  });
  disc(pen, { x: ball.x, y: ball.y, radius: ball.radius + 2, color: art.body[3] });
}
