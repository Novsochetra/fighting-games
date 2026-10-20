import { defineMove } from '../../moves/define-move.js';

const SWING_UP = { frontArm: 2.8, frontForearm: 3, weaponAngle: 2.9, torso: -1.75 };
const SWING_DOWN = {
  frontArm: 0.1,
  frontForearm: 0.1,
  weaponAngle: 0.15,
  torso: -1.2,
  frontFoot: 8,
};
const JAB_BACK = { frontArm: 1.8, frontForearm: 2.8, weaponAngle: 0 };
const JAB_OUT = { frontArm: 0, frontForearm: 0, weaponAngle: 0, frontFoot: 8 };

export const MELEE_MOVES = {
  pipe: defineMove({
    name: 'Pipe Smash',
    frames: [24, 4, 24],
    damage: 10,
    hitbox: [2, -36, 26, 24],
    knockback: [3.2, -1.5],
    windup: SWING_UP,
    strike: SWING_DOWN,
  }),
  claw: defineMove({
    name: 'Claw',
    frames: [14, 3, 18],
    damage: 6,
    hitbox: [4, -26, 16, 10],
    knockback: [2, 0],
    forward: 1.2,
    windup: JAB_BACK,
    strike: JAB_OUT,
  }),
  pounce: defineMove({
    name: 'Pounce',
    frames: [18, 12, 22],
    damage: 8,
    hitbox: [2, -24, 20, 12],
    knockback: [3, -1.5],
    knockdown: true,
    sustain: true,
    forward: 3.6,
    afterimages: true,
    windup: { ...JAB_BACK, crouch: 4 },
    strike: { ...JAB_OUT, backFoot: -9, torso: -1.1 },
  }),
  crosscut: defineMove({
    name: 'Cross Cut',
    frames: [14, 6, 20],
    damage: 5,
    hitbox: [2, -32, 24, 18],
    knockback: [2.4, -0.8],
    multiHit: 3,
    afterimages: true,
    windup: SWING_UP,
    strike: SWING_DOWN,
  }),
  spear: defineMove({
    name: 'Spear Thrust',
    frames: [18, 4, 24],
    damage: 8,
    hitbox: [6, -28, 34, 8],
    knockback: [2.4, 0],
    forward: 1.4,
    windup: JAB_BACK,
    strike: JAB_OUT,
  }),
  haymaker: defineMove({
    name: 'Haymaker',
    frames: [28, 4, 30],
    damage: 14,
    hitbox: [2, -38, 28, 26],
    knockback: [4.5, -2.5],
    knockdown: true,
    armor: true,
    windup: { frontArm: 2.6, frontForearm: 2.3, torso: -1.75 },
    strike: { frontArm: 0, frontForearm: 0, torso: -1.2, frontFoot: 8 },
  }),
  sting: defineMove({
    name: 'Sting',
    frames: [20, 4, 24],
    damage: 9,
    hitbox: [4, -30, 26, 22],
    knockback: [2.5, -1],
    windup: JAB_BACK,
    strike: JAB_OUT,
  }),
};
