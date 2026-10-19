import { COLORS } from '../../art/colors.js';
import { ITEM_COLORS as ITEM } from '../../art/item-colors.js';
import { point } from '../painter.js';

function fists(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 4, y - 4, 8, 8);
  painter.use(ITEM.fistsSkin).rect(x - 3, y - 3, 6, 6);
  painter.use(COLORS.white).rect(x - 3, y - 3, 6, 1);
  painter.use(ITEM.fistsKnuckle).rect(x - 2, y, 1, 1);
  painter.use(ITEM.fistsKnuckle).rect(x, y, 1, 1);
}

function sword(painter, x, y) {
  painter.use(ITEM.wood).limb(point(x - 5, y + 5), point(x - 2, y + 2), 2, COLORS.outline);
  painter.use(ITEM.swordBlade).limb(point(x - 2, y + 2), point(x + 5, y - 5), 2, COLORS.outline);
  painter.use(ITEM.gold).line(point(x - 4, y), point(x, y + 4), 2);
  painter.use(COLORS.white).rect(x + 4, y - 5, 1, 1);
}

function spear(painter, x, y) {
  painter.use(ITEM.wood).limb(point(x - 6, y + 6), point(x + 3, y - 3), 1, COLORS.outline);
  painter.use(COLORS.steel).limb(point(x + 2, y - 2), point(x + 6, y - 6), 2, COLORS.outline);
  painter.use(ITEM.spearTassel).rect(x + 1, y - 2, 2, 2);
}

function axe(painter, x, y) {
  painter.use(ITEM.wood).limb(point(x - 5, y + 6), point(x + 3, y - 3), 2, COLORS.outline);
  painter.use(COLORS.outline).rect(x, y - 7, 7, 7);
  painter.use(COLORS.steel).rect(x + 1, y - 6, 5, 5);
  painter.use(COLORS.white).rect(x + 5, y - 6, 1, 5);
}

function ration(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 5, y - 4, 10, 9);
  painter.use(ITEM.rationTin).rect(x - 4, y - 3, 8, 7);
  painter.use(ITEM.rationLabel).rect(x - 4, y - 1, 8, 3);
  painter.use(COLORS.white).rect(x - 4, y - 3, 8, 1);
  painter.use(COLORS.butter).rect(x - 1, y, 2, 1);
}

const ICONS = { fists, sword, spear, axe, ration };

export function drawItemIcon(painter, id, x, y) {
  const draw = ICONS[id];
  if (draw) {
    draw(painter, x, y);
  }
}
