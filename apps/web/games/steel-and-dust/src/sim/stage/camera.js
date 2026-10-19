import { VIEW_WIDTH, WORLD_WIDTH } from '../../config.js';
import { clamp } from '../../lib/math.js';

export function updateCamera(game) {
  const camera = game.camera;
  const target = game.arena
    ? game.arena.left
    : clamp(game.player.x - VIEW_WIDTH * 0.42, 0, WORLD_WIDTH - VIEW_WIDTH);
  camera.x += (target - camera.x) * 0.12;
  if (Math.abs(target - camera.x) < 0.3) {
    camera.x = target;
  }
}
