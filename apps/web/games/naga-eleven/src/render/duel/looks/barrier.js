import { easeOut, hash } from '../hash.js';
import { GROUND } from '../paths.js';
import { disc } from '../shapes.js';

// how far a barrier has risen: it comes up as the attack closes in
export const riseOf = (scene) => (scene.hit ? 1 : easeOut((scene.approach - 0.2) / 0.45));

export const holds = (scene) => !scene.hit || !scene.attackWins;

// a broken barrier throws its blocks out, and they fall
export function debris(pen, { scene, box, colors }) {
  const since = scene.sinceHit;

  for (let i = 0; i < 16; i += 1) {
    const startX = box.x + hash(i, 121) * box.width;
    const startY = box.y + hash(i, 122) * box.height;
    const vx = 0.6 + hash(i, 123) * 1.8;
    const vy = -1.6 - hash(i, 124) * 1.6;
    const x = startX + vx * since;
    const y = Math.min(GROUND - 3, startY + vy * since + 0.12 * since * since);
    const size = 2 + Math.floor(hash(i, 125) * 4);

    pen.rect([x, y, size, size], colors[i % colors.length]);
  }
}

// dust kicked up where a barrier that held stands on the ground
export function dust(pen, { scene, x, width, color }) {
  const since = scene.sinceHit;

  if (since < 0 || since > 24) {
    return;
  }

  for (let i = 0; i < 6; i += 1) {
    disc(pen, {
      x: x + (i / 5) * width,
      y: GROUND - 2 - (i % 2) * 2,
      radius: 2 + since / 6,
      color,
    });
  }
}
