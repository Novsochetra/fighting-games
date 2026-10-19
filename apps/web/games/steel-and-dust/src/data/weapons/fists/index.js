import { WEAPON_COLORS } from '../../../art/weapon-colors.js';
import { normalizeMoves } from '../../moves/define-move.js';
import { FISTS_STRING_MOVES } from './string-moves.js';
import { FISTS_HEAVY_MOVES } from './heavy-moves.js';
import { FISTS_AIR_MOVES } from './air-moves.js';

export const FISTS = {
  name: 'Fists',
  spriteRow: 1,
  durability: Infinity,
  trailColor: WEAPON_COLORS.fists.trail,
  hitSound: 'blunt',
  sparkColor: WEAPON_COLORS.fists.spark,
  bladed: false,
  guardPose: { frontArm: 1.1, frontForearm: -0.7, weaponAngle: 0 },
  description: 'Fast and short. Always with you, never breaks.',
  tryCombos: [
    'J J J J J: Dragon Fist chases them down and launches. Hold ↑ to follow, Air J J J K',
    '↑+J lifts you both, Air J J J, ↓+J stomp, Air J J K',
    'K K K: Roundhouse, Hurricane Kick, then Meteor Fist into the wall',
    'J J J J, hold K to max: Tiger Rush',
  ],
  moves: normalizeMoves({ ...FISTS_STRING_MOVES, ...FISTS_HEAVY_MOVES, ...FISTS_AIR_MOVES }),
};
