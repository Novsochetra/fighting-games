import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { plot } from '../raster.js';

function blobsOf({ x, top, radius, seed }) {
  const count = 3 + Math.floor(hash(seed, 1) * 3);

  return Array.from({ length: count }, (_, i) => ({
    x: x + (hash(seed, i, 2) - 0.5) * radius * 1.3,
    y: top + radius + (hash(seed, i, 3) - 0.3) * radius * 0.8,
    radius: radius * (0.5 + 0.35 * hash(seed, i, 4)),
  }));
}

function blobAt(blobs, { x, y, seed }) {
  return blobs.find((blob) => {
    const dx = x - blob.x;
    const dy = (y - blob.y) * 1.15;
    const ragged = 0.86 + 0.14 * hash(seed, Math.round(Math.atan2(dy, dx) * 5));

    return dx * dx + dy * dy < (blob.radius * ragged) ** 2;
  });
}

function leafColor(colors, { blob, x, y, light, seed }) {
  const lean = ((x - blob.x) * light - (y - blob.y)) / blob.radius;
  const edge = !blobAt([{ ...blob, radius: blob.radius - 1.5 }], { x, y, seed });

  if (edge && lean > 0.5) {
    return colors[2];
  }

  return lean > 0.2 && hash(seed, x, y) > 0.7 && mixes(x, y, 0.5) ? colors[1] : colors[0];
}

// one village tree (mango, tamarind) seen against the light: a short trunk under a ragged crown
// of leaf clumps, rimmed on its sunward side; `colors` [body, speckle, rim]
export function paintTree(raster, { x, ground, height, colors, seed = 1, light = 1 }) {
  const radius = height * 0.42;
  const top = ground - height;
  const blobs = blobsOf({ x, top, radius, seed });

  fillTrunk(raster, { x, top: top + radius, ground, color: colors[0] });

  for (let y = Math.floor(top - radius * 0.3); y < top + radius * 2.4; y += 1) {
    for (let column = Math.floor(x - radius * 1.6); column < x + radius * 1.6; column += 1) {
      const blob = blobAt(blobs, { x: column, y, seed });

      if (blob) {
        plot(raster, column, y, leafColor(colors, { blob, x: column, y, light, seed }));
      }
    }
  }
}

function fillTrunk(raster, { x, top, ground, color }) {
  for (let y = Math.round(top); y <= ground; y += 1) {
    plot(raster, x, y, color);
    plot(raster, x + 1, y, color);
  }
}

// a grove: trees of a few sizes, the taller ones behind
export function paintGrove(raster, { x, ground, width, height, colors, seed = 1, light = 1 }) {
  const count = Math.max(2, Math.round(width / (height * 0.55)));

  for (let i = 0; i < count; i += 1) {
    const treeX = Math.round(x + ((i + 0.5) / count) * width + (hash(seed, i) - 0.5) * 8);
    const treeHeight = height * (0.65 + 0.35 * hash(seed, i, 5));

    paintTree(raster, {
      x: treeX,
      ground: ground - (i % 2),
      height: treeHeight,
      colors,
      seed: seed * 31 + i,
      light,
    });
  }
}

function paintLeaf(raster, { base, angle, length, colors, seed }) {
  const reach = { x: Math.cos(angle) * length, y: -Math.sin(angle) * length };
  const droop = length * 0.55;

  for (let step = 0; step <= length * 2; step += 1) {
    const along = step / (length * 2);
    const x = base.x + reach.x * along;
    const y = base.y + reach.y * along + droop * along * along;
    const width = length * 0.2 * Math.sin(Math.PI * along) ** 0.7;
    const torn = along > 0.35 && hash(seed, step) > 0.82;

    for (let across = -width; across <= width && !torn; across += 0.5) {
      const upper = across < 0;

      plot(raster, x, y + across, colors[upper && across < -width + 1.2 ? 2 : Number(upper)]);
    }
  }
}

// a banana plant by the house: a short stem and broad paddle leaves arching out and drooping,
// some torn by the wind; `colors` [shade, body, rim]
export function paintBanana(raster, { x, ground, height, colors, seed = 1 }) {
  const top = { x, y: ground - height * 0.55 };
  const leaves = 7;

  for (let y = top.y; y <= ground; y += 1) {
    plot(raster, x, y, colors[0]);
    plot(raster, x + 1, y, colors[1]);
  }

  for (let i = 0; i < leaves; i += 1) {
    const angle = 0.25 + (i / (leaves - 1)) * (Math.PI - 0.5) + (hash(seed, i) - 0.5) * 0.3;
    const length = height * (0.45 + 0.25 * hash(seed, i, 2));

    paintLeaf(raster, { base: top, angle, length, colors, seed: seed * 7 + i });
  }
}
