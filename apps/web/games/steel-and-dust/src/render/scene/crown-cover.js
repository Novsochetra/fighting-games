import { DROP } from '../../data/ambush.js';
import { rustlePatch } from './canopy-rustle.js';
import { drawSwayedLayer } from './sway-patch.js';

// a raider is about this tall, and stays in the leaves at most this long after it lets go; the
// leaves cover it only down to a little below where it hid, so it comes out of them as it falls
const BODY = 44;
const HALF_WIDTH = 20;
const COVER_TICKS = 30;
const COVER_BELOW = 16;
// a raider's lowest row is the one its feet stand on, so the leaves reach down through it
const FEET_ROW = 1;

const isLeavingCrown = (shot) =>
  shot.kind === 'dropMark' &&
  shot.perch?.kind === 'crown' &&
  shot.raider &&
  shot.time - DROP.warn < COVER_TICKS;

// the part of the swaying trees over the raider's body, down to a little below where it hid
function overBody(patch, mark, cameraX) {
  const raiderX = Math.round(mark.raider.x - cameraX);
  const feet = Math.round(mark.raider.y);

  return {
    ...patch,
    left: Math.max(patch.left, raiderX - HALF_WIDTH),
    right: Math.min(patch.right, raiderX + HALF_WIDTH),
    top: Math.max(patch.top, feet - BODY),
    bottom: Math.min(patch.bottom, feet + FEET_ROW, mark.perch.y + COVER_BELOW),
    keepStill: true,
  };
}

// a raider letting go of a crown drops out through its leaves: for its first ticks the crown's own
// layer is laid back over its body, swaying as the rustle sways it, so it falls out of the leaves
// instead of appearing in front of them
export function drawCrownCover(painter, setLayer, { game, backdrop, cameraX }) {
  const marks = game.projectiles.filter(isLeavingCrown);
  const patch = marks.length && rustlePatch(game, { backdrop, cameraX });

  if (!patch) {
    return;
  }

  setLayer(0, false);
  for (const mark of marks) {
    const layer = backdrop.layers.find((one) => one.name === mark.perch.layer && one.ready);

    if (layer) {
      const scene = { cameraX, shake: setLayer.shake };

      drawSwayedLayer(painter.context, layer, overBody(patch, mark, cameraX), scene);
    }
  }

  setLayer(0, true);
}
