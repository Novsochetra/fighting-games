import { VIEW_WIDTH } from '../../config.js';

const DIRECTORY = 'assets/backdrops/';

// a file that fails to load settles too, so a missing layer leaves the plain road in its place
// instead of holding the loading screen up forever
function watchLoad(piece, prepare = () => {}) {
  piece.image.onload = () => {
    prepare();
    Object.assign(piece, { ready: true, settled: true });
  };
  piece.image.onerror = () => {
    piece.settled = true;
  };
}

function loadLayer({ createImage, baseUrl }, folder, { name, parallax, once = false }) {
  const layer = { image: createImage(), parallax, once, ready: false, settled: false };
  watchLoad(layer);
  layer.image.src = `${baseUrl}${DIRECTORY}${folder}/${name}.png`;
  return layer;
}

// the face of a step whose high ground is on the left; its mirror image is made once, on load,
// for the faces that look the other way
function loadCliff({ createImage, createCanvas, baseUrl }, folder) {
  const cliff = { image: createImage(), mirrored: null, ready: false, settled: false };
  watchLoad(cliff, () => {
    const { width, height } = cliff.image;
    cliff.mirrored = createCanvas(width, height);
    const context = cliff.mirrored.getContext('2d');
    context.setTransform(-1, 0, 0, 1, width, 0);
    context.drawImage(cliff.image, 0, 0);
  });
  cliff.image.src = `${baseUrl}${DIRECTORY}${folder}/cliff.png`;
  return cliff;
}

export function loadPaintedBackdrop(loaders, spec) {
  // the image marks this same object ready when it loads, so the surface row goes onto it too
  const ground = Object.assign(loadLayer(loaders, spec.folder, { name: 'ground', parallax: 1 }), {
    top: spec.groundTop,
  });
  return {
    layers: spec.layers.map((layer) => loadLayer(loaders, spec.folder, layer)),
    fronts: (spec.fronts ?? []).map((layer) => loadLayer(loaders, spec.folder, layer)),
    ground,
    cliff: spec.cliff ? loadCliff(loaders, spec.folder) : null,
    ambient: spec.ambient,
  };
}

// a layer that has not loaded yet has no width to tile by, so it is skipped until it has; a `once`
// layer is a single painting at the start of the road (where the last mission's road comes in),
// left undrawn once it has scrolled out of sight
function drawLayer(context, layer, cameraX) {
  const width = layer.image.width;
  if (!layer.ready || width <= 0) {
    return;
  }
  const offset = cameraX * layer.parallax;
  if (layer.once) {
    if (offset < width) {
      context.drawImage(layer.image, Math.round(-offset), 0);
    }
    return;
  }
  const start = -(((offset % width) + width) % width);
  for (let x = start; x < VIEW_WIDTH; x += width) {
    context.drawImage(layer.image, Math.round(x), 0);
  }
}

// the back plate is far away, so screen shake moves only the nearer layers; a layer that drifts
// no faster than the plate (a moon on a layer of its own) is just as far and holds still with it
export function drawPaintedBackdrop(painter, setLayer, { backdrop, cameraX }) {
  const farthest = backdrop.layers[0]?.parallax;
  backdrop.layers.forEach((layer) => {
    setLayer(0, layer.parallax > farthest);
    drawLayer(painter.context, layer, cameraX);
  });
}

// a front layer hangs between the fight and the viewer, so it shakes with the world; a backdrop
// without one draws nothing here, which keeps the recorded frames of the other roads unchanged
export function drawPaintedFronts(painter, setLayer, { backdrop, cameraX }) {
  if (!backdrop.fronts?.length) {
    return;
  }
  setLayer(0, true);
  for (const layer of backdrop.fronts) {
    drawLayer(painter.context, layer, cameraX);
  }
}
