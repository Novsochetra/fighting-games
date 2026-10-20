import { VIEW_WIDTH } from '../../config.js';
import { clamp } from '../../lib/math.js';
import { missionOf } from './mission.js';

// the camera keeps the hero a little left of center, inside the zone when one is running
export function cameraTarget(game) {
  const { left, right } = game.arena ?? { left: 0, right: missionOf(game).length };
  return clamp(game.player.x - VIEW_WIDTH * 0.42, left, right - VIEW_WIDTH);
}

export function updateCamera(game) {
  const camera = game.camera;
  const target = cameraTarget(game);
  camera.x += (target - camera.x) * 0.12;
  if (Math.abs(target - camera.x) < 0.3) {
    camera.x = target;
  }
}
