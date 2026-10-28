import { DROP } from '../../data/ambush.js';

// the trees over a drop rustle in cells this wide and tall, out to this far either side of it,
// giving fully within the nearer reach, so a stalk or a bough there moves as one
const CELL_WIDTH = 10;
const CELL_HEIGHT = 3;
const REACH = 40;
const FULL_REACH = 22;
// the most a cell sways sideways and sags, in pixels, at full strength
const SWAY = 3;
const SAG = 1.5;
const SPRING_TICKS = 30;

// how hard the trees over a raider shake: settling as it climbs on, restless while it waits,
// harder as it gets ready, then the lurch as it lets go, springing back still
export function rustleStrength(mark) {
  if (mark.raider) {
    const since = mark.time - DROP.warn;

    return since < SPRING_TICKS ? 1.6 * Math.exp(-since / 9) : 0;
  }

  const settle = Math.min(1, mark.time / 12);

  return settle * (mark.time > DROP.warn - 20 ? 1 : 0.7);
}

// while it waits the branch bobs under the raider's weight with a flutter on top; once it lets go
// it springs up and swings back and forth, dying away
function motion(mark) {
  if (mark.raider) {
    const swing = Math.cos((mark.time - DROP.warn) * 0.55);

    return { swing, sag: -swing };
  }

  const bob = Math.sin(mark.time * 0.35);

  return { swing: 0.7 * bob + 0.3 * Math.sin(mark.time * 1.7), sag: 0.6 + 0.4 * bob };
}

// how far the trees at (x, y) on the screen are moved: fully through the upper canopy near the
// spot (the HUD hides the top of it), fading to nothing at the patch's edges and foot so its edges
// never show
export function rustleOffset(mark, { spotX, x, y, depth }) {
  const distance = Math.abs(x + CELL_WIDTH / 2 - spotX);
  const across = Math.min(1, Math.max(0, (REACH - distance) / (REACH - FULL_REACH)));
  const down = Math.min(1, Math.max(0, (1 - y / depth) * 1.8));
  const give = rustleStrength(mark) * across * down;
  const { swing, sag } = motion(mark);

  return { dx: Math.round(SWAY * give * swing) || 0, dy: Math.round(SAG * give * sag) || 0 };
}

// where a layer's painting starts on the screen, rounded as painted-backdrop.js lays it
function layerOrigin({ image, parallax, once }, cameraX) {
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

// a cell that moves has the far plate laid back over it, then every nearer layer moved; all of it
// laid on the still screen, the nearer layers taken from where the shake put them, so a shaking
// screen never splits a cell from the trees round it
function drawCell(context, { layers, cameraX, shake, x, y, dx, dy }) {
  const [far, ...near] = layers;

  drawPiece(context, far, { cameraX, fromX: x, fromY: y, x, y });
  for (const layer of near) {
    const from = { fromX: x - shake.x - dx, fromY: y - shake.y - dy };

    drawPiece(context, layer, { cameraX, ...from, x, y });
  }
}

function rustleOver(context, { mark, layers, depth, cameraX, shake }) {
  const spotX = Math.round(mark.x - cameraX);

  for (let x = spotX - REACH; x < spotX + REACH; x += CELL_WIDTH) {
    for (let y = 0; y < depth; y += CELL_HEIGHT) {
      const { dx, dy } = rustleOffset(mark, { spotX, x, y, depth });

      if (dx || dy) {
        drawCell(context, { layers, cameraX, shake, x, y, dx, dy });
      }
    }
  }
}

// the road's own painted trees shake over a raider about to drop out of them; drawn before the
// air, so light shafts, motes and mist still pass in front, and not at all on a road without a
// canopy or with no raider waiting, which keeps the recorded frames of the other roads unchanged
export function drawCanopyRustle(painter, setLayer, { game, backdrop, cameraX }) {
  const marks = game.projectiles.filter(
    (shot) => shot.kind === 'dropMark' && rustleStrength(shot) > 0,
  );

  if (!backdrop.canopy || !marks.length || !backdrop.layers[0]?.ready) {
    return;
  }

  const layers = backdrop.layers.filter((layer) => layer.ready);
  const { shake } = setLayer;

  setLayer(0, false);
  for (const mark of marks) {
    rustleOver(painter.context, { mark, layers, depth: backdrop.canopy, cameraX, shake });
  }

  setLayer(0, true);
}
