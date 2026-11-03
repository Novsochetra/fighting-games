import { moveOf } from '../data/moves.js';
import { KICK } from '../data/tuning.js';
import { opensDuel, shotOffersOf } from './combos/offers.js';
import { hasSpirit } from './spirit.js';

const shotMovesOf = (player) =>
  player.moves.map(moveOf).filter((move) => move !== null && move.kind === 'shot');

export const canAffordShotMove = (player) =>
  Boolean(player.star) && shotMovesOf(player).some((move) => hasSpirit(player, move.cost));

// a full charge is let go as a special when it has a special, a combo or a chain on offer and the
// duels are attached to start it
export const canSpecial = (match, player) =>
  Boolean(match.hooks?.special) &&
  player.charge >= KICK.chargeTicks &&
  opensDuel(shotOffersOf(match, player));
