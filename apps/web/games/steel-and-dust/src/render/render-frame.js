import { RENDER_SCALE } from '../config.js';
import { createCameraTransform } from './camera-transform.js';
import { drawWorld } from './draw-world.js';
import { drawHud } from './hud/draw-hud.js';
import { drawOverlays, drawScreenFlashes } from './overlays/overlays.js';
import { drawVignette } from './overlays/vignette.js';
import { missionOf } from '../sim/stage/mission.js';
import { backdropFor } from './scene/backdrop.js';
import { drawForeground } from './scene/foreground.js';
import { drawTiled } from './scene/ground.js';
import { scenePalette } from './scene/scene-palette.js';

function drawBackdrop(painter, setLayer, { backdrop, cameraX }) {
  setLayer(0, false);
  painter.context.drawImage(backdrop.sky, 0, 0);
  setLayer(0, true);
  drawTiled(painter, backdrop.hills, cameraX * 0.12);
  drawTiled(painter, backdrop.skyline, cameraX * 0.35);
}

export function renderFrame(game, view) {
  const painter = view.painter;
  const context = painter.context;
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  context.globalAlpha = 1;
  const cameraX = Math.round(game.camera.x);
  const setLayer = createCameraTransform(context, game);
  const { theme } = missionOf(game);
  drawBackdrop(painter, setLayer, { backdrop: backdropFor(view, theme), cameraX });
  setLayer(-cameraX, true);
  drawWorld(painter, { game, view, cameraX });
  setLayer(0, true);
  drawForeground(painter, cameraX, scenePalette(theme).rubble);
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  drawScreenFlashes(painter, game);
  drawVignette(painter, game, view);
  if (game.mode !== 'title') {
    drawHud(painter, game, view);
  }
  drawOverlays(painter, { game, view });
}
