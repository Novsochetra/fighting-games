import { defineMove } from '../../moves/define-move.js';
import { CHOP, DIVE, LIFT, SWEEP } from '../technique-poses.js';

// a gardener's control: snare them low, wall them off, then the whole grove rises around the Shade
export const MOSS_TECHNIQUES = {
  S1: defineMove({
    name: 'Root Snare',
    frames: [6, 4, 16],
    damage: 9,
    // roots lash along the ground, far enough to catch a raider the heavy just threw
    hitbox: [2, -16, 62, 16],
    knockback: [0.6, 0],
    hitstun: 34,
    low: true,
    thorns: 1,
    thornsAhead: 52,
    sprite: ['cleave', 3],
    ...SWEEP,
  }),
  S2: defineMove({
    name: 'Bramble Wall',
    frames: [10, 4, 20],
    damage: 10,
    hitbox: [4, -40, 26, 40],
    knockback: [2.4, -3],
    knockdown: true,
    armor: true,
    forward: 2,
    thorns: 4,
    sprite: ['cleave', 3],
    ...CHOP,
  }),
  S3: defineMove({
    name: 'Grove Wrath',
    frames: [8, 5, 22],
    damage: 14,
    hitbox: [0, -50, 30, 50],
    knockback: [0.6, -6.4],
    launch: true,
    jumpCancel: true,
    thorns: 2,
    thornRing: true,
    sprite: ['rising_dragon', 2],
    ...LIFT,
  }),
  AS: defineMove({
    name: 'Seedfall',
    frames: [6, 40, 12],
    damage: 10,
    hitbox: [-2, -8, 16, 16],
    knockback: [2, -2.5],
    dive: [1.2, 5.5],
    bounce: true,
    thorns: 2,
    sprite: ['plunge', 2],
    ...DIVE,
  }),
};
