import { DUEL_UI } from '../../../art/duel/palette.js';
import { hash } from '../../duel/hash.js';
import { drawBolt } from '../../duel/looks/bolt.js';
import { band, ring } from '../../duel/shapes.js';

// a hot streak tapering into the distance after the ball, white at its core, rings of air
// peeling off it
export function streak(pen, { points, art, tick }) {
  points.slice(1).forEach((to, i) => {
    const from = points[i];
    const width = to.radius * 1.6 * ((i + 1) / points.length);

    band(pen, { from, to, width: width + 2, color: art.body[2] });
    band(pen, { from, to, width, color: art.body[3] });
    band(pen, { from, to, width: Math.max(1, width * 0.45), color: art.body[4] });
  });

  points.forEach((at, i) => {
    if ((i + Math.floor(tick / 2)) % 5 === 0 && i < points.length - 2) {
      ring(pen, { x: at.x, y: at.y, radius: at.radius * 1.6, width: 1, color: art.body[3] });
    }
  });
}

// tongues of fire licking back off the ball, flickering, confetti thrown off them
export function flame(pen, { points, art, tick }) {
  const shades = [1, 2, 3, 4];

  shades.forEach((shade, layer) => {
    points.slice(1).forEach((to, i) => {
      const flicker = hash(i, layer, Math.floor(tick / 2), 211) * 0.5 + 0.75;
      const width = to.radius * (3 - layer * 0.6) * ((i + 1) / points.length) * flicker;

      band(pen, { from: points[i], to, width, color: art.body[shade] });
    });
  });

  for (let i = 0; i < 14; i += 1) {
    const at = points[Math.floor(hash(i, 212) * points.length)];
    const drift = (tick + i * 5) % 20;

    pen.rect(
      [at.x + (hash(i, 213) - 0.5) * at.radius * 5, at.y + drift * 0.5, 2, 1],
      art.accent[i % 4],
    );
  }
}

// a jagged bolt from far back along the way to the ball, crackling
export function bolt(pen, { points, art, tick }) {
  drawBolt(pen, { from: points[0], to: points.at(-1), art, width: 2, seed: 7, tick, forks: 3 });

  for (let i = 0; i < 6; i += 1) {
    const ball = points.at(-1);
    const angle = hash(i, Math.floor(tick / 2), 214) * Math.PI * 2;

    pen.rect(
      [
        ball.x + Math.cos(angle) * ball.radius * 2,
        ball.y + Math.sin(angle) * ball.radius * 2,
        2,
        2,
      ],
      i % 2 ? art.accent[2] : DUEL_UI.white,
    );
  }
}

// a river of light carrying the ball, widest where it is nearest, light running down it
export function river(pen, { points, art, tick }) {
  const [deep, dark, mid, light, core] = art.body;

  points.slice(1).forEach((to, i) => {
    const from = points[i];
    const width = to.radius * 2.6;

    band(pen, { from, to, width: width + 2, color: deep });
    band(pen, { from, to, width, color: dark });
    band(pen, { from, to, width: width * 0.6, color: mid });

    if ((i + Math.floor(tick / 2)) % 3 === 0) {
      band(pen, { from, to, width: Math.max(1, width * 0.25), color: light });
    }

    if (hash(i, Math.floor(tick / 3), 215) < 0.25) {
      pen.rect([to.x - 1, to.y - 1, 3, 1], art.accent[3]);
      pen.dot(to.x, to.y - 2, core);
    }
  });
}
