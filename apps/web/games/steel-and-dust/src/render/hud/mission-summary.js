import { SUMMARY_COLORS as COLORS } from '../../art/mission-summary.js';
import { VIEW_WIDTH } from '../../config.js';
import { LOOT_SPRITES } from '../../data/loot-sprites.js';
import {
  countDoneAt,
  rowStartsAt,
  shownValue,
  SUMMARY,
  SUMMARY_KINDS,
  summaryValues,
  TOTAL_ROW,
} from '../../data/mission-summary.js';
import { clamp, easeOutBack, easeOutCubic } from '../../lib/math.js';
import { drawLootFrame } from '../scene/loot-sheets.js';
import { drawText, textWidth } from '../text/draw-text.js';
import { drawPanelLabel, drawPanelRule, drawSummaryPanel } from './summary-panel.js';

// under the clear card, clear of its second line
export const SUMMARY_BOX = { x: (VIEW_WIDTH - 208) / 2, y: 121, width: 208, height: 58 };
const CELL_WIDTH = 64;
const KIND_ROW_Y = 9;
const RULE_Y = 33;
const TAKE_ROW_Y = 37;
const ICON_ZOOM = 2;
const ICON_SIZE = 16;
const ICON_GAP = 3;
const TEXT_SCALE = 2;
const RISE = 6;
const FADE_TICKS = 4;
const FLASH_TICKS = 6;
const SPARKLE_SPREAD = 38;
const SPARKLE = LOOT_SPRITES.sparkle;

// a count flashes white as it lands; a kind the hero took none of stays dim
function countColor({ value, since, color }) {
  if (!value) {
    return COLORS.none;
  }
  const sinceDone = since - countDoneAt(value);
  return sinceDone >= 0 && sinceDone < FLASH_TICKS ? COLORS.flash : color;
}

// the icon turns while its count rolls up
function iconFrame(name, { value, since }) {
  const { frames, ticks } = LOOT_SPRITES[name];
  return value && since < countDoneAt(value) ? Math.floor(since / ticks) % frames : 0;
}

// each row hops up into place and fades in
function rowEntry(clearTime, row) {
  const since = clearTime - rowStartsAt(row);
  const pop = clamp(since / SUMMARY.popTicks, 0, 1);
  const lift = Math.round((1 - easeOutBack(pop)) * RISE);
  return { since, lift, alpha: clamp(since / FADE_TICKS, 0, 1) };
}

// an icon and its count side by side, centered on x
function drawCount(painter, sheets, { name, x, y, text, color, frame }) {
  const width = ICON_SIZE + ICON_GAP + textWidth(text, TEXT_SCALE);
  const left = Math.round(x - width / 2);
  const icon = { name, frame, x: left + ICON_SIZE / 2, y: y + ICON_SIZE - 1, zoom: ICON_ZOOM };
  drawLootFrame(painter, sheets, icon);
  drawText(painter, text, { x: left + ICON_SIZE + ICON_GAP, y: y + 4, color, scale: TEXT_SCALE });
}

function drawKind(painter, { sheets, clearTime, values }, row) {
  const { since, lift, alpha } = rowEntry(clearTime, row);
  if (since < 0) {
    return;
  }
  const name = SUMMARY_KINDS[row];
  const value = values[row];
  painter.alpha(alpha);
  drawCount(painter, sheets, {
    name,
    x: VIEW_WIDTH / 2 + (row - 1) * CELL_WIDTH,
    y: SUMMARY_BOX.y + KIND_ROW_Y + lift,
    text: String(shownValue(value, since)),
    color: countColor({ value, since, color: COLORS.count[name] }),
    frame: iconFrame(name, { value, since }),
  });
  painter.alpha(1);
}

// a sparkle flares at either side of the take as it lands
function drawTakeSparkles(painter, sheets, { value, since }) {
  const age = since - countDoneAt(value);
  if (!value || age < 0 || age >= SPARKLE.frames * SPARKLE.ticks) {
    return;
  }
  const frame = Math.floor(age / SPARKLE.ticks);
  const y = SUMMARY_BOX.y + TAKE_ROW_Y + ICON_SIZE - 2;
  for (const side of [-1, 1]) {
    const x = VIEW_WIDTH / 2 + side * SPARKLE_SPREAD;
    drawLootFrame(painter, sheets, { name: 'sparkle', frame, x, y, zoom: ICON_ZOOM });
  }
}

function drawTake(painter, { sheets, clearTime, values }) {
  const { since, lift, alpha } = rowEntry(clearTime, TOTAL_ROW);
  if (since < 0) {
    return;
  }
  const value = values[TOTAL_ROW];
  painter.alpha(alpha);
  drawCount(painter, sheets, {
    name: 'coin',
    x: VIEW_WIDTH / 2,
    y: SUMMARY_BOX.y + TAKE_ROW_Y + lift,
    text: `+${shownValue(value, since)}`,
    color: countColor({ value, since, color: COLORS.take }),
    frame: iconFrame('coin', { value, since }),
  });
  painter.alpha(1);
  drawTakeSparkles(painter, sheets, { value, since });
}

// what the hero gathered on the road, under the clear card (data/mission-summary.js times it)
export function drawMissionSummary(painter, game, view) {
  const open = (game.clearTime - SUMMARY.openAt) / SUMMARY.openTicks;
  if (!game.clearTime || open < 0) {
    return;
  }
  const opacity = easeOutCubic(Math.min(1, open));
  const box = { ...SUMMARY_BOX, y: SUMMARY_BOX.y + Math.round((1 - opacity) * RISE) };
  drawSummaryPanel(painter, { box, opacity });
  drawPanelLabel(painter, { text: 'Loot', box, opacity });
  drawPanelRule(painter, { box, y: box.y + RULE_Y, opacity });
  const scene = {
    sheets: view.lootSheets,
    clearTime: game.clearTime,
    values: summaryValues(game.missionLoot),
  };
  SUMMARY_KINDS.forEach((_, row) => drawKind(painter, scene, row));
  drawTake(painter, scene);
}
