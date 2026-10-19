import { autoFace } from '../../fighters/aim.js';

export function heldDirection(held) {
  return (held.right ? 1 : 0) - (held.left ? 1 : 0);
}

export function consumeBuffer(game) {
  game.input.buffer.action = null;
  game.input.buffer.ttl = 0;
}

export function faceOrAim(game, player, direction) {
  if (direction) {
    player.facing = direction;
  } else {
    autoFace(game, player);
  }
}

export function dashDirection(buffer, direction, player) {
  return buffer.direction || direction || player.facing;
}
