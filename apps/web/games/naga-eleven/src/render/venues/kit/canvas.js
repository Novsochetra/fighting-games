// what a venue draws once lives on canvases of its own; a test passes the pixel canvas, a browser
// gets an offscreen canvas or, where there is none, a page canvas, and Node with neither gets none
export function defaultCanvas(width, height) {
  if (typeof OffscreenCanvas === 'function') {
    return new OffscreenCanvas(width, height);
  }

  if (typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
}

export function rasterToCanvas(raster, createCanvas, reuse = null) {
  const canvas = reuse ?? createCanvas(raster.width, raster.height);

  if (!canvas) {
    return null;
  }

  const context = canvas.getContext('2d');
  const image = context.createImageData(raster.width, raster.height);

  image.data.set(raster.data);
  context.putImageData(image, 0, 0);

  return canvas;
}
