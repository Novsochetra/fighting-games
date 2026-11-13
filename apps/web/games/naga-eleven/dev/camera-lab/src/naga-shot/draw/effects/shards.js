import { hash } from '../../../../../../src/render/duel/hash.js';
import { polygon } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { stepped } from './kit.js';

const SHARD_RAMP = [SHOT_ART.white, SHOT_ART.gold[3], SHOT_ART.emerald[4], SHOT_ART.gold[2]];

const ACCENT_RAMP = [SHOT_ART.white, SHOT_ART.ember[3], SHOT_ART.ember[2]];

function shardAt(i, { at, moved, ahead, spread }) {
  const angle = ahead + (hash(i, 101) - 0.5) * spread;
  const speed = 3 + hash(i, 102) * 4.5;
  const life = 12 + Math.round(hash(i, 103) * 8);
  const travelled = 10 + speed * moved * (1 - moved / (life * 2.4));

  return {
    angle,
    share: moved / life,
    x: at.x + Math.cos(angle) * travelled,
    y: at.y + Math.sin(angle) * travelled,
    length: (6 + hash(i, 104) * 10) * (1 - (moved / life) * 0.6),
  };
}

function shard(pen, { x, y, angle, length, color }) {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const waist = { x: x - cos * length * 0.3, y: y - sin * length * 0.3 };

  polygon(
    pen,
    [
      [x + cos * 2, y + sin * 2],
      [waist.x - sin * 1.3, waist.y + cos * 1.3],
      [x - cos * length, y - sin * length],
      [waist.x + sin * 1.3, waist.y - cos * 1.3],
    ],
    color,
  );
}

export function drawShards(pen, { at, moved, ahead, count = 11, spread = 1.2 }) {
  if (moved < 0) {
    return;
  }

  for (let i = 0; i < count; i += 1) {
    const flying = shardAt(i, { at, moved, ahead, spread });

    if (flying.share < 1) {
      const ramp = i % 5 === 2 ? ACCENT_RAMP : SHARD_RAMP;

      shard(pen, { ...flying, color: stepped(ramp, flying.share) });
    }
  }
}

const CLOD_COLOURS = [SHOT_ART.grass[1], SHOT_ART.grass[3], SHOT_ART.gold[0], SHOT_ART.grass[2]];

const SHAPES = [
  [2, 1],
  [1, 2],
  [2, 2],
];

export function drawClods(pen, { at, ground, moved, count = 14 }) {
  if (moved < 0) {
    return;
  }

  for (let i = 0; i < count; i += 1) {
    const x = at.x - 7 + hash(i, 111) * 14 + (hash(i, 112) - 0.2) * 2.4 * moved;
    const y = ground - 1 - (2.2 + hash(i, 113) * 2.8) * moved + 0.16 * moved * moved;
    const [width, height] = SHAPES[(i + Math.floor(moved / 3)) % 3];

    if (y <= ground) {
      pen.rect([Math.round(x), Math.round(y), width, height], CLOD_COLOURS[i % 4]);
    }
  }
}
