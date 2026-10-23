import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { drawItemIcon } from '../scene/item-icons.js';
import { drawText, textWidth } from '../text/draw-text.js';
import { drawPlaque } from './hud-frames.js';
import { ROW_ONE, ROW_TWO, WEAPON_BOX } from './top-bar.js';

const SLOT = { x: WEAPON_BOX.x + 7, y: 5, size: 18 };
const COLUMN_X = SLOT.x + SLOT.size + 4;

// a 9x5 infinity sign as [left, width] runs, one row at a time from the top
const LOOP_EDGE = [
  [1, 2],
  [6, 2],
];
const LOOP_SIDES = [
  [0, 1],
  [3, 1],
  [5, 1],
  [8, 1],
];
const INFINITY_ROWS = [
  LOOP_EDGE,
  LOOP_SIDES,
  [
    [0, 1],
    [4, 1],
    [8, 1],
  ],
  LOOP_SIDES,
  LOOP_EDGE,
];

function drawInfinity(painter, x, y) {
  for (const [color, offset] of [
    [COLORS.outline, 1],
    [COLORS.lilac, 0],
  ]) {
    painter.use(color);
    INFINITY_ROWS.forEach((runs, row) => {
      for (const [left, width] of runs) {
        painter.rect(x + left + offset, y + row + offset, width, 1);
      }
    });
  }
}

function drawDurability(painter, weapon, def, tickCount) {
  if (weapon.durability === Infinity) {
    drawInfinity(painter, COLUMN_X, ROW_TWO);
    return;
  }
  const text = `${weapon.durability}`;
  const warn = weapon.durability / def.durability <= 0.25;
  drawText(painter, text, { x: COLUMN_X, y: ROW_TWO, color: warn ? COLORS.coral : COLORS.lilac });
  if (warn && (tickCount >> 3) & 1) {
    drawText(painter, '!', { x: COLUMN_X + textWidth(text, 1) + 2, y: ROW_TWO, color: COLORS.red });
  }
}

function drawSlot(painter, { weapon, def, popup }) {
  const pop = popup > 0 ? Math.min(1, popup / 12) : 0;
  const { x, y, size } = SLOT;
  painter.use(pop && (popup >> 1) & 1 ? COLORS.white : COLORS.outline).rect(x, y, size, size);
  painter.use(HUD_COLORS.panelLine).rect(x + 1, y + 1, size - 2, size - 2);
  drawItemIcon(painter, weapon.id, x + size / 2, y + size / 2);
  if (pop) {
    painter
      .alpha(pop * 0.8)
      .use(def.trailColor)
      .outline(x - 2, y - 2, size + 4, size + 4);
    painter.alpha(1);
  }
  return pop;
}

// the icon spans both rows, with the weapon's name over the hits it has left
export function drawWeaponBox(painter, game, view) {
  drawPlaque(painter, view.hudFrames, 'panel', WEAPON_BOX);
  const weapon = game.player.weapon;
  const def = WEAPONS[weapon.id];
  const pop = drawSlot(painter, { weapon, def, popup: game.weaponPopup });
  drawText(painter, def.name, {
    x: COLUMN_X,
    y: ROW_ONE,
    color: pop ? def.trailColor : COLORS.sand,
  });
  drawDurability(painter, weapon, def, game.tickCount);
}
