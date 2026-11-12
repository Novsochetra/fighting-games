import { paintFx } from '../render/paint-fx.js';
import { fitCanvas, pixelScale } from '../render/fit.js';
import { paintLive } from '../render/paint-live.js';
import { paintStill } from '../render/paint-still.js';
import { buildScene } from '../render/scene.js';

// The two full-screen canvases: the market behind the game and the effects over it, both in the
// same pixels of the art, so a spot on the page is the same spot on either.
export function createCanvases({ window, backdrop, fx }) {
  const still = backdrop.ownerDocument.createElement('canvas');
  const contexts = { backdrop: backdrop.getContext('2d'), fx: fx.getContext('2d') };
  let scale = 1;
  let scene = null;

  function fit() {
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    scale = pixelScale(viewport);
    [backdrop, fx, still].forEach((canvas) => fitCanvas(canvas, viewport, scale));
    scene = buildScene(Math.random, { width: backdrop.width, height: backdrop.height });
    paintStill(still.getContext('2d'), scene);
  }

  fit();
  window.addEventListener('resize', fit);

  return {
    draw(seconds, particles) {
      contexts.backdrop.drawImage(still, 0, 0);
      paintLive(contexts.backdrop, scene, seconds);
      paintFx(contexts.fx, particles);
    },

    toArt: (point) => ({ x: point.x / scale, y: point.y / scale }),

    get width() {
      return fx.width;
    },
  };
}
