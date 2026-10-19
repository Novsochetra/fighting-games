import { difficultyOf } from '../../data/difficulty.js';

export function takeToken(game, fighter) {
  if (game.attackTokens > 0) {
    game.attackTokens--;
    fighter.hasToken = true;
    return true;
  }
  return false;
}

export function releaseToken(game, fighter) {
  if (fighter.hasToken) {
    fighter.hasToken = false;
    game.attackTokens = Math.min(difficultyOf(game.settings).tokens, game.attackTokens + 1);
  }
}

export function refreshAttackTokens(game) {
  const held = game.fighters.filter((fighter) => fighter.hasToken).length;
  game.attackTokens = Math.max(0, difficultyOf(game.settings).tokens - held);
}
