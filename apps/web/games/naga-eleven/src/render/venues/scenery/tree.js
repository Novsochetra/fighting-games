import { hash2 } from '../kit/hash.js';
import { ellipse, rect } from '../kit/raster.js';

// a broad leafy tree (a mango, a tamarind): a short trunk under a heap of clumps, each clump dark
// at its foot and lit on its top left, flecked with lighter leaves
function paintClump(raster, { x, y, radius }, ramp, seed) {
  ellipse(raster, { x, y, radiusX: radius + 1, radiusY: radius }, ramp[1]);
  ellipse(raster, { x: x - 1, y: y - 1, radiusX: radius, radiusY: radius - 1 }, ramp[2]);
  ellipse(
    raster,
    {
      x: x - Math.ceil(radius / 3),
      y: y - Math.ceil(radius / 3),
      radiusX: Math.ceil(radius / 2),
      radiusY: Math.ceil(radius / 2.4),
    },
    ramp[3],
  );

  for (let i = 0; i < radius * 2; i += 1) {
    const dx = Math.round((hash2(seed, i, 1) - 0.6) * radius * 1.6);
    const dy = Math.round((hash2(seed, i, 2) - 0.65) * radius * 1.4);

    rect(
      raster,
      { x: x + dx, y: y + dy, width: 1, height: 1 },
      ramp[4 + (i % 2 && ramp.length > 5 ? 1 : 0)],
    );
  }
}

export function paintRoundTree(raster, { x, base, height, width }, { trunk, leaf }) {
  const crownBottom = base - Math.round(height * 0.3);

  rect(
    raster,
    { x: x - 1, y: crownBottom - 4, width: 3, height: base - crownBottom + 4 },
    trunk[1],
  );
  rect(
    raster,
    { x: x - 1, y: crownBottom - 4, width: 1, height: base - crownBottom + 4 },
    trunk[2],
  );

  const clumps = Math.max(3, Math.round(width / 7));

  for (let i = 0; i < clumps; i += 1) {
    const across = (i / (clumps - 1) - 0.5) * width * 0.8;
    const lift = (1 - Math.abs(across) / (width / 2)) * (height - 8) * 0.6;
    const radius = Math.round(width / 4 + hash2(x, i, 4) * 3);

    paintClump(raster, { x: x + across, y: crownBottom - lift - radius / 2, radius }, leaf, x + i);
  }

  paintClump(
    raster,
    { x: x - 2, y: base - height + width / 4, radius: Math.round(width / 3.5) },
    leaf,
    x + 99,
  );
}

// a hazy line of trees far off, a soft bumpy silhouette in two tones
export function paintTreeLine(raster, { bottom, height, salt }, ramp) {
  for (let x = 0; x < raster.width; x += 1) {
    const bump = Math.round(
      height *
        (0.55 +
          0.3 * Math.sin(x * 0.07 + salt) * Math.sin(x * 0.021) +
          hash2(x >> 2, salt, 1) * 0.15),
    );

    rect(raster, { x, y: bottom - bump, width: 1, height: bump }, ramp[1]);
    rect(raster, { x, y: bottom - bump, width: 1, height: 1 }, ramp[2]);
    rect(
      raster,
      { x, y: bottom - Math.round(bump * 0.4), width: 1, height: Math.round(bump * 0.4) },
      ramp[0],
    );
  }
}
