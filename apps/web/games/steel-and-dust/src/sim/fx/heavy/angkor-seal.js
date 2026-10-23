import { fxBetween } from '../fx-random.js';

// the lotus seal under his feet at its widest, flattened onto the ground; its petals sit round the
// rim, counted from the back of it
export const SEAL = { rx: 17, flat: 0.3, petals: 8 };
// pillars rise from four petals, each its own column beside him, not the ones his body covers
const SHAFT_PETALS = [2, 3, 6, 7];
const SHAFT_LIFE = 16;

export function sealPetalAngle(index) {
  return -Math.PI / 2 + (index / SEAL.petals) * Math.PI * 2;
}

// pillars of light spring up out of the seal's petals
export function raiseShafts(game, { x, y }) {
  for (const index of SHAFT_PETALS) {
    const angle = sealPetalAngle(index);
    const side = Math.abs(Math.cos(angle));
    game.particles.push({
      kind: 'angkorShaft',
      x: Math.round(x + Math.cos(angle) * SEAL.rx),
      y: Math.round(y + Math.sin(angle) * SEAL.rx * SEAL.flat),
      vx: 0,
      vy: 0,
      life: SHAFT_LIFE,
      maxLife: SHAFT_LIFE,
      tall: Math.round(7 + side * 8 + fxBetween(game, 0, 5)),
    });
  }
}
