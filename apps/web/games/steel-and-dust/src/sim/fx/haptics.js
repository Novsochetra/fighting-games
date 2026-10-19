export function buzz(game, pattern) {
  if (game.settings.haptics && game.device.touchUsed) {
    game.io.vibrate(pattern);
  }
}
