import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { fillRect, plot, vline } from '../raster.js';
import { disc, line } from '../shapes.js';

function dirtColor(colors, { x, y, across, along, seed }) {
  if ((Math.abs(across - 0.3) < 0.05 || Math.abs(across - 0.7) < 0.05) && mixes(x, y, 0.5)) {
    return colors[0];
  }

  if (hash(seed, x, y) > 0.94) {
    return colors[3];
  }

  return colors[mixes(x, y, (1 - along) * 0.7) ? 2 : 1];
}

// a red-earth path running off into the distance, `bends` its [left, right, y] edges from the
// near end to the far one; `colors` [shade, base, lit, dust]
export function paintDirtPath(raster, { bends, colors, seed = 1 }) {
  bends.slice(1).forEach(([farLeft, farRight, farY], i) => {
    const [nearLeft, nearRight, nearY] = bends[i];

    for (let y = farY; y <= nearY; y += 1) {
      const along = (y - farY) / Math.max(1, nearY - farY);
      const left = Math.round(farLeft + (nearLeft - farLeft) * along);
      const right = Math.round(farRight + (nearRight - farRight) * along);

      for (let x = left; x <= right; x += 1) {
        const across = (x - left) / Math.max(1, right - left);

        plot(raster, x, y, dirtColor(colors, { x, y, across, along, seed }));
      }
    }
  });
}

// a bamboo fence of posts and two rails running from `near` to `far` ({ x, y } feet of posts)
export function paintFence(raster, { near, far, posts, colors }) {
  const tops = [];

  for (let i = 0; i < posts; i += 1) {
    const along = (i / (posts - 1)) ** 1.8;
    const x = Math.round(near.x + (far.x - near.x) * along);
    const y = Math.round(near.y + (far.y - near.y) * along);
    const height = Math.max(3, Math.round(near.height * (1 - along * 0.82)));

    fillRect(raster, { x, y: y - height, width: height > 10 ? 2 : 1, height }, colors[0]);
    plot(raster, x, y - height, colors[1]);
    tops.push({ x, y: y - height, height });
  }

  [0.2, 0.6].forEach((drop) => {
    const railAt = (top) => ({ x: top.x, y: top.y + Math.round(top.height * drop) });

    tops.slice(1).forEach((top, i) => {
      line(raster, { from: railAt(tops[i]), to: railAt(top) }, colors[1]);
    });
  });
}

// the boy's old ball: worn white panels, a shadow under it, `colors` [outline, shade, white]
export function paintBall(raster, { x, y, radius = 3 }, colors) {
  disc(raster, { x, y, radius: radius + 0.5 }, colors[0]);
  disc(raster, { x, y, radius: radius - 0.5 }, colors[2]);
  disc(raster, { x: x + 1, y: y + 1, radius: radius - 1.5 }, colors[1]);
  plot(raster, x - 1, y - 1, colors[2]);
  plot(raster, x, y, colors[0]);
  vline(raster, { x: x + 1, y: y - 1, length: 1 }, colors[0]);
}
