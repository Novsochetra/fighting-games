import { LOOT_BLINK, LOOT_LIFETIME, LOOT_MOTION as MOTION } from '../../data/loot.js';
import { hurtBox } from '../combat/boxes.js';
import { collectPiece } from './loot-collect.js';
import { updateChests } from './loot-chest.js';
import { updateLootFx } from './loot-fx.js';
import { fallAndBounce } from './loot-motion.js';

// a piece's y is its foot, so its box stands on it
function touches(body, piece) {
  const half = MOTION.pieceWidth / 2;
  return (
    piece.x + half > body.x &&
    piece.x - half < body.x + body.width &&
    piece.y > body.y &&
    piece.y - MOTION.pieceHeight < body.y + body.height
  );
}

// the hero takes a piece only by touching it, never from afar: a jump clear over one leaves it
function isTaken(body, piece) {
  return Boolean(body) && piece.time >= MOTION.pickupDelay && touches(body, piece);
}

function bounceAbout(game, piece) {
  if (fallAndBounce(piece, game) && piece.kind !== 'apple' && !piece.clinked) {
    piece.clinked = true;
    game.io.sfx('clink', false, { x: piece.x, vol: piece.kind === 'gem' ? 0.9 : 0.6 });
  }
}

function updatePiece(game, piece, body) {
  piece.time++;
  bounceAbout(game, piece);
  if (isTaken(body, piece)) {
    collectPiece(game, piece);
  }
}

export function isExpired(piece) {
  return piece.time >= LOOT_LIFETIME;
}

// every piece blinks through the last two seconds of its life
export function isBlinking(piece) {
  return piece.time >= LOOT_LIFETIME - LOOT_BLINK;
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
  // a knocked-out hero has no body to take anything with
  const body = hurtBox(game.player);
  for (const piece of game.loot) {
    updatePiece(game, piece, body);
  }
  game.loot = game.loot.filter((piece) => !piece.taken && !isExpired(piece));
  updateLootFx(game);
  countDown(game);
}
