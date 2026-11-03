import { KIT_FACES, KIT_GEAR, KIT_HAIR } from '../../../art/face-kit/index.js';
import { decodePart } from './decode.js';

const decoded = new Map();

function decodedOf(key, text) {
  if (!text) {
    return null;
  }

  if (!decoded.has(key)) {
    decoded.set(key, decodePart(text));
  }

  return decoded.get(key);
}

export const facePart = (face, mood) => decodedOf(`face:${face}:${mood}`, KIT_FACES[face]?.[mood]);

export const hairPart = (hair) => decodedOf(`hair:${hair}`, KIT_HAIR[hair]);

export const gearPart = (gear) => decodedOf(`gear:${gear}`, KIT_GEAR[gear]);

export const moodsOf = (face) => Object.keys(KIT_FACES[face] ?? {});
