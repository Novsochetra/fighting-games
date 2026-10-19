import { COLORS } from '../../art/colors.js';
import { GHOST_PALETTE } from '../../art/tinted-palettes.js';
import { WEAPON_ART as ART } from '../../art/weapon-art.js';
import { point } from '../painter.js';

function weaponColors(ghost) {
  return {
    outline: ghost ? GHOST_PALETTE.outline : COLORS.outline,
    steel: ghost ? GHOST_PALETTE.jacket : ART.steel,
    wood: ghost ? GHOST_PALETTE.jacket : ART.wood,
    gold: ghost ? GHOST_PALETTE.jacket : ART.gold,
  };
}

function sword(painter, { line, hand, crossX, crossY, ghost, colors }) {
  painter.use(colors.wood).limb(line.grip, hand, 2, colors.outline);
  if (!ghost) {
    painter.alpha(0.3).use(ART.swordGlow).line(hand, line.tip, 5);
    painter.alpha(1);
  }
  painter.use(ghost ? colors.steel : ART.swordBlade).limb(hand, line.tip, 2, colors.outline);
  if (!ghost) {
    const edgeFrom = point(hand.x + line.dx * 3, hand.y + line.dy * 3);
    painter.use(ART.swordEdge).line(edgeFrom, point(line.tip.x - line.dx, line.tip.y - line.dy), 1);
  }
  const guardFrom = point(hand.x - crossX * 3, hand.y - crossY * 3);
  painter.use(colors.gold).line(guardFrom, point(hand.x + crossX * 3, hand.y + crossY * 3), 2);
}

function spear(painter, { line, scale, ghost, colors }) {
  painter.use(colors.wood).limb(line.grip, line.tip, 2, colors.outline);
  const head = point(line.tip.x - line.dx * 5 * scale, line.tip.y - line.dy * 5 * scale);
  painter.use(colors.steel).limb(head, line.tip, 3, colors.outline);
  if (!ghost) {
    painter.use(ART.spearEdge).line(head, line.tip, 1);
    painter.use(ART.spearGlow).rect(head.x - 1, head.y, 2, 3);
    painter.use(COLORS.white).rect(line.tip.x, line.tip.y, 1, 1);
  }
}

function axe(painter, { line, scale, crossX, crossY, ghost, colors }) {
  painter.use(colors.wood).limb(line.grip, line.tip, 2, colors.outline);
  const center = point(line.tip.x - line.dx * 2 * scale, line.tip.y - line.dy * 2 * scale);
  const edge = point(center.x + crossX * 5 * scale, center.y + crossY * 5 * scale);
  const back = point(center.x - crossX * 1.5 * scale, center.y - crossY * 1.5 * scale);
  painter.use(colors.steel).limb(back, edge, Math.round(4 * scale), colors.outline);
  if (!ghost) {
    const from = point(edge.x - line.dx * 1.5, edge.y - line.dy * 1.5);
    painter.use(ART.spearEdge).line(from, point(edge.x + line.dx * 1.5, edge.y + line.dy * 1.5), 1);
    painter.use(COLORS.white).rect(edge.x, edge.y, 1, 1);
  }
}

function knife(painter, { line, hand, colors }) {
  painter.use(colors.steel).limb(hand, line.tip, 1, colors.outline);
}

// a tall tower shield in the front hand
function shield(painter, { hand, scale, facing, ghost, colors, blocking }) {
  const center = point(hand.x + facing * 2 * scale, hand.y - 3 * scale);
  const halfWidth = Math.round(3 * scale);
  const halfHeight = Math.round(11 * scale);
  const left = Math.round(center.x - halfWidth);
  const top = Math.round(center.y - halfHeight);
  const rim = blocking ? COLORS.white : ART.shieldRim;
  painter.use(colors.outline).rect(left - 1, top - 1, halfWidth * 2 + 2, halfHeight * 2 + 2);
  painter.use(ghost ? colors.steel : rim).rect(left, top, halfWidth * 2, halfHeight * 2);
  painter
    .use(ghost ? colors.steel : ART.shieldWood)
    .rect(left + 1, top + 1, halfWidth * 2 - 2, halfHeight * 2 - 2);
  painter
    .use(ghost ? colors.steel : ART.shieldRim)
    .rect(left + 1, top + halfHeight - 1, halfWidth * 2 - 2, 2);
  painter.use(ghost ? colors.steel : ART.gold).rect(center.x - 1, center.y - 1, 2, 2);
}

function hammer(painter, { line, scale, crossX, crossY, ghost, colors }) {
  painter.use(colors.wood).limb(line.grip, line.tip, Math.round(2 * scale), colors.outline);
  const center = point(line.tip.x - line.dx * 2 * scale, line.tip.y - line.dy * 2 * scale);
  const top = point(center.x - crossX * 5 * scale, center.y - crossY * 5 * scale);
  const bottom = point(center.x + crossX * 5 * scale, center.y + crossY * 5 * scale);
  painter
    .use(ghost ? colors.steel : ART.hammerHead)
    .limb(top, bottom, Math.round(6 * scale), colors.outline);
  if (!ghost) {
    painter.use(ART.hammerShade).line(top, bottom, 2);
    const shineFrom = point(top.x - line.dx * 2, top.y - line.dy * 2);
    painter
      .use(ART.hammerShine)
      .line(shineFrom, point(bottom.x - line.dx * 2, bottom.y - line.dy * 2), 1);
  }
}

const WEAPONS = { sword, spear, axe, knife, shield, hammer };

export function drawWeapon(painter, line, { fighter, ghost }) {
  const facing = fighter.facing;
  WEAPONS[line.type](painter, {
    line,
    hand: fighter.joints.frontHand,
    scale: fighter.scale,
    facing,
    crossX: -line.dy * facing,
    crossY: line.dx * facing,
    ghost,
    colors: weaponColors(ghost),
    blocking: fighter.blockFlash > 0,
  });
}
