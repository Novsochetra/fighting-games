import { FX_COLORS } from '../../art/fx-colors.js';
import { SOLDIER_TIMING } from '../../sim/summons/soldiers.js';
import { heroSheetFor } from '../fighters/hero-sheets.js';
import { drawHeroFrame } from '../fighters/hero-sprites.js';

const SWORD_ROW = 0;
const SOLID = 0.85;

// the thrust strip of the hero who raised it: coiled while it steps out, then the lunge and its hold
export function soldierFrame(time) {
  const { rise, strike } = SOLDIER_TIMING;
  if (time < rise) {
    return ['thrust', 1];
  }
  if (time < strike) {
    return ['thrust', 2];
  }
  return ['thrust', time < strike + 4 ? 3 : 4];
}

// it fades in as it steps out of the stone and fades out as it crumbles
export function soldierAlpha(time) {
  const { rise, crumble, end } = SOLDIER_TIMING;
  if (time < rise) {
    return (SOLID * time) / rise;
  }
  if (time >= crumble) {
    return (SOLID * (end - time)) / (end - crumble);
  }
  return SOLID;
}

// carved like the Bayon's reliefs: the hero's own shape in flat sandstone over its shadow
export function drawSoldiers(painter, { summons, view }) {
  for (const soldier of summons) {
    if (soldier.kind !== 'soldier' || soldier.time <= 0) {
      continue;
    }
    const sheet = heroSheetFor(view, soldier.hero);
    const at = { frame: soldierFrame(soldier.time), y: soldier.y, facing: soldier.direction };
    painter.alpha(soldierAlpha(soldier.time));
    const shadow = { ...at, x: soldier.x + 1, tint: FX_COLORS.reliefShade, row: SWORD_ROW };
    drawHeroFrame(painter, sheet, shadow);
    drawHeroFrame(painter, sheet, {
      ...at,
      x: soldier.x,
      tint: FX_COLORS.reliefStone,
      row: SWORD_ROW,
    });
    painter.alpha(1);
  }
}
