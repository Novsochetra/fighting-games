import { fillClipped, isOnScreen } from './motion.js';

// [half width, half height] of each plate, outermost first
const PLATES = [
  [11, 8],
  [7, 5],
  [4, 3],
];

// an ellipse cut into bands of rows that share a width, one rect per band
function plateBands([halfWidth, halfHeight]) {
  const bands = [];
  for (let dy = -halfHeight; dy < halfHeight; dy++) {
    const across = (dy + 0.5) / halfHeight;
    const half = Math.round(halfWidth * Math.sqrt(1 - across * across));
    const last = bands.at(-1);
    if (last && last.half === half) {
      last.height += 1;
    } else {
      bands.push({ dy, half, height: 1 });
    }
  }
  return bands;
}

const PLATE_BANDS = PLATES.map(plateBands);

function isInside(bands, x, y) {
  return bands.some(
    (band) => y >= band.dy && y < band.dy + band.height && x >= -band.half && x < band.half,
  );
}

// a checkerboard ring just outside the outer plate, so its edge frays like a dithered painting
function fringeOf(bands, [halfWidth, halfHeight]) {
  const dots = [];
  for (let y = -halfHeight - 1; y <= halfHeight; y++) {
    for (let x = -halfWidth - 1; x <= halfWidth; x++) {
      const touches =
        isInside(bands, x - 1, y) ||
        isInside(bands, x + 1, y) ||
        isInside(bands, x, y - 1) ||
        isInside(bands, x, y + 1);
      if (((x + y) & 3) === 0 && !isInside(bands, x, y) && touches) {
        dots.push([x, y]);
      }
    }
  }
  return dots;
}

const FRINGE = fringeOf(PLATE_BANDS[0], PLATES[0]);

// stacked translucent plates add up to a brighter middle: a soft glow without gradients
export function drawFlameGlow(painter, center, { tick, index, color }) {
  const flicker =
    Math.sin(tick * 0.23 + index * 2.3) * 0.025 + Math.sin(tick * 0.61 + index) * 0.015;
  painter.use(color).alpha(0.08 + flicker);
  for (const bands of PLATE_BANDS) {
    for (const { dy, half, height } of bands) {
      fillClipped(painter, { x: center.x - half, y: center.y + dy, width: half * 2, height });
    }
  }
  for (const [dx, dy] of FRINGE) {
    if (isOnScreen(center.x + dx, center.y + dy, 1)) {
      painter.rect(center.x + dx, center.y + dy, 1, 1);
    }
  }
}
