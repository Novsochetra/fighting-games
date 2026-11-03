import { hash2, noise2 } from '../../../venues/kit/hash.js';
import { rect } from '../../../venues/kit/raster.js';
import { paintBannerWall } from '../banners.js';

// The school stadium's terraces behind the goal, as the venue's (terraces.js): wide concrete steps
// with no seats, the schoolchildren sitting in bunches by school, in white and navy, a stair now
// and then; the red wall under them hung with the venue's banners. In the second frame a few are
// up on their feet
export const TERRACE = { top: 50, steps: 5, step: 7 };
export const WALL = { top: TERRACE.top + TERRACE.steps * TERRACE.step, bottom: 97 };
const AISLES = [30, 124, 218];

const inAisle = (x) => AISLES.some((aisle) => x >= aisle - 1 && x < aisle + 8);

function paintSteps(raster, art) {
  const [deep, dark, mid, light, edge] = art.concrete;

  rect(raster, { x: 0, y: TERRACE.top - 3, width: raster.width, height: 3 }, mid);
  rect(raster, { x: 0, y: TERRACE.top - 3, width: raster.width, height: 1 }, edge);

  for (let i = 0; i < TERRACE.steps; i += 1) {
    const y = TERRACE.top + i * TERRACE.step;

    rect(raster, { x: 0, y, width: raster.width, height: TERRACE.step }, dark);
    rect(raster, { x: 0, y, width: raster.width, height: 1 }, edge);
    rect(raster, { x: 0, y: y + 1, width: raster.width, height: 1 }, light);
    rect(raster, { x: 0, y: y + TERRACE.step - 1, width: raster.width, height: 1 }, deep);
  }

  for (const aisle of AISLES) {
    rect(raster, { x: aisle, y: TERRACE.top, width: 7, height: WALL.top - TERRACE.top }, mid);

    for (let y = TERRACE.top + 2; y < WALL.top; y += 3) {
      rect(raster, { x: aisle, y, width: 7, height: 1 }, light);
    }
  }
}

function lookOf(art, seed) {
  const pick = (list, salt) => list[Math.floor(hash2(seed, salt, 2) * list.length)];

  return {
    shirt: pick(art.crowd.shirts, 1),
    skin: pick(art.crowd.skins, 3),
    hair: hash2(seed, 5, 2) < 0.15 ? pick(art.crowd.caps, 6) : pick(art.crowd.hairs, 4),
  };
}

// a child sitting on a step, three pixels across: hair or a cap, a face, a shirt lit on its left
function paintChild(raster, { x, y, up }, look) {
  const top = y - 5 - up;

  if (up > 1) {
    rect(raster, { x: x - 1, y: top - 1, width: 1, height: 2 }, look.skin);
    rect(raster, { x: x + 3, y: top - 1, width: 1, height: 2 }, look.skin);
  }

  rect(raster, { x: x + 1, y: top, width: 2, height: 1 }, look.hair);
  rect(raster, { x: x + 1, y: top + 1, width: 2, height: 1 }, look.skin);
  rect(raster, { x, y: top + 2, width: 3, height: 3 + up }, look.shirt[1]);
  rect(raster, { x, y: top + 2, width: 1, height: 3 + up }, look.shirt[2]);
  rect(raster, { x: x + 2, y: top + 3, width: 1, height: 2 + up }, look.shirt[0]);
}

function paintChildren(raster, { art, frame }) {
  for (let i = 0; i < TERRACE.steps; i += 1) {
    const y = TERRACE.top + (i + 1) * TERRACE.step - 1;

    for (let x = 1 + (i % 2) * 2; x < raster.width - 2; x += 4) {
      const seed = x * 31 + i;
      const filled = noise2(x, i * 13, { cell: 40, salt: 21 }) + hash2(x, i, 23) * 0.3 > 0.52;
      const up = frame === 1 && hash2(seed, 9, 2) < 0.12 ? 1 + (hash2(seed, 8, 2) < 0.4) : 0;

      if (filled && !inAisle(x) && !inAisle(x + 2)) {
        paintChild(raster, { x, y, up }, lookOf(art, seed));
      }
    }
  }
}

export function paintTerraces(raster, { art, frame }) {
  paintSteps(raster, art);
  paintChildren(raster, { art, frame });
  paintBannerWall(raster, { ...WALL, wall: art.wall, banners: art.banners, at: [12, 92, 168] });
}
