import { ART, UNIT } from '../../src/render/duel/layout.js';
import { createSaveCam, drawSaveCam } from '../../src/render/save-cam/index.js';
import { createPixelCanvas } from './pixel-canvas.js';

const hexOf = (channels) =>
  `#${[...channels].map((value) => value.toString(16).padStart(2, '0')).join('')}`;

// the save cam drawn `ticks` into its show on a canvas three pixels to an art pixel, read back
// art pixel by art pixel; no bars, so nothing but the view is on it; `venue` is the match's
export function drawnSaveCam(match, moment, { ticks, actors = null, venue = null }) {
  const canvas = createPixelCanvas(ART.width * UNIT, ART.height * UNIT);
  const cam = createSaveCam(match, moment, { length: 96, venue });

  cam.ticks = ticks;
  drawSaveCam(canvas.getContext('2d'), cam, { actors, tick: ticks, bars: false });

  const colourAt = (x, y) => {
    const at = ((y * UNIT + 1) * canvas.width + x * UNIT + 1) * 4;

    return hexOf(canvas.data.subarray(at, at + 3));
  };

  return { cam, colourAt };
}

// every art pixel of the view in one of `colours`, within `box` if one is given
export function pixelsIn(
  colourAt,
  colours,
  box = { x: 0, y: 0, width: ART.width, height: ART.height },
) {
  const wanted = new Set(colours);
  const found = [];

  for (let y = box.y; y < box.y + box.height; y += 1) {
    for (let x = box.x; x < box.x + box.width; x += 1) {
      if (wanted.has(colourAt(x, y))) {
        found.push({ x, y });
      }
    }
  }

  return found;
}

// how steeply the line that best fits the points rises, in degrees above the horizontal, plus to
// the right; and how long and wide the points spread along it and across it
export function lineOf(points) {
  const count = points.length;
  const middle = {
    x: points.reduce((sum, point) => sum + point.x, 0) / count,
    y: points.reduce((sum, point) => sum + point.y, 0) / count,
  };
  const spread = (first, second) =>
    points.reduce(
      (sum, point) => sum + (point[first] - middle[first]) * (point[second] - middle[second]),
      0,
    ) / count;
  const turn = 0.5 * Math.atan2(2 * spread('x', 'y'), spread('x', 'x') - spread('y', 'y'));
  const along = (point) =>
    (point.x - middle.x) * Math.cos(turn) + (point.y - middle.y) * Math.sin(turn);
  const across = (point) =>
    -(point.x - middle.x) * Math.sin(turn) + (point.y - middle.y) * Math.cos(turn);
  const deviation = (measure) =>
    Math.sqrt(points.reduce((sum, point) => sum + measure(point) ** 2, 0) / count);

  return {
    rise: (-turn * 180) / Math.PI,
    middle,
    length: deviation(along),
    width: deviation(across),
  };
}
