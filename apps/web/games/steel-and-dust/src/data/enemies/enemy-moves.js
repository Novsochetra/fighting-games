import { normalizeMoves } from '../moves/define-move.js';
import { MELEE_MOVES } from './moves/melee-moves.js';
import { RAIDER_MOVES } from './moves/raider-moves.js';
import { RANGED_MOVES } from './moves/ranged-moves.js';

export const ENEMY_MOVES = normalizeMoves({ ...RAIDER_MOVES, ...MELEE_MOVES, ...RANGED_MOVES });
