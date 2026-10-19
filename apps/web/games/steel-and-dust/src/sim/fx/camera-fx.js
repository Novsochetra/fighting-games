function shakeScale(settings) {
  return settings.shake === 1 ? 0.5 : 1;
}

export function shake(game, amount, time) {
  if (!game.settings.shake) {
    return;
  }
  const camera = game.camera;
  camera.shakeAmount = Math.max(camera.shakeAmount, amount * shakeScale(game.settings));
  camera.shakeTime = Math.max(camera.shakeTime, time);
}

// a zoom punch toward a screen point plus a short camera kick, both scaled by the shake setting
export function punch(game, { x, y, time, kickX, kickY }) {
  if (!game.settings.shake) {
    return;
  }
  const { zoom } = game.camera;
  const amount = shakeScale(game.settings) * Math.min(1, time / 10) * 0.07;
  if (amount >= zoom.amount || zoom.time <= 0) {
    zoom.amount = amount;
    zoom.time = time;
    zoom.duration = time;
    zoom.x = x;
    zoom.y = y;
  }
  game.camera.kickX += kickX * shakeScale(game.settings);
  game.camera.kickY += kickY;
}
