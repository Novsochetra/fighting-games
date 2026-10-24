import { LOOT_COLORS } from '../../art/loot-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { LOOT_SPRITES } from '../../data/loot-sprites.js';
import { isBlinking } from '../../sim/items/loot.js';
import { floorBelow } from '../../sim/stage/terrain.js';
import { drawLootFrame } from './loot-sheets.js';

const CULL_MARGIN = 20;
// a gem flashes its glint once every so often instead of all the time
const GEM_GLINT_EVERY = 96;
const SHADOW_WIDTH = 6;

function isOnScreen(x, cameraX) {
  return x > cameraX - CULL_MARGIN && x < cameraX + VIEW_WIDTH + CULL_MARGIN;
}

function frameOf(piece) {
  const sprite = LOOT_SPRITES[piece.kind];
  const beat = piece.time + piece.phase;
  if (piece.kind === 'gem') {
    const glint = Math.floor((beat % GEM_GLINT_EVERY) / sprite.ticks);
    return glint < sprite.frames ? glint : 0;
  }
  return Math.floor(beat / sprite.ticks) % sprite.frames;
}

// the shadow shrinks as the piece rises off the floor, so a bounce reads at a glance
function drawShadow(painter, { piece, terrain }) {
  const floor = floorBelow(terrain, piece.x, piece.y - 1);
  const height = floor - piece.y;
  const width = Math.max(2, SHADOW_WIDTH - Math.floor(height / 6));
  painter.use(LOOT_COLORS.shadow).rect(piece.x - width / 2, floor - 1, width, 1);
}

function drawPiece(painter, { piece, sheets, game }) {
  if (isBlinking(game, piece) && (piece.time >> 2) & 1) {
    return;
  }
  const bob = piece.landed && piece.kind === 'apple' ? Math.round(Math.sin(piece.time * 0.08)) : 0;
  drawLootFrame(painter, sheets, {
    name: piece.kind,
    frame: frameOf(piece),
    x: piece.x,
    y: piece.y + bob,
  });
}

// pieces on the road go under the fighters; a piece in the air casts a shadow, but a landed one's
// would sit under its own bottom row, so it is not drawn: a full road costs half the canvas calls
export function drawGroundLoot(painter, { game, sheets, cameraX }) {
  for (const piece of game.loot) {
    if (!piece.pulled && isOnScreen(piece.x, cameraX)) {
      if (!piece.landed) {
        drawShadow(painter, { piece, terrain: game.terrain });
      }
      drawPiece(painter, { piece, sheets, game });
    }
  }
}

// pieces flying to the hero go over everyone, and a sparkle marks each one taken
export function drawFlyingLoot(painter, { game, sheets }) {
  for (const piece of game.loot) {
    if (piece.pulled) {
      drawPiece(painter, { piece, sheets, game });
    }
  }
  const { ticks, frames } = LOOT_SPRITES.sparkle;
  for (const sparkle of game.lootFx) {
    const frame = Math.min(frames - 1, Math.floor(sparkle.time / ticks));
    drawLootFrame(painter, sheets, { name: 'sparkle', frame, x: sparkle.x, y: sparkle.y + 4 });
  }
}
