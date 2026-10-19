const RUN_MODES = new Set(['play', 'pause', 'over']);

// which song should be playing: 'title', 'battle', 'boss', or null for silence (the stage clear)
export function songFor(game) {
  if (game.mode === 'title') {
    return 'title';
  }
  if (!RUN_MODES.has(game.mode) || game.clearTime) {
    return null;
  }
  const { boss } = game;
  return boss && !boss.entering && boss.state !== 'ko' ? 'boss' : 'battle';
}
