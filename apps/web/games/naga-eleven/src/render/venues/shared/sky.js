import { bayer, noise2 } from '../kit/hash.js';
import { ellipse } from '../kit/raster.js';

// a sky in bands of its ramp from the top of the picture down, each band dithered into the next
export function paintSky(raster, { ramp, from = 0, to = raster.height }) {
  const span = Math.max(1, to - from);

  for (let y = 0; y < raster.height; y += 1) {
    const share = Math.min(1, Math.max(0, (y - from) / span)) * (ramp.length - 1);

    for (let x = 0; x < raster.width; x += 1) {
      const step = Math.min(ramp.length - 1, Math.floor(share + bayer(x, y)));

      raster.pixels[y * raster.width + x] = ramp[step];
    }
  }
}

// a puffy cloud: a heap of rounded lumps, lit on top, its belly in shade
function paintCloud(raster, { x, y, width }, ramp) {
  const lumps = Math.max(2, Math.round(width / 14));

  for (let layer = 0; layer < 3; layer += 1) {
    for (let i = 0; i < lumps; i += 1) {
      const radius = Math.round(5 + noise2(i * 9, x, { cell: 3 }) * 6);
      const centre = { x: x + (i * width) / lumps, y: y - layer * 2 - (i % 2) * 2 };

      ellipse(raster, { ...centre, radiusX: radius + 3, radiusY: radius - layer }, ramp[layer + 1]);
    }
  }

  ellipse(raster, { x: x + width / 2, y: y + 4, radiusX: width / 2 + 4, radiusY: 3 }, ramp[0]);
}

export function paintClouds(raster, { ramp, row, every = 260, salt = 0 }) {
  for (let x = 40; x < raster.width; x += every) {
    const lift = Math.round(noise2(x, salt, { cell: 97 }) * 18);
    const width = 40 + Math.round(noise2(x, salt + 5, { cell: 53 }) * 50);

    paintCloud(
      raster,
      { x: x + Math.round(noise2(x, salt, { cell: 31 }) * 80), y: row - lift, width },
      ramp,
    );
  }
}
