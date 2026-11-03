import { VIEW } from '../config.js';

// where a tap lands in the view's own pixels, whatever size the canvas is shown at
export function viewPointOf(rect, { clientX, clientY }) {
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW.width,
    y: ((clientY - rect.top) / rect.height) * VIEW.height,
  };
}

// a canvas menu (a scene, a duel, a drill) hears a tap as a point it can hit-test
export function installCanvasTaps(canvas, onTap) {
  canvas.addEventListener('pointerdown', (event) => {
    onTap(viewPointOf(canvas.getBoundingClientRect(), event));
  });
}
