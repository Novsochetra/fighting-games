import { LOOT_BLINK, LOOT_LIFETIME, LOOT_MOTION as MOTION } from '../../data/loot.js';
import { collectPiece } from './loot-collect.js';
import { updateChests } from './loot-chest.js';
import { updateLootFx } from './loot-fx.js';
import { fallAndBounce, flyToward } from './loot-motion.js';

// coins fly to the hero's middle, not their feet
const MIDDLE_HEIGHT = 14;

function isInReach(player, piece) {
  return (
    Math.abs(player.x - piece.x) < MOTION.magnetReach &&
    Math.abs(player.y - piece.y) < MOTION.magnetHeight
  );
}

// at a stage clear everything left comes in from anywhere, so no reward is lost to the wipe
function startsPull(game, piece) {
  if (game.clearTime > 0) {
    return piece.time >= MOTION.clearPullDelay;
  }
  return piece.time >= MOTION.pullDelay && isInReach(game.player, piece);
}

// a knocked-out hero lets go of what was flying in, and it drops where it is
function letGo(piece) {
  if (piece.pulled) {
    piece.pulled = false;
    piece.landed = false;
  }
}

function flyIn(game, piece) {
  const target = { x: game.player.x, y: game.player.y - MIDDLE_HEIGHT };
  if (flyToward(piece, target)) {
    collectPiece(game, piece);
  }
}

function bounceAbout(game, piece) {
  if (fallAndBounce(piece, game) && piece.kind !== 'apple' && !piece.clinked) {
    piece.clinked = true;
    game.io.sfx('clink', false, { x: piece.x, vol: piece.kind === 'gem' ? 0.9 : 0.6 });
  }
}

function updatePiece(game, piece) {
  piece.time++;
  if (game.player.state === 'ko') {
    letGo(piece);
  } else if (!piece.pulled && startsPull(game, piece)) {
    piece.pulled = true;
  }
  if (piece.pulled) {
    flyIn(game, piece);
  } else {
    bounceAbout(game, piece);
  }
}

export function isExpired(game, piece) {
  return !piece.pulled && !game.clearTime && piece.time >= LOOT_LIFETIME;
}

export function isBlinking(game, piece) {
  return !piece.pulled && !game.clearTime && piece.time >= LOOT_LIFETIME - LOOT_BLINK;
}

function countDown(game) {
  if (game.coinStreak.timer > 0) {
    game.coinStreak.timer--;
  }
  if (game.purseBump > 0) {
    game.purseBump--;
  }
}

export function updateLoot(game) {
  updateChests(game);
  for (const piece of game.loot) {
    updatePiece(game, piece);
  }
  game.loot = game.loot.filter((piece) => !piece.taken && !isExpired(game, piece));
  updateLootFx(game);
  countDown(game);
}
