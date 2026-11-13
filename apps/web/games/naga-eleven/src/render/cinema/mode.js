// The player's Cinematic camera setting (README "The cinematic camera"): `full` plays every camera
// move and the beats that add time (the chase, the freeze at a clash, open play's slow motion),
// `short` only the moves that cost no time, `off` the shows as they were. `auto` is full, or off
// for a player whose device asks for less motion
export const CAMERA_MODES = ['auto', 'full', 'short', 'off'];

export function cameraModeOf(setting, { reducedMotion = false } = {}) {
  if (setting === 'auto' || !CAMERA_MODES.includes(setting)) {
    return reducedMotion ? 'off' : 'full';
  }

  return setting;
}

export const movesCamera = (mode) => mode === 'full' || mode === 'short';

export const addsTime = (mode) => mode === 'full';
