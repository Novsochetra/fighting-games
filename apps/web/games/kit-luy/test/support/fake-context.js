// a 2D context that only remembers what was painted on it, in order
export function fakeContext(canvas = { width: 200, height: 300 }) {
  const context = {
    canvas,
    fillStyle: '',
    globalAlpha: 1,
    rects: [],
    cleared: 0,
    images: [],
    fillRect: (x, y, width, height) =>
      context.rects.push({ x, y, width, height, color: context.fillStyle }),
    clearRect: () => {
      context.cleared += 1;
    },
    drawImage: (image) => context.images.push(image),
  };

  return context;
}

// happy-dom has canvases but nothing to draw on them with
export function stubCanvases(window) {
  const contexts = new WeakMap();

  window.HTMLCanvasElement.prototype.getContext = function getContext() {
    if (!contexts.has(this)) {
      contexts.set(this, fakeContext(this));
    }

    return contexts.get(this);
  };
}
