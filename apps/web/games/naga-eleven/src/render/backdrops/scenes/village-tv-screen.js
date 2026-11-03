import { hash } from '../hash.js';
import { artRect } from '../pen.js';

// the match on the little screen, and the village crowded in front of it

export const SCREEN = { x: 176, y: 90, width: 32, height: 22 };

const rowOf = ({ ground, height, pose, spacing, seed, clear = 0 }) =>
  Array.from({ length: Math.ceil(400 / spacing) }, (_, i) => ({
    x: -6 + i * spacing + Math.round(hash(i, seed) * spacing * 0.5),
    ground: ground + Math.round(hash(i, seed, 2) * 3),
    height: height + Math.round(hash(i, seed, 3) * 4),
    pose: hash(i, seed, 4) > 0.9 && pose === 'sit' ? 'child' : pose,
  })).filter(({ x }) => Math.abs(x - 192) > clear);

// the ones at the back stand, nearer ones sit, and every row is drawn behind the next
export const CROWD = [
  ...rowOf({ ground: 138, height: 34, pose: 'stand', spacing: 19, seed: 1, clear: 40 }),
  ...rowOf({ ground: 150, height: 24, pose: 'sit', spacing: 15, seed: 2, clear: 12 }),
  ...rowOf({ ground: 170, height: 28, pose: 'sit', spacing: 16, seed: 3 }),
  ...rowOf({ ground: 196, height: 34, pose: 'sit', spacing: 18, seed: 4 }),
  ...rowOf({ ground: 226, height: 42, pose: 'sit', spacing: 21, seed: 5 }),
];

export function drawScreen(context, { colors, tick }) {
  const flicker = hash(Math.floor(tick / 3)) > 0.9;

  artRect(context, SCREEN, colors[flicker ? 1 : 0]);
  artRect(context, { x: SCREEN.x, y: SCREEN.y + 10, width: SCREEN.width, height: 1 }, colors[1]);
  artRect(context, { x: SCREEN.x + 15, y: SCREEN.y, width: 1, height: SCREEN.height }, colors[1]);

  for (let i = 0; i < 6; i += 1) {
    const phase = tick / (40 + i * 7) + i;
    const x = SCREEN.x + 3 + Math.round((Math.sin(phase) * 0.5 + 0.5) * (SCREEN.width - 6));
    const y = SCREEN.y + 3 + Math.round((Math.cos(phase * 1.3) * 0.5 + 0.5) * (SCREEN.height - 6));

    artRect(context, { x, y }, colors[i < 3 ? 3 : 2]);
  }

  artRect(context, { x: SCREEN.x + 1, y: SCREEN.y + 1, width: 5, height: 2 }, colors[4]);
}
