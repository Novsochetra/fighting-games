import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { drawItemIcon } from '../scene/item-icons.js';
import { drawText } from '../text/draw-text.js';
import { drawBar } from './bar.js';
import { drawHudFrame } from './hud-frames.js';
import { drawLives } from './lives.js';

const FRAME = { x: 0, y: 0, width: 132, height: 62 };
// the stone frame's corners would cover the panel's first letters, so everything inside moves in
const INSET = 2;

function healthColor(fraction, tickCount) {
  if (fraction > 0.5) {
    return COLORS.mint;
  }
  if (fraction > 0.25) {
    return COLORS.amber;
  }
  return (tickCount >> 3) & 1 ? COLORS.red : COLORS.salmon;
}

function drawHealth(painter, player, tickCount) {
  const fraction = player.hp / player.maxHp;
  drawText(painter, 'SHADE', { x: 6, y: 6, color: COLORS.mint });
  drawBar(painter, {
    x: 30,
    y: 5,
    width: 92,
    height: 7,
    fraction,
    lag: player.hpLag / player.maxHp,
    color: healthColor(fraction, tickCount),
  });
  const low = fraction <= 0.25;
  drawText(painter, `${Math.ceil(player.hp)}`, {
    x: 121,
    y: 14,
    color: low ? COLORS.salmon : COLORS.lilac,
    align: 'right',
  });
}

function drawDurability(painter, weapon, def, tickCount) {
  if (weapon.durability === Infinity) {
    drawText(painter, 'no limit', { x: 27, y: 26, color: COLORS.lilac });
    return;
  }
  const fraction = weapon.durability / def.durability;
  const warn = fraction <= 0.25;
  const flicker = (tickCount >> 3) & 1;
  const warningColor = flicker ? COLORS.red : COLORS.coral;
  painter.use(COLORS.outline).rect(26, 26, 46, 5);
  painter.use(HUD_COLORS.barTrough).rect(27, 27, 44, 3);
  painter.use(warn ? warningColor : def.trailColor).rect(27, 27, Math.ceil(44 * fraction), 3);
  drawText(painter, `${weapon.durability}`, {
    x: 96,
    y: 26,
    color: warn ? COLORS.coral : COLORS.lilac,
    align: 'right',
  });
  if (warn && flicker) {
    drawText(painter, '!', { x: 100, y: 26, color: COLORS.coral });
  }
}

function drawWeaponSlot(painter, game) {
  const weapon = game.player.weapon;
  const def = WEAPONS[weapon.id];
  const popup = game.weaponPopup;
  const pop = popup > 0 ? Math.min(1, popup / 12) : 0;
  painter.use(pop && (popup >> 1) & 1 ? COLORS.white : COLORS.outline).rect(5, 16, 18, 18);
  painter.use(HUD_COLORS.panelLine).rect(6, 17, 16, 16);
  drawItemIcon(painter, weapon.id, 14, 25);
  if (pop) {
    painter
      .alpha(pop * 0.8)
      .use(def.trailColor)
      .outline(3, 14, 22, 22);
    painter.alpha(1);
  }
  drawText(painter, def.name, { x: 27, y: 18, color: pop ? def.trailColor : COLORS.sand });
  drawDurability(painter, weapon, def, game.tickCount);
}

function ultColor(full, tickCount) {
  if (!full) {
    return HUD_COLORS.ultFill;
  }
  return (tickCount >> 2) & 1 ? COLORS.gold : COLORS.cream;
}

function drawUltGauge(painter, game) {
  const full = game.ultMeter >= 100;
  const tickCount = game.tickCount;
  drawText(painter, 'ULT', { x: 6, y: 37, color: full ? COLORS.gold : COLORS.lilac });
  painter.use(COLORS.outline).rect(21, 36, 72, 7);
  painter.use(HUD_COLORS.barBack).rect(22, 37, 70, 5);
  painter.use(ultColor(full, tickCount)).rect(22, 37, Math.round((70 * game.ultMeter) / 100), 5);
  for (let i = 1; i < 4; i++) {
    painter.use(COLORS.outline).rect(22 + Math.round(i * 17.5), 37, 1, 5);
  }
  if (!full) {
    return;
  }
  drawText(painter, (tickCount >> 4) & 1 ? 'READY' : '', { x: 96, y: 37, color: COLORS.gold });
  if ((tickCount >> 2) & 1) {
    painter.alpha(0.5).use(COLORS.gold).outline(20, 35, 74, 9);
    painter.alpha(1);
  }
}

export function drawPlayerPanel(painter, game, view) {
  painter
    .alpha(0.55)
    .use(COLORS.night)
    .rect(2, 2, FRAME.width - 4, FRAME.height - 4);
  painter.alpha(1);
  drawHudFrame(painter, view.hudFrames, 'panel', FRAME);
  const { context } = painter;
  context.save();
  context.translate(INSET, INSET);
  drawHealth(painter, game.player, game.tickCount);
  drawWeaponSlot(painter, game);
  drawUltGauge(painter, game);
  drawLives(painter, { lives: game.lives, x: 6, y: 47 });
  context.restore();
}
