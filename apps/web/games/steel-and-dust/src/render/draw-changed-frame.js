import { renderFrame } from './render-frame.js';
import { sceneLoaded } from './scene-loaded.js';

// the picture changes only with a tick, so a 120 Hz screen drew every one twice, and a refresh
// that ran no tick drew the last one again; the loading screen animates by drawn frames instead
export function drawChangedFrame(game, view) {
  const loaded = sceneLoaded(view, game);
  if (loaded && view.drawnTick === game.tickCount) {
    return false;
  }
  view.drawnTick = loaded ? game.tickCount : null;
  renderFrame(game, view);
  return true;
}
