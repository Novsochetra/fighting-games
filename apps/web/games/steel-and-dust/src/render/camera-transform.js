import { RENDER_SCALE } from '../config.js';

// screen shake uses its own random draw each frame while the shake lasts
function shakeOffset(game) {
  const camera = game.camera;
  let x = 0;
  let y = 0;
  if (camera.shakeTime > 0 && game.mode !== 'pause') {
    x = Math.round((Math.random() * 2 - 1) * camera.shakeAmount);
    y = Math.round((Math.random() * 2 - 1) * camera.shakeAmount);
  }
  return { x: x + Math.round(camera.kickX), y: y + Math.round(camera.kickY) };
}

// a zoom punch scales every world layer around the impact point for a few frames
function zoomOf(camera) {
  const { zoom } = camera;
  const scale = zoom.time > 0 ? 1 + zoom.amount * Math.pow(zoom.time / zoom.duration, 2) : 1;
  return { scale, x: zoom.x * (1 - scale), y: zoom.y * (1 - scale) };
}

export function createCameraTransform(context, game) {
  const shake = shakeOffset(game);
  const zoom = zoomOf(game.camera);
  return function setLayer(offsetX, shaken) {
    const scale = RENDER_SCALE * zoom.scale;
    const x = RENDER_SCALE * (zoom.scale * offsetX + zoom.x + (shaken ? shake.x : 0));
    const y = RENDER_SCALE * (zoom.scale * 0 + zoom.y + (shaken ? shake.y : 0));
    context.setTransform(scale, 0, 0, scale, x, y);
  };
}
