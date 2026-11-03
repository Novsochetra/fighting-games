import { plot } from '../raster.js';
import { paintRimmed } from './light.js';

// People as the eye catches them at a distance or against a light: a head, shoulders and the
// set of the body. `pose` is 'stand', 'sit' (on the ground, seen from behind), 'child' or 'robe'
// (a monk's or a long skirt); `bun` puts up a woman's hair.

const inHead = (x, y, { headX, headY, radius }) =>
  (x - headX) ** 2 + (y - headY) ** 2 <= radius * radius + 0.5;

function inBody(x, y, body) {
  const { center, shoulders, hips, ground, half, pose } = body;
  const dx = Math.abs(x - center);

  if (y < shoulders || y > ground) {
    return false;
  }

  if (y <= hips) {
    const along = (y - shoulders) / Math.max(1, hips - shoulders);

    return dx <= half * (1 - along * 0.2) + (y === shoulders ? -1 : 0);
  }

  if (pose === 'sit') {
    return dx <= half * 1.45;
  }

  if (pose === 'robe') {
    return dx <= half * (0.8 + ((y - hips) / (ground - hips)) * 0.4);
  }

  return dx <= half * 0.85 && dx >= (y > hips + 2 ? 0.5 : -1);
}

export function figureShape({ x, ground, height, pose = 'stand', bun = false, build = 1 }) {
  const headShare = pose === 'child' ? 0.17 : 0.12;
  const radius = Math.max(1, height * headShare * 0.95);
  const head = { headX: x, headY: ground - height + radius, radius };
  const shoulders = Math.round(ground - height + radius * 2 + 1);
  const hips = Math.round(pose === 'sit' ? ground - height * 0.22 : ground - height * 0.46);
  const body = {
    center: x,
    shoulders,
    hips,
    ground,
    half: Math.max(1.5, height * 0.15 * build),
    pose,
  };
  const knot = { headX: x, headY: head.headY - radius, radius: radius * 0.55 };

  return {
    box: {
      x: Math.floor(x - height * 0.4),
      y: Math.floor(ground - height - radius),
      width: Math.ceil(height * 0.8) + 2,
      height: Math.ceil(height + radius) + 2,
    },
    inside: (px, py) =>
      inHead(px, py, head) || inBody(px, py, body) || (bun && inHead(px, py, knot)),
  };
}

// `colors` [body, rim]; `toward` is a step toward the light that rims the figure's edge
export function paintFigure(raster, { colors, toward, ...shape }) {
  paintRimmed(raster, { ...figureShape(shape), colors, toward });
}

function dressedColor(colors, { y, top, height, headBottom }) {
  if (y < top + (headBottom - top) * 0.45) {
    return colors.hair;
  }

  if (y <= headBottom) {
    return colors.skin;
  }

  if (y < top + height * 0.56) {
    return colors.shirt;
  }

  return y < top + height * 0.78 ? colors.shorts : colors.skin;
}

// a child in school clothes, seen small in daylight: black hair, a shirt, shorts, bare legs;
// `colors` = { hair, skin, shirt, shorts }
export function paintDressed(raster, { x, ground, height, pose = 'child', colors }) {
  const { box, inside } = figureShape({ x, ground, height, pose });
  const top = ground - height;
  const headBottom = top + height * 0.3;

  for (let y = box.y; y < box.y + box.height; y += 1) {
    for (let column = box.x; column < box.x + box.width; column += 1) {
      if (inside(column, y)) {
        plot(raster, column, y, dressedColor(colors, { y, top, height, headBottom }));
      }
    }
  }
}
