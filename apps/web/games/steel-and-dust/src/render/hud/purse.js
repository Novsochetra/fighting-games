import { COLORS } from '../../art/colors.js';
import { LOOT_COLORS } from '../../art/loot-colors.js';
import { RENDER_SCALE, VIEW_WIDTH } from '../../config.js';
import { LOOT_SPRITES } from '../../data/loot-sprites.js';
import { createPainter } from '../painter.js';
import { drawLootFrame } from '../scene/loot-sheets.js';
import { drawStamped } from '../stamps.js';
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

function drawParts(painter, { view, face, x, y }) {
  drawPlaque(painter, view.hudFrames, 'panel', { ...PURSE_BOX, x, y });
  const coin = { name: 'coin', frame: face.frame, x: x + PADDING + 4, y: y + 12 + face.lift };
  drawLootFrame(painter, view.lootSheets, coin);
  const text = { x: x + WIDTH - PADDING, y: y + 5, color: face.color, align: 'right' };
  drawText(painter, face.text, text);
}

// the purse hangs under the score, as the lives hang under the weapon. Its frame, coin and count
// are drawn once into a stamp for what it shows, so a frame lays it down with one drawImage
// instead of five canvas calls; the key holds whether its art is in, so it is made again once it is
export function drawPurse(painter, game, view) {
  view.shownCoins = easePurse(view.shownCoins, game.coins);
  const face = {
    ...iconPose(game.purseBump, game.tickCount),
    text: String(Math.min(view.shownCoins, 99999)).padStart(5, '0'),
    color: game.purseBump > 5 ? COLORS.white : LOOT_COLORS.coinText,
  };
  const ready = `${Boolean(view.hudFrames.ready.panel)}${Boolean(view.lootSheets.ready.coin)}`;
  drawStamped(painter, {
    key: `purse|${face.text}|${face.frame}|${face.lift}|${face.color}|${ready}`,
    x: PURSE_BOX.x,
    y: PURSE_BOX.y,
    width: WIDTH,
    height: PURSE_BOX.height,
    resolution: RENDER_SCALE,
    draw: (context, x, y) => drawParts(createPainter(context, null), { view, face, x, y }),
  });
}
