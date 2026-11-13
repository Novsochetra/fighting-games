import { cameraModeOf } from '../../render/cinema/mode.js';

const LESS_MOTION = '(prefers-reduced-motion: reduce)';

// the player's cinematic camera, read afresh each tick so a change made in the pause menu plays
// on at once; the device's motion setting is asked for once and followed from then on
export function cinemaOf(app) {
  app.lessMotion ??= app.window?.matchMedia?.(LESS_MOTION) ?? null;

  return cameraModeOf(app.settings?.camera, { reducedMotion: Boolean(app.lessMotion?.matches) });
}
