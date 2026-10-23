import { MOSS_HEAVY_FEEL } from '../../../data/heavy-feel/moss.js';

// a spinning or thrusting strip names its arc whatever the weapon; other moves name theirs by id
const SWING_OF_SPRITE = { spin_slash: 'spin', thrust: 'thrust' };

// the way each arc throws the grove's power: an angle off the way the Shade faces (up is negative),
// how far either side of it leaves fly and how many; a spin throws few, its whirl carries the rest
export const MOSS_SWINGS = {
  sweep: { angle: -0.15, spread: 0.85, count: 7 },
  thrust: { angle: 0, spread: 0.35, count: 6 },
  rise: { angle: -1.2, spread: 0.6, count: 7 },
  fall: { angle: 0.9, spread: 0.6, count: 7 },
  dive: { angle: 0.8, spread: 0.5, count: 5 },
  spin: { angle: 0, spread: Math.PI, count: 4 },
};

export function mossSwingOf(move) {
  return SWING_OF_SPRITE[move.sprite?.[0]] ?? MOSS_HEAVY_FEEL.moves[move.id]?.swing ?? 'sweep';
}

// the grove's power gathers low in the Shade's body, so its swirl never crosses the face under its hood
export function mossCoreOf(fighter) {
  return { x: fighter.x + fighter.facing * 2, y: fighter.y - 13 };
}
