import { defineMove } from '../../moves/define-move.js';
import { CHOP, METEOR, SPIN, THRUST } from '../technique-poses.js';

// one clean draw at a time: freeze from range, hold them in the cold, then break the ice in one thrust
export const BLUE_TECHNIQUES = {
  S1: defineMove({
    name: 'Hoarfrost Draw',
    frames: [4, 4, 18],
    damage: 9,
    hitbox: [0, -34, 48, 24],
    knockback: [1.2, 0],
    freeze: 30,
    forward: 2.4,
    afterimages: true,
    sprite: ['slash1', 2],
    ...CHOP,
  }),
  S2: defineMove({
    name: 'Winter Edge',
    frames: [6, 12, 18],
    damage: 5,
    hitbox: [-10, -40, 40, 36],
    knockback: [0.8, 0],
    multiHit: 4,
    freeze: 24,
    forward: 1.6,
    sprite: ['spin_slash', 3],
    ...SPIN,
  }),
  S3: defineMove({
    name: 'Shatterpoint',
    frames: [8, 4, 22],
    damage: 14,
    hitbox: [4, -32, 44, 12],
    knockback: [4.6, -3],
    knockdown: true,
    shatters: true,
    forward: 3.6,
    sprite: ['thrust', 3],
    ...THRUST,
  }),
  AS: defineMove({
    name: 'Frostfall',
    frames: [6, 4, 14],
    damage: 9,
    hitbox: [0, -30, 28, 36],
    knockback: [1.5, 0],
    spike: true,
    freeze: 30,
    sprite: ['meteor_slash', 3],
    ...METEOR,
  }),
};
