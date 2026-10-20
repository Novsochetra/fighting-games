import { defineMove } from '../../moves/define-move.js';

const THROW_BACK = { frontArm: -2.3, frontForearm: -2.5, weaponAngle: -2.7, torso: -1.7 };
const THROW_OUT = { frontArm: 0.3, frontForearm: 0.1, weaponAngle: 0.2, torso: -1.3, frontFoot: 6 };
const NO_HIT = { damage: 0, hitbox: [0, 0, 0, 0], knockback: [0, 0] };

// the shot leaves on the first active frame; sim/hazards/enemy-shots.js flies it
export const RANGED_MOVES = {
  lob: defineMove({
    name: 'Fire Pot',
    frames: [22, 1, 28],
    ...NO_HIT,
    projectile: 'bomb',
    windup: THROW_BACK,
    strike: THROW_OUT,
  }),
  bolt: defineMove({
    name: 'Crossbow Bolt',
    frames: [34, 1, 30],
    ...NO_HIT,
    projectile: 'bolt',
    windup: { frontArm: 1.4, frontForearm: 0.2, weaponAngle: 0, torso: -1.55 },
    strike: { frontArm: 1.4, frontForearm: 0.2, weaponAngle: 0, torso: -1.75 },
  }),
  sandblast: defineMove({
    name: 'Sand Blast',
    frames: [30, 1, 30],
    ...NO_HIT,
    projectile: 'sand',
    windup: THROW_BACK,
    strike: THROW_OUT,
  }),
};
