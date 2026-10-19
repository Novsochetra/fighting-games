import { RENDER_SCALE } from '../config.js';
import { createCameraTransform } from './camera-transform.js';
import { drawWorld } from './draw-world.js';
import { drawHud } from './hud/draw-hud.js';
import { drawOverlays, drawScreenFlashes } from './overlays/overlays.js';
import { drawVignette } from './overlays/vignette.js';
import { drawForeground } from './scene/foreground.js';
import { drawTiled } from './scene/ground.js';

function drawBackdrop(painter, setLayer, { view, cameraX }) {
  setLayer(0, false);
  painter.context.drawImage(view.backdrop.sky, 0, 0);
  setLayer(0, true);
  drawTiled(painter, view.backdrop.hills, cameraX * 0.12);
  drawTiled(painter, view.backdrop.skyline, cameraX * 0.35);
}

export function renderFrame(game, view) {
  const painter = view.painter;
  const context = painter.context;
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  context.globalAlpha = 1;
  const cameraX = Math.round(game.camera.x);
  const setLayer = createCameraTransform(context, game);
  drawBackdrop(painter, setLayer, { view, cameraX });
  setLayer(-cameraX, true);
  drawWorld(painter, { game, view, cameraX });
  setLayer(0, true);
  drawForeground(painter, cameraX);
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  drawScreenFlashes(painter, game);
  drawVignette(painter, game, view);
  if (game.mode !== 'title') {
    drawHud(painter, game, view);
  }
  drawOverlays(painter, game);
}
