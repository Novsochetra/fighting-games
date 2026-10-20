import { VIEW_WIDTH } from '../../config.js';

const DIRECTORY = 'assets/backdrops/';

function loadLayer({ createImage, baseUrl }, folder, { name, parallax }) {
  const layer = { image: createImage(), parallax, ready: false };
  layer.image.onload = () => {
    layer.ready = true;
  };
  layer.image.src = `${baseUrl}${DIRECTORY}${folder}/${name}.png`;
  return layer;
}

export function loadPaintedBackdrop(loaders, spec) {
  // the image marks this same object ready when it loads, so the surface row goes onto it too
  const ground = Object.assign(loadLayer(loaders, spec.folder, { name: 'ground', parallax: 1 }), {
    top: spec.groundTop,
  });
  return {
    painted: true,
    layers: spec.layers.map((layer) => loadLayer(loaders, spec.folder, layer)),
    ground,
    ambient: spec.ambient,
  };
}

// a layer that has not loaded yet has no width to tile by, so it is skipped until it has
function drawLayer(context, layer, cameraX) {
  const width = layer.image.width;
  if (!layer.ready || width <= 0) {
    return;
  }
  const offset = cameraX * layer.parallax;
  const start = -(((offset % width) + width) % width);
  for (let x = start; x < VIEW_WIDTH; x += width) {
    context.drawImage(layer.image, Math.round(x), 0);
  }
}

// the back plate is far away, so screen shake moves only the nearer layers
export function drawPaintedBackdrop(painter, setLayer, { backdrop, cameraX }) {
  backdrop.layers.forEach((layer, index) => {
    setLayer(0, index > 0);
    drawLayer(painter.context, layer, cameraX);
  });
}
