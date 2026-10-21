import { defineMove } from '../../moves/define-move.js';
import { CHOP, DIVE, SPIN, THRUST } from '../technique-poses.js';

// the drill of the soldiers carved on the Bayon: break the line, wheel through it, march the ranks
// forward, then drop from the terrace on whoever is left
export const ANGKOR_TECHNIQUES = {
  S1: defineMove({
    name: 'Gate of Victory',
    frames: [8, 4, 18],
    damage: 12,
    hitbox: [4, -42, 28, 42],
    knockback: [2.6, -3],
    knockdown: true,
    armor: true,
    forward: 2,
    soldiers: 1,
    sprite: ['cleave', 3],
    ...CHOP,
  }),
  S2: defineMove({
    name: 'Churning of the Sea',
    frames: [7, 12, 18],
    damage: 4,
    hitbox: [-12, -36, 44, 32],
    knockback: [0.8, 0],
    multiHit: 4,
    pull: true,
    finalKnockback: [2.8, -3],
    knockdown: true,
    sprite: ['spin_slash', 3],
    ...SPIN,
  }),
  S3: defineMove({
    name: 'Bayon March',
    frames: [8, 8, 20],
    damage: 11,
    hitbox: [6, -32, 30, 18],
    knockback: [3.6, -2.4],
    knockdown: true,
    sustain: true,
    haltOnHit: true,
    forward: 4.2,
    soldiers: 2,
    sprite: ['thrust', 3],
    ...THRUST,
  }),
  AS: defineMove({
    name: 'Terrace of Elephants',
    frames: [7, 40, 14],
    damage: 11,
    hitbox: [-4, -8, 18, 16],
    knockback: [2.4, -3],
    dive: [0.8, 6.6],
    shockwave: true,
    sprite: ['plunge', 2],
    ...DIVE,
  }),
};
