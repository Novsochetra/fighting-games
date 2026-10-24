import { COLORS } from '../../art/colors.js';
import { LOOT_COLORS } from '../../art/loot-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { LOOT_SPRITES } from '../../data/loot-sprites.js';
import { drawLootFrame } from '../scene/loot-sheets.js';
import { drawText } from '../text/draw-text.js';
import { drawBoxStamped } from './box-stamp.js';
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

function drawParts(painter, { view, face }) {
  const { x, y } = PURSE_BOX;
  drawPlaque(painter, view.hudFrames, 'panel', PURSE_BOX);
  const coin = { name: 'coin', frame: face.frame, x: x + PADDING + 4, y: y + 12 + face.lift };
  drawLootFrame(painter, view.lootSheets, coin);
  const text = { x: x + WIDTH - PADDING, y: y + 5, color: face.color, align: 'right' };
  drawText(painter, face.text, text);
}

// the purse hangs under the score, as the lives hang under the weapon
export function drawPurse(painter, game, view) {
  view.shownCoins = easePurse(view.shownCoins, game.coins);
  const face = {
    ...iconPose(game.purseBump, game.tickCount),
    text: String(Math.min(view.shownCoins, 99999)).padStart(5, '0'),
    color: game.purseBump > 5 ? COLORS.white : LOOT_COLORS.coinText,
  };
  drawBoxStamped(painter, {
    key: `purse|${face.text}|${face.frame}|${face.lift}|${face.color}`,
    box: PURSE_BOX,
    ready: `${Boolean(view.hudFrames.ready.panel)}${Boolean(view.lootSheets.ready.coin)}`,
    draw: (inner) => drawParts(inner, { view, face }),
  });
}
