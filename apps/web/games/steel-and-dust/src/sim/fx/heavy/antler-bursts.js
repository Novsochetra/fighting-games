import { fxBetween, fxRandom } from '../fx-random.js';
import { addHoof, addRush, addWisp, kickDust } from './antler-particles.js';

// the spirit antlers grow from the top of its hood and ram down and on as it strikes, or thrust up
// for a launcher (render/fx/heavy/antler-crown.js); these are points along them where that swing
// ends, which burst into ghost fire there
const CROWN_Y = 27;
const THRUST_POINTS = [
  [-2, -9],
  [-4, -13],
  [-5, -17],
  [1, -9],
  [-1, -14],
  [-4, -20],
];
const RAMMED_POINTS = [
  [2, -4],
  [5, -8],
  [7, -11],
  [4, -1],
  [7, -7],
  [10, -12],
];
const BURST = 4;

export const crownOf = (fighter) => ({
  x: fighter.x + fighter.facing * 0.5,
  y: fighter.y - CROWN_Y,
});

export function shedAntlers(game, fighter, move) {
  const crown = crownOf(fighter);
  for (const [dx, dy] of move.launch ? THRUST_POINTS : RAMMED_POINTS) {
    addWisp(game, {
      x: crown.x + dx * fighter.facing,
      y: crown.y + dy,
      vx: fighter.facing * fxBetween(game, 0.2, 0.8),
      vy: -fxBetween(game, 0.3, 0.8),
      life: 14,
    });
  }
}

// a puff of ghost fire bursting every way from its chest as the power leaves it
export function flameBurst(game, at) {
  for (let i = 0; i < BURST; i++) {
    const angle = ((i + fxRandom(game)) / BURST) * Math.PI * 2;
    const speed = fxBetween(game, 1, 1.8);
    addWisp(game, { ...at, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 12 });
  }
}

function rushHeading(fighter, move) {
  if (move.launch) {
    return { vx: fighter.facing * 0.5, vy: -3.2 };
  }
  return move.dive ? { vx: fighter.facing * 2, vy: 2.4 } : { vx: fighter.facing * 3.4, vy: 0 };
}

// streaks of its charge flying low past its legs the way it strikes: on, up for a launcher, down
// for a dive, never across its face
export function chargeRush(game, fighter, move) {
  const heading = rushHeading(fighter, move);
  for (let i = 0; i < 3; i++) {
    const x = fighter.x + fighter.facing * fxBetween(game, -12, -2);
    addRush(game, { x, y: fighter.y - fxBetween(game, 2, 14), ...heading });
  }
}

// it paws the road as it lowers its head, and pushes off it as it strikes
export function stamp(game, fighter, dx) {
  const x = fighter.x + fighter.facing * dx;
  addHoof(game, { x, y: fighter.y });
  kickDust(game, { x, y: fighter.y, direction: -fighter.facing, count: 2 });
}
