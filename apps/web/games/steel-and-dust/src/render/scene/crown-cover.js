import { DROP } from '../../data/ambush.js';
import { crownPatch } from './canopy-rustle.js';
import { CELL_HEIGHT, CELL_WIDTH, drawLayerCell } from './rustle-cells.js';

// a raider is about this tall, and stays in the leaves at most this long after it lets go; the
// leaves cover it only down to a little below where it hid, so it comes out of them as it falls
const BODY = 44;
const HALF_WIDTH = 20;
const COVER_TICKS = 30;
const COVER_BELOW = 16;

const isLeavingCrown = (shot) =>
  shot.kind === 'dropMark' &&
  shot.perch?.kind === 'crown' &&
  shot.raider &&
  shot.time - DROP.warn < COVER_TICKS;

// the cells of the crown round the raider's body, on the same grid the rustle moves them on
function cellsOver(patch, { left, right, top, bottom }) {
  const cells = [];
  const fromX = patch.left + Math.floor((left - patch.left) / CELL_WIDTH) * CELL_WIDTH;
  const fromY = patch.top + Math.floor((top - patch.top) / CELL_HEIGHT) * CELL_HEIGHT;

  for (let x = Math.max(patch.left, fromX); x < Math.min(patch.right, right); x += CELL_WIDTH) {
    for (let y = Math.max(patch.top, fromY); y < Math.min(patch.bottom, bottom); y += CELL_HEIGHT) {
      cells.push({ x, y });
    }
  }

  return cells;
}

function coverRaider(context, mark, { layer, cameraX, shake }) {
  const crown = crownPatch(mark, { cameraX });
  const patch = { ...crown, bottom: Math.min(crown.bottom, mark.perch.y + COVER_BELOW) };
  const raiderX = Math.round(mark.raider.x - cameraX);
  const body = {
    left: raiderX - HALF_WIDTH,
    right: raiderX + HALF_WIDTH,
    top: Math.round(mark.raider.y) - BODY,
    bottom: Math.round(mark.raider.y),
  };

  for (const { x, y } of cellsOver(patch, body)) {
    const { dx, dy } = patch.offset(x, y);

    drawLayerCell(context, layer, { cameraX, shake, x, y, dx, dy });
  }
}

// a raider letting go of a crown drops out through its leaves: for its first ticks the crown's own
// layer is laid back over its body, swaying as the rustle sways it, so it falls out of the leaves
// instead of appearing in front of them
export function drawCrownCover(painter, setLayer, { game, backdrop, cameraX }) {
  const marks = game.projectiles.filter(isLeavingCrown);

  if (!marks.length) {
    return;
  }

  setLayer(0, false);
  for (const mark of marks) {
    const layer = backdrop.layers.find((one) => one.name === mark.perch.layer && one.ready);

    if (layer) {
      coverRaider(painter.context, mark, { layer, cameraX, shake: setLayer.shake });
    }
  }

  setLayer(0, true);
}
