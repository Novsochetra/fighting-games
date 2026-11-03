import { mix } from '../../venues/kit/colour.js';
import { hash2, noise2 } from '../../venues/kit/hash.js';
import { rect } from '../../venues/kit/raster.js';

// A tier of a stand behind the goal at the save cam's scale: rows of seats, a fan in most, each a
// head of hair or a cap over a face and a shirt in the crowd's colours lit down its left; `size`
// 2 for the far rows under a roof, 3 for the near ones. In frame 1 a few are up on their feet, arms
// high; `shade` lays the roof's shadow over the tier
function lookOf(crowd, seed, shade) {
  const pick = (list, salt) => list[Math.floor(hash2(seed, salt, 2) * list.length)];
  const darken = (colour) => (shade ? mix(colour, shade.colour, shade.share) : colour);
  const cap = hash2(seed, 5, 2) < 0.12;

  return {
    shirt: pick(crowd.shirts, 1).map(darken),
    skin: darken(pick(crowd.skins, 3)),
    hair: darken(cap ? pick(crowd.caps, 6) : pick(crowd.hairs, 4)),
  };
}

// a fan two pixels across has no face to see, only his hair over his shirt
const SHAPES = { 2: { head: 0, face: 0 }, 3: { head: 1, face: 1 } };

function paintFan(raster, { x, y, size, up, legs }, look) {
  const shape = SHAPES[size];
  const top = y - up;
  const shirtTop = top + 1 + shape.face;

  if (legs) {
    rect(raster, { x, y: shirtTop + 2 + up, width: size, height: 2 }, legs);
  }

  if (up > 1) {
    rect(raster, { x: x - 1, y: top - 2, width: 1, height: 3 }, look.skin);
    rect(raster, { x: x + size, y: top - 2, width: 1, height: 3 }, look.skin);
  }

  rect(raster, { x: x + shape.head, y: top, width: 2, height: 1 }, look.hair);
  rect(raster, { x: x + shape.head, y: top + 1, width: 2, height: shape.face }, look.skin);
  rect(raster, { x, y: shirtTop, width: size, height: 2 + up }, look.shirt[1]);
  rect(raster, { x, y: shirtTop, width: 1, height: 2 + up }, look.shirt[2]);
}

const inAisle = (x, aisles) => aisles && (x + aisles.offset) % aisles.every < aisles.width + 2;

// `tier` is { top, rows, pitch, size, fill, seats, riser, aisles, legs }: where its first row is,
// how many rows a pitch of pixels apart, how many places hold a fan, the seats' colours row by row
// (none for fans standing on a bank, whose `legs` show)
export function paintTier(raster, { tier, crowd, frame = 0, shade = null }) {
  for (let row = 0; row < tier.rows; row += 1) {
    const y = tier.top + row * tier.pitch;

    if (tier.seats) {
      rect(raster, { x: 0, y, width: raster.width, height: tier.pitch }, tier.seats[row % 2]);
      rect(raster, { x: 0, y: y + tier.pitch - 1, width: raster.width, height: 1 }, tier.riser);
    }

    for (let x = (row % 2) * 2; x < raster.width; x += tier.size + 1) {
      const seed = x * 37 + row * 11 + tier.top;
      const filled = noise2(x, row * 9, { cell: 30, salt: 27 }) * 0.4 + hash2(seed, 1, 29) * 0.6;
      const up = frame === 1 && hash2(seed, 3, 29) < 0.1 ? 1 + (hash2(seed, 4, 29) < 0.5) : 0;

      if (filled < tier.fill && !inAisle(x, tier.aisles)) {
        paintFan(
          raster,
          { x, y: y - 1, size: tier.size, up, legs: tier.legs },
          lookOf(crowd, seed, shade),
        );
      }
    }
  }
}
