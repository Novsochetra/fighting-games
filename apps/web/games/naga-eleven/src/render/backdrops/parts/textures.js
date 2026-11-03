import { hash } from '../hash.js';

// texture functions for a lit surface: how many ramp steps a pixel sits below its light

// the woven bamboo of a Khmer wall, kantel: strips crossing on the diagonal
export function weave(x, y) {
  const strip = (Math.floor((x + y) / 6) + Math.floor((x - y + 600) / 6)) % 2 === 0;
  const seam = strip ? (x + y) % 6 === 0 : (x - y + 600) % 6 === 0;

  return (seam ? -0.9 : 0) + (strip ? 0.15 : -0.25);
}

// planks laid along x, `gap` rows apart, with a grain that wanders down each plank
export const planks = (gap) => (x, y) =>
  (y % gap === 0 ? -1.4 : 0) - (hash(Math.floor(x / 11), Math.floor(y / gap)) > 0.6 ? 0.5 : 0);

// square tiles `size` wide with a grout line
export const tiles = (size) => (x, y) => (x % size === 0 || y % size === 0 ? -1 : 0);
