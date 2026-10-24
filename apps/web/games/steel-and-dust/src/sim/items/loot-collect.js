import { LOOT_COLORS } from '../../art/loot-colors.js';
import { APPLE_HEAL, COIN_STREAK, LOOT_VALUES } from '../../data/loot.js';
import { addFloatText } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';
import { addSparkle } from './loot-fx.js';
import { addToPurse } from './loot-pieces.js';

const PURSE_BUMP = 10;

// each coin in a quick run rings a step higher up the scale, up to its top
export function streakRate(streak) {
  const { scale } = COIN_STREAK;
  return 2 ** (scale[Math.min(streak, scale.length - 1)] / 12);
}

function takeCoin(game, piece) {
  const streak = game.coinStreak;
  streak.count = streak.timer > 0 ? streak.count + 1 : 0;
  streak.timer = COIN_STREAK.window;
  game.io.sfx('coin', false, { x: piece.x, rate: streakRate(streak.count) });
}

function takeGem(game, piece) {
  const { score } = LOOT_VALUES.gem;
  addFloatText(game, {
    x: piece.x,
    y: piece.y - 12,
    text: `+${score}`,
    color: LOOT_COLORS.gemText,
  });
  game.io.sfx('gem', false, { x: piece.x });
  buzz(game, 12);
}

function eatApple(game, piece) {
  const { player } = game;
  player.hp = Math.min(player.maxHp, player.hp + APPLE_HEAL);
  addFloatText(game, {
    x: piece.x,
    y: piece.y - 12,
    text: `+${APPLE_HEAL} HP`,
    color: LOOT_COLORS.appleText,
  });
  game.io.sfx('appleBite', false, { x: piece.x });
  game.io.sfx('heal');
}

const TAKE = { coin: takeCoin, gem: takeGem, apple: eatApple };

export function collectPiece(game, piece) {
  piece.taken = true;
  addToPurse(game, piece.kind);
  TAKE[piece.kind](game, piece);
  addSparkle(game, { x: piece.x, y: piece.y - 4 });
  if (piece.kind !== 'apple') {
    game.purseBump = PURSE_BUMP;
  }
}
