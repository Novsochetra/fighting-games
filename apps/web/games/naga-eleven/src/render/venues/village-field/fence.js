import { columnOf } from '../layers/frame.js';
import { hash2 } from '../kit/hash.js';
import { rect } from '../kit/raster.js';
import { KID_WIDTH, paintKid } from '../scenery/kid.js';

// the wooden fence along the far touchline, the village kids perched on it and standing by it:
// sitting still or kicking their legs in turn, and up on their feet cheering after a goal
const POST_EVERY = 44;
const POST = 28;
const RAIL = { low: 10, high: 22 };

function paintFenceWood(raster, wood) {
  const base = raster.height - 1;

  for (let x = 3; x < raster.width; x += POST_EVERY) {
    rect(raster, { x, y: base - POST, width: 4, height: POST }, wood[2]);
    rect(raster, { x, y: base - POST, width: 1, height: POST }, wood[4]);
    rect(raster, { x: x + 3, y: base - POST + 1, width: 1, height: POST - 1 }, wood[0]);
    rect(raster, { x, y: base - POST, width: 4, height: 1 }, wood[5]);
  }

  for (const height of [RAIL.low, RAIL.high]) {
    rect(raster, { x: 0, y: base - height, width: raster.width, height: 3 }, wood[3]);
    rect(raster, { x: 0, y: base - height, width: raster.width, height: 1 }, wood[4]);
    rect(raster, { x: 0, y: base - height + 3, width: raster.width, height: 1 }, wood[1]);
  }
}

function lookOf(kids, seed) {
  const pick = (list, salt) => list[Math.floor(hash2(seed, salt, 2) * list.length)];
  const skin = Math.floor(hash2(seed, 4, 2) * kids.skins.length);

  return {
    shirt: pick(kids.shirts, 1),
    shorts: pick(kids.shorts, 3),
    skin: kids.skins[skin],
    skinLight: kids.skinLight[skin],
    hair: kids.hair,
    hairLight: kids.hairLight,
  };
}

function poseOf(seed, frame, perched) {
  const odd = hash2(seed, 9, 2) < 0.5;

  if (frame >= 2) {
    return (frame === 2) === odd ? 'jump' : 'cheer';
  }

  if (!perched) {
    return 'stand';
  }

  return frame === 1 && odd ? 'swing' : 'sit';
}

// the kids gather in a few bunches along the fence, the way they do, near the middle of the field
function kidsAlong(frame, { pitch }) {
  const spots = [];

  for (let x = pitch.length * 0.12; x < pitch.length * 0.9; x += KID_WIDTH + 6) {
    const bunch = Math.sin(x * 0.011) + Math.sin(x * 0.027 + 1);

    if (bunch > 0.6 && hash2(Math.round(x), 0, 7) < 0.8) {
      spots.push({
        x: columnOf(frame, x),
        seed: Math.round(x),
        perched: hash2(Math.round(x), 1, 7) < 0.55,
      });
    }
  }

  return spots;
}

export function paintFence(raster, { frame, index, layout, art }) {
  const base = raster.height - 1;
  const kids = kidsAlong(frame, layout);

  kids
    .filter((kid) => !kid.perched)
    .forEach((kid) =>
      paintKid(
        raster,
        { x: kid.x, y: base, pose: poseOf(kid.seed, index, false) },
        lookOf(art.kids, kid.seed),
      ),
    );
  paintFenceWood(raster, art.wood);
  kids
    .filter((kid) => kid.perched)
    .forEach((kid) =>
      paintKid(
        raster,
        { x: kid.x, y: base - RAIL.high + 5, pose: poseOf(kid.seed, index, true) },
        lookOf(art.kids, kid.seed),
      ),
    );
}
