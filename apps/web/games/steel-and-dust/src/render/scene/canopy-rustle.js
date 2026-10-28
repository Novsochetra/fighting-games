import { DROP } from '../../data/ambush.js';
import { CELL_HEIGHT, CELL_WIDTH, drawPatchCell } from './rustle-cells.js';

// the trees over a drop rustle out to this far either side of it, giving fully within the nearer
// reach, so a stalk or a bough there moves as one
const REACH = 40;
const FULL_REACH = 22;
// the most a cell sways sideways and sags, in pixels, at full strength
const SWAY = 3;
const SAG = 1.5;
const SPRING_TICKS = 30;
// a crown's patch reaches this far past its painted edge, so a leaf swaying out over the sky is
// still drawn
const CROWN_PAD = 4;

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

function offsetFor(mark, give) {
  const { swing, sag } = motion(mark);

  return { dx: Math.round(SWAY * give * swing) || 0, dy: Math.round(SAG * give * sag) || 0 };
}

// how far the trees at (x, y) on the screen are moved: fully through the upper canopy near the
// spot (the HUD hides the top of it), fading to nothing at the patch's edges and foot so its edges
// never show
export function rustleOffset(mark, { spotX, x, y, depth }) {
  const distance = Math.abs(x + CELL_WIDTH / 2 - spotX);
  const across = Math.min(1, Math.max(0, (REACH - distance) / (REACH - FULL_REACH)));
  const down = Math.min(1, Math.max(0, (1 - y / depth) * 1.8));

  return offsetFor(mark, rustleStrength(mark) * across * down);
}

// a crown sways as one from its tip, its sway dying away toward where it meets the trunk
export function crownOffset(mark, { y, top, bottom }) {
  const down = Math.min(1, Math.max(0, (1 - (y - top) / (bottom - top)) * 1.8));

  return offsetFor(mark, rustleStrength(mark) * down);
}

// where a perch's layer lays a spot of its own on the screen, to the pixel the layer is drawn at
export function perchOnScreen(perch, layerX, cameraX) {
  return Math.round(layerX) + Math.round(-cameraX * perch.parallax);
}

// the cells round a drop in the road's canopy: every layer nearer than the far plate moves
function canopyPatch(mark, { backdrop, cameraX }) {
  const spotX = Math.round(mark.x - cameraX);

  return {
    left: spotX - REACH,
    right: spotX + REACH,
    top: 0,
    bottom: backdrop.canopy,
    moves: (layer, index) => index > 0,
    offset: (x, y) => rustleOffset(mark, { spotX, x, y, depth: backdrop.canopy }),
  };
}

// the cells of the crown a raider hides in: only the crown's own layer moves
export function crownPatch(mark, { cameraX }) {
  const { perch } = mark;
  const { top, bottom } = perch;

  return {
    left: perchOnScreen(perch, perch.from + perch.shift, cameraX) - CROWN_PAD,
    right: perchOnScreen(perch, perch.to + perch.shift, cameraX) + CROWN_PAD,
    top: top - CROWN_PAD,
    bottom,
    moves: (layer) => layer.name === perch.layer,
    offset: (x, y) => crownOffset(mark, { y, top, bottom }),
  };
}

function rustleOver(context, patch, { layers, cameraX, shake }) {
  for (let x = patch.left; x < patch.right; x += CELL_WIDTH) {
    for (let y = patch.top; y < patch.bottom; y += CELL_HEIGHT) {
      const { dx, dy } = patch.offset(x, y);

      if (dx || dy) {
        drawPatchCell(context, { layers, patch, cameraX, shake, x, y, dx, dy });
      }
    }
  }
}

const isRustling = (shot) =>
  shot.kind === 'dropMark' && shot.perch?.kind !== 'ledge' && rustleStrength(shot) > 0;

// the road's own painted trees shake over a raider about to drop out of them; drawn before the
// air, so light shafts, motes and mist still pass in front, and not at all with no raider waiting
// in them, which keeps the recorded frames of the other roads unchanged
export function drawCanopyRustle(painter, setLayer, { game, backdrop, cameraX }) {
  const marks = game.projectiles.filter(isRustling);

  if (!marks.length || !backdrop.layers[0]?.ready) {
    return;
  }

  const layers = backdrop.layers.filter((layer) => layer.ready);
  const scene = { layers, cameraX, shake: setLayer.shake };

  setLayer(0, false);
  for (const mark of marks) {
    if (mark.perch || backdrop.canopy) {
      const patch = mark.perch ? crownPatch(mark, scene) : canopyPatch(mark, { backdrop, cameraX });

      rustleOver(painter.context, patch, scene);
    }
  }

  setLayer(0, true);
}
