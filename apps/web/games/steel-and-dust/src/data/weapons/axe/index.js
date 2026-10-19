import { WEAPON_COLORS } from '../../../art/weapon-colors.js';
import { normalizeMoves } from '../../moves/define-move.js';
import { AXE_STRING_MOVES } from './string-moves.js';
import { AXE_HEAVY_MOVES } from './heavy-moves.js';
import { AXE_AIR_MOVES } from './air-moves.js';

export const AXE = {
  name: 'Axe',
  spriteRow: 3,
  durability: 26,
  trailColor: WEAPON_COLORS.axe.trail,
  hitSound: 'heavy',
  sparkColor: WEAPON_COLORS.axe.spark,
  bladed: false,
  guardPose: { frontArm: 1.35, frontForearm: -0.95, weaponAngle: -2.4 },
  description: 'Slow and brutal. Ground Smash ignores hits and sends shockwaves.',
  tryCombos: [
    'K K: Ground Smash, then Executioner slams them off the ground for J J J',
    'K K K: Rampage pulls the crowd in and launches them. Hold ↑ to follow',
    '↑+J, Air J J, ↓+J Skull Hop, Air J J K',
    'Hold K to max: Cataclysm launches every raider on the ground',
  ],
  moves: normalizeMoves({ ...AXE_STRING_MOVES, ...AXE_HEAVY_MOVES, ...AXE_AIR_MOVES }),
};
