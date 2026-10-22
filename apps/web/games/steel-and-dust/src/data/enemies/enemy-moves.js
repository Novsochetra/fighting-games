import { normalizeMoves } from '../moves/define-move.js';
import { COBRA_MOVES } from './moves/cobra-moves.js';
import { COLOSSUS_MOVES } from './moves/colossus-moves.js';
import { DJINN_MOVES } from './moves/djinn-moves.js';
import { FURNACE_MOVES } from './moves/furnace-moves.js';
import { GNOLL_MOVES } from './moves/gnoll-moves.js';
import { IRONHORN_MOVES } from './moves/ironhorn-moves.js';
import { KHAN_MOVES } from './moves/khan-moves.js';
import { MELEE_MOVES } from './moves/melee-moves.js';
import { QUEEN_MOVES } from './moves/queen-moves.js';
import { RAIDER_MOVES } from './moves/raider-moves.js';
import { RANGED_MOVES } from './moves/ranged-moves.js';

export const ENEMY_MOVES = normalizeMoves({
  ...RAIDER_MOVES,
  ...MELEE_MOVES,
  ...RANGED_MOVES,
  ...KHAN_MOVES,
  ...COLOSSUS_MOVES,
  ...IRONHORN_MOVES,
  ...COBRA_MOVES,
  ...QUEEN_MOVES,
  ...GNOLL_MOVES,
  ...DJINN_MOVES,
  ...FURNACE_MOVES,
});
