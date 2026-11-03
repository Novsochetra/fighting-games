import { EFFECT_FRAMES } from '../../art/effect-kit.js';
import { decodePart } from '../portraits/kit/decode.js';

export const KIT_FRAMES = 6;

const maps = new Map();

function mapOf(text) {
  const part = decodePart(text, {});
  const rows = Array.from({ length: part.height }, (_, y) =>
    part.cells
      .slice(y * part.width, (y + 1) * part.width)
      .map((cell) => cell ?? '.')
      .join(''),
  );

  return { anchor: { x: Math.round(part.anchor.x), y: Math.round(part.anchor.y) }, rows };
}

// a frame of an effect the kit has (src/art/effect-kit.js) as a pixel map (pixel-map.js)
export function kitFrame(effect, index) {
  const key = `${effect}-${(index % KIT_FRAMES) + 1}`;

  if (!maps.has(key) && EFFECT_FRAMES[key]) {
    maps.set(key, mapOf(EFFECT_FRAMES[key]));
  }

  return maps.get(key) ?? null;
}
