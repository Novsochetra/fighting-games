import { mixes } from '../dither.js';
import { hline, plot } from '../raster.js';

// The Khmer temple tower, prasat: a square body under a lotus-bud crown that climbs in tiers,
// each tier stepped in and tipped at its corners with a small finial, to a point. `colors` =
// [shade, base, lit, line]; the lit face is toward `light` (-1 left, 1 right, 0 none: a
// silhouette with a rim on both edges).

const BODY = 0.3;

function halfWidthAt(along, width, tiers) {
  if (along < BODY) {
    return width / 2;
  }

  const crown = (along - BODY) / (1 - BODY);
  const inTier = (crown * tiers) % 1;

  return Math.max(
    0.5,
    (width / 2) * 0.9 * (1 - crown ** 2.2) ** 0.6 - inTier * Math.max(1.2, width / 14),
  );
}

function litTone(colors, { toward, offset, row }) {
  if (toward > 0.35 || (toward > 0 && mixes(offset, row, 0.5))) {
    return colors[2];
  }

  if (toward > -0.45 || (toward > -0.65 && mixes(offset, row, 0.5))) {
    return colors[1];
  }

  return colors[0];
}

function towerColor(colors, { offset, half, light, rimOnly, row, ledge }) {
  const side = offset / Math.max(1, half);

  if (rimOnly) {
    return colors[offset === half * Math.sign(light || 1) ? 2 : 1];
  }

  if (light === 0) {
    return colors[Math.abs(side) > 0.88 ? 2 : 1];
  }

  if (ledge) {
    return side * light > -0.2 ? colors[2] : colors[3];
  }

  return litTone(colors, { toward: side * light, offset, row });
}

function paintFinials(raster, { x, y, half, colors, light }) {
  [-1, 1].forEach((side) => {
    plot(raster, x + side * half, y - 1, colors[side === light ? 2 : 1]);
    plot(raster, x + side * half, y - 2, colors[side === light ? 2 : 1]);
  });
}

function paintCourse(raster, { x, y, row, half, ledge, tower }) {
  const { colors, light, rimOnly } = tower;
  const flatLedge = ledge && (rimOnly || light === 0);

  for (let offset = -half; offset <= half; offset += 1) {
    const color = flatLedge
      ? colors[3]
      : towerColor(colors, { offset, half, light, rimOnly, row, ledge });

    plot(raster, x + offset, y, color);
  }

  if (ledge && half > 2) {
    paintFinials(raster, { x, y, half, colors, light });
  }
}

export function paintPrang(raster, { x, base, width, height, colors, light = 0, rimOnly = false }) {
  const tiers = 6;
  const tower = { colors, light, rimOnly };
  const tierOf = (along) => Math.floor(((along - BODY) / (1 - BODY)) * tiers);

  for (let row = 0; row < height; row += 1) {
    const along = row / height;
    const ledge = along >= BODY && tierOf(along + 1 / height) > tierOf(along);
    const half = Math.round(halfWidthAt(along, width, tiers));

    paintCourse(raster, { x, y: base - row, row, half, ledge, tower });
  }

  hline(
    raster,
    { x: x - Math.round(width / 2) - 1, y: base - Math.round(height * BODY), length: width + 3 },
    colors[3],
  );
}
