import { ART_KEYS } from '../../art/dialogue/palette.js';
import { ART, fillArt } from './pixel-map.js';

const scaled = ({ x, y, width, height }) => ({
  x: x * ART,
  y: y * ART,
  width: width * ART,
  height: height * ART,
});

// `box` here is in art pixels; each band row is one art pixel deep, cut on the diagonal at the
// corners so the four sides meet in a mitre
export function drawBands(context, box, style) {
  const { x, y, width, height } = box;
  const paint = (key, rect) => fillArt(context, ART_KEYS[key], scaled(rect));

  style.left.forEach((key, i) =>
    paint(key, { x: x + i, y: y + i, width: 1, height: height - i * 2 }),
  );
  style.right.forEach((key, i) =>
    paint(key, { x: x + width - 1 - i, y: y + i, width: 1, height: height - i * 2 }),
  );
  style.top.forEach((key, i) =>
    paint(key, { x: x + i, y: y + i, width: width - i * 2, height: 1 }),
  );
  style.bottom.forEach((key, i) =>
    paint(key, { x: x + i, y: y + height - 1 - i, width: width - i * 2, height: 1 }),
  );
}

export const innerOf = (box, style) => {
  const depth = style.top.length;

  return {
    x: box.x + depth,
    y: box.y + depth,
    width: box.width - depth * 2,
    height: box.height - depth * 2,
  };
};

// the panel darkens downward in a few even steps, each seam a row of checks so no line shows
export function drawFill(context, box, style) {
  const steps = style.fill;
  const share = box.height / steps.length;

  steps.forEach((key, i) => {
    const top = Math.round(box.y + i * share);
    const bottom = Math.round(box.y + (i + 1) * share);

    fillArt(context, ART_KEYS[key], scaled({ ...box, y: top, height: bottom - top }));

    if (i > 0) {
      checks(context, { x: box.x, y: top, width: box.width }, ART_KEYS[steps[i - 1]]);
    }
  });
}

function checks(context, { x, y, width }, color) {
  context.fillStyle = color;

  for (let i = (x + y) % 2; i < width; i += 2) {
    context.fillRect((x + i) * ART, y * ART, ART, ART);
  }
}
