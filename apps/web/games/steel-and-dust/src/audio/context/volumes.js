export function isDucked(game) {
  return game.mode === 'pause' || game.mode === 'over';
}

export function volumeLevels(game) {
  const { settings, muted } = game;
  return {
    master: muted ? 0 : 0.9,
    effectsOut: muted ? 0 : 0.9,
    effects: (0.75 * settings.sfx) / 100,
    music: 0.5 * (settings.music / 100) * (isDucked(game) ? 0.4 : 1),
  };
}

export function applyVolumes(chain, game) {
  if (!chain) {
    return;
  }
  const levels = volumeLevels(game);
  chain.master.gain.value = levels.master;
  chain.effectsOut.gain.value = levels.effectsOut;
  chain.effectsBus.gain.value = levels.effects;
  chain.musicBus.gain.value = levels.music;
}
