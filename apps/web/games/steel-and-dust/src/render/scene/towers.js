import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { STONES, TOWER } from '../../data/towers.js';
import { stoneY } from '../../sim/hazards/tower-stones.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = STONES.spread + 24;
const FRAMES = { standing: 0, cracking: 1, breaking: 2 };
const STONE_FRAME = 3;
// it rocks between whole and cracked as it creaks, then holds cracked a moment before it goes
const ROCK_UNTIL = TOWER.crack - 6;
// the falling stone sits right of the middle of its frame, so it is drawn shifted onto its spot
const STONE_MIDDLE = 57.5;
const STONE_SHIFT = (STONE_MIDDLE - FX_SPRITES.faceTower.anchorX) * FX_SCALE * TOWER.scale;
// the shadow the tower's base casts on the road, so it stands on it rather than in the painting
const BASE_SHADOW = 30;

const inView = (tower, cameraX) =>
  tower.x > cameraX - MARGIN && tower.x < cameraX + VIEW_WIDTH + MARGIN;

const inViewOf = (towers, cameraX) => towers.filter((tower) => inView(tower, cameraX));

export function towerFrame(tower) {
  if (tower.state === 'cracking' && tower.time < ROCK_UNTIL) {
    return Math.floor(tower.time / 3) % 2;
  }

  return FRAMES[tower.state] ?? null;
}

// a cracking tower shudders a pixel either way
function shudder(tower) {
  if (tower.state !== 'cracking') {
    return 0;
  }

  return (tower.time >> 1) & 1 ? 0.5 : -0.5;
}

function drawTower(painter, sheets, tower) {
  const frame = towerFrame(tower);

  if (frame === null) {
    return;
  }

  const x = tower.x + shudder(tower);

  painter.alpha(0.35).use(COLORS.outline);
  painter.rect(x - BASE_SHADOW, tower.y - 1, BASE_SHADOW * 2, 3);
  painter.alpha(1);
  drawFxFrame(painter, sheets, { name: 'faceTower', frame, x, y: tower.y, scale: TOWER.scale });
}

// where a stone will land the road blinks red as wide as it strikes, harder as it comes, like
// every boss danger, under a shadow that grows and darkens as it drops
function drawStoneMark(painter, stone, tick) {
  const progress = stone.time / stone.land;
  const half = STONES.halfWidth;
  const shadow = Math.round(half * (0.4 + 0.6 * progress));

  painter.alpha(0.4 + 0.35 * progress * ((tick >> 2) & 1 ? 1 : 0.55));
  painter.use(COLORS.red).rect(stone.x - half, stone.floor - 1, half * 2, 6);
  painter.use(FX_COLORS.dangerLight).rect(stone.x - half, stone.floor - 1, half * 2, 1);
  painter.alpha(0.3 + 0.35 * progress).use(COLORS.outline);
  painter.rect(stone.x - shadow, stone.floor - 1, shadow * 2, 3);
  painter.alpha(1);
}

function drawStone(painter, sheets, stone) {
  drawFxFrame(painter, sheets, {
    name: 'faceTower',
    frame: STONE_FRAME,
    x: stone.x - stone.facing * STONE_SHIFT,
    y: stoneY(stone),
    scale: TOWER.scale,
    facing: stone.facing,
  });
}

// the towers, and the marks where their stones will land, behind the fighters
export function drawTowers(painter, sheets, { towers, cameraX, tick }) {
  for (const tower of inViewOf(towers, cameraX)) {
    drawTower(painter, sheets, tower);
    for (const stone of tower.stones) {
      drawStoneMark(painter, stone, tick);
    }
  }
}

// the stones dropping onto their marks, over the fighters
export function drawTowerStones(painter, sheets, { towers, cameraX }) {
  for (const tower of inViewOf(towers, cameraX)) {
    for (const stone of tower.stones) {
      drawStone(painter, sheets, stone);
    }
  }
}
