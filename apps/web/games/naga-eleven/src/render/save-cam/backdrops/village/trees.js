import { hash2 } from '../../../venues/kit/hash.js';
import { line, plot, rect } from '../../../venues/kit/raster.js';

// the trees of the plain at the save cam's scale, a long way off: sugar palms, a tall bare trunk
// under a round burst of fan leaves, and leafy trees in heaps of clumps; lit from the top left

function paintTrunk(raster, { x, base, top, wide }, ramp) {
  rect(raster, { x, y: top, width: wide ? 2 : 1, height: base - top }, ramp[1]);

  if (wide) {
    rect(raster, { x: x + 1, y: top, width: 1, height: base - top }, ramp[0]);
  }

  for (let y = top + 3; y < base - 1; y += 4) {
    plot(raster, x, y, ramp[wide ? 2 : 0]);
  }
}

// how far out the crown reaches at an angle: to the tip of a fan leaf, or less between two
function edgeOf(angle, { crown, leaves, seed }) {
  const share = ((angle / (Math.PI * 2)) * leaves + seed) % 1;
  const tooth = 1 - Math.abs(share - 0.5) * 2;

  return { edge: crown * (0.6 + 0.4 * tooth), vein: tooth > 0.86 };
}

// a pixel of the crown: lit on its top left, in shade on its bottom right, dark at the heart, the
// stalk of each fan leaf a shade darker down its middle
function crownShade(dx, dy, shape) {
  const angle = Math.atan2(dy / 0.9, dx);
  const distance = Math.hypot(dx, dy / 0.9);
  const { edge, vein } = edgeOf(angle + Math.PI, shape);

  if (distance > edge) {
    return null;
  }

  const light = (-dx - dy) / (shape.crown * 1.4);
  const rim = distance > edge - 1.2 && light > 0 ? 0.8 : 0;
  const heart = distance < shape.crown * 0.3 ? 1.4 : 0;
  const stalk = vein && distance < edge * 0.85 ? 0.9 : 0;

  return 2.6 + light * 2.2 + rim - heart - stalk + (hash2(dx, dy, shape.seed * 97) - 0.5) * 0.7;
}

function paintCrown(raster, { x, y, crown }, ramp) {
  const shape = { crown, leaves: 9 + Math.round(crown / 2), seed: hash2(x, y, 13) };

  for (let dy = -crown - 1; dy <= crown + 1; dy += 1) {
    for (let dx = -crown - 1; dx <= crown + 1; dx += 1) {
      const shade = crownShade(dx, dy, shape);

      if (shade !== null) {
        plot(
          raster,
          x + dx,
          y + dy,
          ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(shade)))],
        );
      }
    }
  }
}

// a sugar palm: a tall bare trunk ringed with old leaf scars, a round burst of fan leaves on top
// and a skirt of dead ones hanging under it
export function paintPalm(raster, { x, base, height, crown }, art) {
  const top = base - height;

  paintTrunk(raster, { x, base, top, wide: height > 34 }, art.trunk);

  for (let i = 0; i < 4 && crown > 3; i += 1) {
    const from = { x: x - 2 + i + (i > 1 ? 1 : 0), y: top + Math.round(crown * 0.4) };

    line(raster, from, { x: from.x + (i - 1.5), y: from.y + 2 + (i % 2) * 2 }, art.dead[i % 3]);
  }

  paintCrown(raster, { x, y: top, crown }, art.leaf);
}

// a round heap of leaves, dark at its foot and lit on its top left, a fleck or two of light in it
function paintClump(raster, { x, y, radius }, ramp) {
  for (let row = -radius; row <= radius; row += 1) {
    const half = Math.round(Math.sqrt(Math.max(0, radius * radius - row * row)) * 1.2);

    for (let dx = -half; dx <= half; dx += 1) {
      const light = (-dx - row * 1.3) / (radius * 1.6) + (hash2(x + dx, y + row, 17) - 0.5) * 0.5;
      const shade = Math.max(0, Math.min(ramp.length - 1, Math.round(1.5 + light * 1.5)));

      plot(raster, x + dx, y + row, ramp[shade]);
    }
  }
}

export function paintLeafyTree(raster, { x, base, width, height }, art) {
  const radius = Math.max(2, Math.round(width / 4));
  const clumps = Math.max(2, Math.round(width / (radius * 1.4)));

  rect(
    raster,
    { x, y: base - Math.round(height * 0.4), width: 1, height: Math.round(height * 0.4) },
    art.trunk[1],
  );

  for (let i = 0; i < clumps; i += 1) {
    const across = (i / Math.max(1, clumps - 1) - 0.5) * (width - radius * 2);
    const lift = (1 - Math.abs(across) / (width / 2)) * (height - radius * 2) * 0.5;

    paintClump(
      raster,
      { x: Math.round(x + across), y: Math.round(base - radius - height * 0.25 - lift), radius },
      art.leaf,
    );
  }

  paintClump(raster, { x: x - 1, y: base - height + radius, radius }, art.leaf);
}
