import { hash } from '../hash.js';
import { band } from '../shapes.js';

// the bolt's corners: the straight way from one end to the other, broken into steps that jump
// aside at random, a new shape every other tick so it crackles
export function boltPoints({ from, to, steps = 7, jag = 6, seed = 0, tick = 0 }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const side = { x: -dy / length, y: dx / length };
  const flicker = Math.floor(tick / 2);

  return Array.from({ length: steps + 1 }, (_, i) => {
    const share = i / steps;
    const push = i === 0 || i === steps ? 0 : (hash(i, seed, flicker, 161) - 0.5) * 2 * jag;

    return { x: from.x + dx * share + side.x * push, y: from.y + dy * share + side.y * push };
  });
}

function strand(pen, { points, width, art }) {
  points.slice(1).forEach((to, i) => {
    band(pen, { from: points[i], to, width: width + 3, color: art.body[1] });
  });
  points.slice(1).forEach((to, i) => {
    band(pen, { from: points[i], to, width: width + 1, color: art.body[3] });
  });
  points.slice(1).forEach((to, i) => {
    band(pen, { from: points[i], to, width, color: art.body[4] });
  });
}

// a bolt of lightning with a glow about its white core, and forks off it that come and go
export function drawBolt(pen, { from, to, art, width = 2, seed = 0, tick = 0, forks = 2 }) {
  const points = boltPoints({
    from,
    to,
    seed,
    tick,
    jag: Math.hypot(to.x - from.x, to.y - from.y) / 12,
  });

  for (let i = 0; i < forks; i += 1) {
    const root = points[2 + ((i * 3) % (points.length - 3))];
    const angle = hash(i, seed, Math.floor(tick / 2), 162) * Math.PI * 2;
    const reach = 10 + hash(i, seed, 163) * 14;
    const end = {
      x: root.x + Math.cos(angle) * reach,
      y: root.y + Math.abs(Math.sin(angle)) * reach,
    };

    strand(pen, {
      points: boltPoints({ from: root, to: end, steps: 3, jag: 3, seed: seed + i + 1, tick }),
      width: 1,
      art,
    });
  }

  strand(pen, { points, width, art });

  return points;
}
