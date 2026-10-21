import { defineMove } from '../../moves/define-move.js';
import { CHOP, DIVE, LIFT, THRUST } from '../technique-poses.js';

// the old fighting art of Angkor: crush with the elbow, lift with the knee, let the lion pounce
export const BOKATOR_TECHNIQUES = {
  S1: defineMove({
    name: 'Elbow Crush',
    frames: [6, 4, 16],
    damage: 11,
    hitbox: [4, -38, 24, 32],
    knockback: [2.4, -3],
    knockdown: true,
    armor: true,
    forward: 2,
    sprite: ['cleave', 3],
    ...CHOP,
  }),
  S2: defineMove({
    name: 'Naga Knee',
    frames: [5, 5, 20],
    damage: 12,
    hitbox: [0, -48, 26, 44],
    knockback: [0.6, -6.4],
    launch: true,
    jumpCancel: true,
    sprite: ['rising_dragon', 2],
    ...LIFT,
  }),
  S3: defineMove({
    name: "Lion's Pounce",
    frames: [7, 8, 20],
    damage: 10,
    hitbox: [6, -32, 30, 16],
    knockback: [4, -2.6],
    knockdown: true,
    sustain: true,
    haltOnHit: true,
    forward: 4.6,
    lions: 1,
    sprite: ['thrust', 3],
    ...THRUST,
  }),
  AS: defineMove({
    name: 'Falling Elbow',
    frames: [6, 40, 12],
    damage: 11,
    hitbox: [-2, -8, 18, 16],
    knockback: [2, -3],
    dive: [1.2, 6.4],
    bounce: true,
    sprite: ['meteor_slash', 3],
    ...DIVE,
  }),
};
