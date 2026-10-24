import { COLORS } from '../../art/colors.js';
import { LOOT_COLORS } from '../../art/loot-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { LOOT_SPRITES } from '../../data/loot-sprites.js';
import { drawLootFrame } from '../scene/loot-sheets.js';
import { drawText } from '../text/draw-text.js';
import { drawPlaque } from './hud-frames.js';
import { LOWER_BOX } from './top-bar.js';

const WIDTH = 56;
const PADDING = 7;
export const PURSE_BOX = { x: VIEW_WIDTH - WIDTH, ...LOWER_BOX, width: WIDTH };

// the shown purse counts up toward the real one, a coin at a time when it is close
export function easePurse(shown, coins) {
  if (shown >= coins) {
    return coins;
  }
  return shown + Math.max(1, Math.ceil((coins - shown) * 0.2));
}

// the coin turns once and hops as coins come in
function iconPose(bump, tickCount) {
  if (bump <= 0) {
    return { frame: 0, lift: 0 };
  }
  const { frames, ticks } = LOOT_SPRITES.coin;
  return { frame: Math.floor(tickCount / ticks) % frames, lift: bump > 5 ? -1 : 0 };
}

// the purse hangs under the score, as the lives hang under the weapon
export function drawPurse(painter, game, view) {
  drawPlaque(painter, view.hudFrames, 'panel', PURSE_BOX);
  view.shownCoins = easePurse(view.shownCoins, game.coins);
  const { frame, lift } = iconPose(game.purseBump, game.tickCount);
  const { x, y, width } = PURSE_BOX;
  drawLootFrame(painter, view.lootSheets, {
    name: 'coin',
    frame,
    x: x + PADDING + 4,
    y: y + 12 + lift,
  });
  const color = game.purseBump > 5 ? COLORS.white : LOOT_COLORS.coinText;
  const text = String(Math.min(view.shownCoins, 99999)).padStart(5, '0');
  drawText(painter, text, { x: x + width - PADDING, y: y + 5, color, align: 'right' });
}
