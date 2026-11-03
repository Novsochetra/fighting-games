import { hline, plot } from './raster.js';

export function ellipse(raster, { x, y, radiusX, radiusY = radiusX }, color) {
  const top = Math.ceil(y - radiusY);
  const bottom = Math.floor(y + radiusY);

  for (let row = top; row <= bottom; row += 1) {
    const across = (row - y) / Math.max(radiusY, 0.5);
    const half = radiusX * Math.sqrt(Math.max(0, 1 - across * across));
    const left = Math.round(x - half);

    hline(raster, { x: left, y: row, length: Math.round(x + half) - left + 1 }, color);
  }
}

export const disc = (raster, { x, y, radius }, color) =>
  ellipse(raster, { x, y, radiusX: radius, radiusY: radius }, color);

function crossings(points, row) {
  const found = [];

  points.forEach(([ax, ay], i) => {
    const [bx, by] = points[(i + 1) % points.length];

    if ((ay <= row && by > row) || (by <= row && ay > row)) {
      found.push(ax + ((row - ay) / (by - ay)) * (bx - ax));
    }
  });

  return found.sort((first, second) => first - second);
}

const pairsOf = (flat) => flat.flatMap((value, i) => (i % 2 === 0 ? [[value, flat[i + 1]]] : []));

// even-odd scanline fill through the centre of each pixel row, so shapes meet without gaps;
// `corners` is a flat list, x then y for each corner
export function polygon(raster, corners, color) {
  const points = pairsOf(corners);
  const rows = points.map(([, y]) => y);
  const top = Math.floor(Math.min(...rows));
  const bottom = Math.ceil(Math.max(...rows));

  for (let row = top; row <= bottom; row += 1) {
    const edges = crossings(points, row + 0.5);

    for (let i = 0; i + 1 < edges.length; i += 2) {
      const left = Math.round(edges[i]);

      hline(raster, { x: left, y: row, length: Math.round(edges[i + 1]) - left }, color);
    }
  }
}

export function line(raster, { from, to }, color) {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);

  for (let i = 0; i <= steps; i += 1) {
    plot(
      raster,
      from.x + ((to.x - from.x) * i) / steps,
      from.y + ((to.y - from.y) * i) / steps,
      color,
    );
  }
}

// a box with a lit top row and a shaded bottom row, the commonest block of a pixel building

export function ring(raster, { x, y, radius }, color) {
  const steps = Math.max(8, Math.round(radius * 8));

  for (let i = 0; i < steps; i += 1) {
    const turn = (i / steps) * Math.PI * 2;

    plot(raster, x + Math.cos(turn) * radius, y + Math.sin(turn) * radius, color);
  }
}
