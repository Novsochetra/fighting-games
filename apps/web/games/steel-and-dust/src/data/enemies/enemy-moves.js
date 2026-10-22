import { normalizeMoves } from '../moves/define-move.js';
import { COLOSSUS_MOVES } from './moves/colossus-moves.js';
import { KHAN_MOVES } from './moves/khan-moves.js';
import { MELEE_MOVES } from './moves/melee-moves.js';
import { RAIDER_MOVES } from './moves/raider-moves.js';
import { RANGED_MOVES } from './moves/ranged-moves.js';

export const ENEMY_MOVES = normalizeMoves({
  ...RAIDER_MOVES,
  ...MELEE_MOVES,
  ...RANGED_MOVES,
  ...KHAN_MOVES,
  ...COLOSSUS_MOVES,
});
