import { ULT_FULL, ULT_MAX } from '../../config.js';
import { difficultyOf } from '../../data/difficulty.js';
import { isHeavyMove } from '../../data/moves/heavy-moves.js';

const LIGHT_SHARE = 0.8;

export function addUltMeter(game, amount) {
  game.ultMeter = Math.min(ULT_MAX, game.ultMeter + amount);
}

export function heavyCost(game) {
  return difficultyOf(game.settings).heavyCost;
}

export function canAffordHeavy(game) {
  return game.ultMeter >= heavyCost(game);
}

export function spendHeavy(game) {
  game.ultMeter = Math.max(0, game.ultMeter - heavyCost(game));
}

export function ultReady(game) {
  return game.ultMeter >= ULT_FULL;
}

export function spendUlt(game) {
  game.ultMeter = Math.max(0, game.ultMeter - ULT_FULL);
}

// light fills the bar and heavy spends it: only the hero's own light blows charge it, not heavies,
// ultimates, or the summons and shots they leave (those strike through a stand-in attacker);
// a blow the hero takes charges it too
export function meterForHit(game, { attacker, target, move }, damage) {
  if (attacker === game.player) {
    return move.ultimate || isHeavyMove(move) ? 0 : damage * LIGHT_SHARE;
  }
  return target === game.player ? damage : 0;
}
