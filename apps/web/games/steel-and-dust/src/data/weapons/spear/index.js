import { WEAPON_COLORS } from '../../../art/weapon-colors.js';
import { normalizeMoves } from '../../moves/define-move.js';
import { SPEAR_STRING_MOVES } from './string-moves.js';
import { SPEAR_HEAVY_MOVES } from './heavy-moves.js';
import { SPEAR_AIR_MOVES } from './air-moves.js';

export const SPEAR = {
  name: 'Spear',
  spriteRow: 2,
  durability: 40,
  trailColor: WEAPON_COLORS.spear.trail,
  hitSound: 'pierce',
  sparkColor: WEAPON_COLORS.spear.spark,
  bladed: true,
  guardPose: { frontArm: 1.3, frontForearm: 0.2, weaponAngle: -0.1 },
  description: 'Longest reach. Keep raiders at the tip.',
  tryCombos: [
    '↓+J trips a raider, then J J J J J',
    'K K K: Dragon Tail hooks them back up. Hold ↑, Air J J J K',
    '↑+J, Air J J, ↓+J pogo, Air J J K',
    'Hold K to max for Cyclone: it drags raiders in and launches them all',
  ],
  moves: normalizeMoves({ ...SPEAR_STRING_MOVES, ...SPEAR_HEAVY_MOVES, ...SPEAR_AIR_MOVES }),
};
