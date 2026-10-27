import { RENDER_SCALE } from '../config.js';
import { createCameraTransform } from './camera-transform.js';
import { drawWorld } from './draw-world.js';
import { drawHud } from './hud/draw-hud.js';
import { drawLoadingScreen } from './overlays/loading-screen.js';
import { pixelate } from './overlays/mosaic.js';
import { drawOverlays, drawScreenFlashes } from './overlays/overlays.js';
import { drawVignette } from './overlays/vignette.js';
import { missionWipe, mosaicBlock } from './overlays/wipe-timing.js';
import { missionOf } from '../sim/stage/mission.js';
import { drawAmbient } from './scene/ambient/index.js';
import { sceneLoaded } from './scene-loaded.js';
import { backdropFor } from './scene/backdrop.js';
import { drawForeground } from './scene/foreground/index.js';
import { drawPaintedBackdrop, drawPaintedFronts } from './scene/painted-backdrop.js';
import { scenePalette } from './scene/scene-palette.js';

// the title has no run to show, and once the last mission clears the run is over: the credits and
// the clear menu stand over the bare road, with no HUD, card or loot summary under them
const MODES_WITHOUT_HUD = new Set(['title', 'clear']);

function drawAir(painter, setLayer, { game, backdrop, theme, cameraX }, plane) {
  setLayer(0, true);
  const colors = scenePalette(theme).ambient;
  drawAmbient(painter, { effects: backdrop.ambient, plane, tick: game.tickCount, cameraX, colors });
}

export function renderFrame(game, view) {
  const painter = view.painter;
  const context = painter.context;
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  context.globalAlpha = 1;
  if (!sceneLoaded(view, game)) {
    drawLoadingScreen(painter, view);
    return;
  }
  const cameraX = Math.round(game.camera.x);
  const setLayer = createCameraTransform(context, game);
  const { theme } = missionOf(game);
  const scene = { game, backdrop: backdropFor(view, theme), theme, cameraX };
  drawPaintedBackdrop(painter, setLayer, scene);
  drawAir(painter, setLayer, scene, 'back');
  setLayer(-cameraX, true);
  drawWorld(painter, { game, view, cameraX });
  drawAir(painter, setLayer, scene, 'front');
  drawPaintedFronts(painter, setLayer, scene);
  setLayer(0, true);
  drawForeground(painter, cameraX, scenePalette(theme).rubble, game.tickCount);
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  drawScreenFlashes(painter, game);
  drawVignette(painter, game, view);
  const wipe = missionWipe(game);
  if (wipe) {
    pixelate(painter, view, mosaicBlock(wipe));
  }
  if (!MODES_WITHOUT_HUD.has(game.mode)) {
    drawHud(painter, game, view);
  }
  drawOverlays(painter, { game, view });
}
