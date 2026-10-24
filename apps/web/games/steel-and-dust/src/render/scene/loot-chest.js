import { LOOT_COLORS } from '../../art/loot-colors.js';
import { CHEST_FRAMES } from '../../data/loot-sprites.js';
import { CHEST_TIMING as TIMING } from '../../data/loot.js';
import { chestAge } from '../../sim/items/loot-chest.js';
import { floorBelow } from '../../sim/stage/terrain.js';
import { drawLootFrame } from './loot-sheets.js';

const BEAM_HEIGHT = 46;
const BEAM_WIDTHS = [12, 7, 3];
const SHADOW_WIDTH = 30;

function fadeOf(age) {
  if (age < TIMING.fadeAt) {
    return 1;
  }
  return Math.max(0, 1 - (age - TIMING.fadeAt) / (TIMING.gone - TIMING.fadeAt));
}

// the treasure's light: three nested columns rising out of the open chest, breathing slowly
function drawBeam(painter, chest, age) {
  const swell = Math.min(1, (age - TIMING.openAt) / 10);
  const breath = 0.75 + 0.25 * Math.sin(age * 0.12);
  const top = chest.y - 22 - BEAM_HEIGHT;
  BEAM_WIDTHS.forEach((width, i) => {
    painter.alpha(fadeOf(age) * swell * breath * (0.14 + i * 0.1));
    painter.use(i === 2 ? LOOT_COLORS.glowHot : LOOT_COLORS.glow);
    painter.rect(chest.x - Math.floor(width / 2), top, width, BEAM_HEIGHT);
  });
  painter.alpha(1);
}

// a rattling chest hops a pixel on every beat
function rattleLift(chest) {
  return chest.frame === CHEST_FRAMES.rattle ? -1 : 0;
}

// a falling chest's shadow waits on the floor below it
function drawShadow(painter, { chest, terrain, fade }) {
  const floor = floorBelow(terrain, chest.x, chest.y - 1);
  painter.alpha(fade).use(LOOT_COLORS.shadow);
  painter.rect(chest.x - SHADOW_WIDTH / 2, floor - 1, SHADOW_WIDTH, 2);
}

function drawChest(painter, { sheets, chest, terrain }) {
  const age = chestAge(chest);
  const fade = age < 0 ? 1 : fadeOf(age);
  drawShadow(painter, { chest, terrain, fade });
  painter.alpha(fade);
  const y = chest.y + rattleLift(chest);
  drawLootFrame(painter, sheets, { name: 'chest', frame: chest.frame, x: chest.x, y });
  painter.alpha(1);
  if (age >= TIMING.openAt) {
    drawBeam(painter, chest, age);
  }
}

export function drawChests(painter, { game, sheets }) {
  for (const chest of game.chests) {
    drawChest(painter, { sheets, chest, terrain: game.terrain });
  }
}
