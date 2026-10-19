import { WEAPON_COLORS } from '../../../art/weapon-colors.js';
import { normalizeMoves } from '../../moves/define-move.js';
import { SWORD_STRING_MOVES } from './string-moves.js';
import { SWORD_HEAVY_MOVES } from './heavy-moves.js';
import { SWORD_AIR_MOVES } from './air-moves.js';

export const SWORD = {
  name: 'Sword',
  spriteRow: 0,
  durability: 40,
  trailColor: WEAPON_COLORS.sword.trail,
  hitSound: 'blade',
  sparkColor: WEAPON_COLORS.sword.spark,
  bladed: true,
  guardPose: { frontArm: 1, frontForearm: -0.2, weaponAngle: -1.25 },
  description: 'Balanced speed and reach. The all-rounder.',
  tryCombos: [
    'J J J J J, hold ↑, Air J J J K, then J J J J off the bounce',
    'K K K: the last cut sends a slash wave after them',
    '↓+J trips them, ↑+J lifts you both, Air J J J K',
    'Hold K to gold: Crescent Moon, a wave across the screen',
  ],
  moves: normalizeMoves({ ...SWORD_STRING_MOVES, ...SWORD_HEAVY_MOVES, ...SWORD_AIR_MOVES }),
};
