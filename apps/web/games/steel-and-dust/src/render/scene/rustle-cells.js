// the trees over a drop are redrawn in cells this wide and tall, each moved as one
export const CELL_WIDTH = 10;
export const CELL_HEIGHT = 3;

// where a layer's painting starts on the screen, rounded as painted-backdrop.js lays it
export function layerOrigin({ image, parallax, once }, cameraX) {
  const offset = cameraX * parallax;

  return once
    ? Math.round(-offset)
    : Math.round(-(((offset % image.width) + image.width) % image.width));
}

// a piece of a layer, taken from where it lies on the screen at `fromX, fromY` and laid at `x, y`,
// across the seam where the layer repeats
function drawPiece(context, layer, { cameraX, fromX, fromY, x, y }) {
  const { image, once } = layer;
  const width = image.width;
  const along = fromX - layerOrigin(layer, cameraX);
  const sourceX = once ? along : ((along % width) + width) % width;
  const sourceY = Math.max(0, fromY);
  const first = Math.min(CELL_WIDTH, width - sourceX);

  if (sourceX < 0 || first <= 0) {
    return;
  }

  context.drawImage(image, sourceX, sourceY, first, CELL_HEIGHT, x, y, first, CELL_HEIGHT);
  if (first < CELL_WIDTH && !once) {
    const rest = CELL_WIDTH - first;

    context.drawImage(image, 0, sourceY, rest, CELL_HEIGHT, x + first, y, rest, CELL_HEIGHT);
  }
}

// one layer's piece of a cell, laid on the still screen: a shaken layer taken from where the
// shake put it, a moved one from where the rustle moved it
export function drawLayerCell(context, layer, { cameraX, shake, x, y, dx, dy }) {
  drawPiece(context, layer, { cameraX, fromX: x - shake.x - dx, fromY: y - shake.y - dy, x, y });
}

// a cell that moves has the far plate laid back over it, then every nearer layer, the ones the
// patch moves moved; all of it laid on the still screen, so a shaking screen never splits a cell
// from the trees round it
export function drawPatchCell(context, { layers, patch, cameraX, shake, x, y, dx, dy }) {
  const [far] = layers;
  const still = { x: 0, y: 0 };

  layers.forEach((layer, index) => {
    const shaken = index > 0 && layer.parallax > far.parallax;
    const moved = index > 0 && patch.moves(layer, index);
    const cell = { cameraX, shake: shaken ? shake : still, x, y };

    drawLayerCell(context, layer, { ...cell, dx: moved ? dx : 0, dy: moved ? dy : 0 });
  });
}
