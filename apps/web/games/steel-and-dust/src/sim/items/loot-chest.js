import { LOOT_COLORS } from '../../art/loot-colors.js';
import { CHEST_FRAMES } from '../../data/loot-sprites.js';
import { CHEST_POP, CHEST_TIMING as TIMING, LOOT_MOTION } from '../../data/loot.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { punch } from '../fx/camera-fx.js';
import { addRing } from '../fx/effects.js';
import { floorBelow } from '../stage/terrain.js';
import { lootBurst } from './loot-fx.js';
import { spillPieces } from './loot-pieces.js';

const EDGE_MARGIN = 18;

// the chest pops up out of the fallen boss, kept far enough in that it opens on screen
export function dropChest(game, { x, y, contents }) {
  const { left, right } = screenEdges(game);
  game.chests.push({
    x: Math.min(right - EDGE_MARGIN, Math.max(left + EDGE_MARGIN, x)),
    y: y - CHEST_POP.height,
    vy: CHEST_POP.speed,
    time: 0,
    landedAt: null,
    frame: CHEST_FRAMES.closed,
    contents,
    spilled: false,
  });
}

function landChest(game, chest) {
  chest.landedAt = chest.time;
  game.io.sfx('chestLand', false, { x: chest.x });
  punch(game, { x: chest.x - game.camera.x, y: chest.y - 8, time: 6, kickX: 0, kickY: 2 });
  lootBurst(game, { x: chest.x, y: chest.y - 2, count: 8, color: LOOT_COLORS.dust, kind: 'dust' });
}

function fall(game, chest) {
  chest.vy += LOOT_MOTION.gravity;
  const floor = floorBelow(game.terrain, chest.x, chest.y - 1);
  chest.y = Math.min(floor, chest.y + chest.vy);
  if (chest.vy > 0 && chest.y >= floor) {
    landChest(game, chest);
  }
}

function burstOpen(game, chest) {
  game.io.sfx('chestOpen', false, { x: chest.x });
  addRing(game, { x: chest.x, y: chest.y - 14, color: LOOT_COLORS.glow, big: true });
  lootBurst(game, {
    x: chest.x,
    y: chest.y - 16,
    count: 16,
    color: LOOT_COLORS.glow,
    kind: 'spark',
  });
}

function frameAt(age) {
  if (age < TIMING.rattleAt) {
    return CHEST_FRAMES.closed;
  }
  if (age < TIMING.openAt) {
    const beat = Math.floor((age - TIMING.rattleAt) / TIMING.rattleTicks);
    return beat % 2 ? CHEST_FRAMES.rattle : CHEST_FRAMES.closed;
  }
  return age < TIMING.spillAt ? CHEST_FRAMES.opening : CHEST_FRAMES.open;
}

function playTimeline(game, chest) {
  const age = chest.time - chest.landedAt;
  chest.frame = frameAt(age);
  if (age === TIMING.rattleAt) {
    game.io.sfx('chestRattle', false, { x: chest.x });
  }
  if (age === TIMING.openAt) {
    burstOpen(game, chest);
  }
  if (age === TIMING.spillAt) {
    chest.spilled = true;
    spillPieces(game, { kinds: chest.contents, x: chest.x, y: chest.y - 18, spread: 2.4 });
  }
}

export function chestAge(chest) {
  return chest.landedAt === null ? -1 : chest.time - chest.landedAt;
}

export function updateChests(game) {
  for (const chest of game.chests) {
    chest.time++;
    if (chest.landedAt === null) {
      fall(game, chest);
    } else {
      playTimeline(game, chest);
    }
  }
  game.chests = game.chests.filter((chest) => chestAge(chest) < TIMING.gone);
}
