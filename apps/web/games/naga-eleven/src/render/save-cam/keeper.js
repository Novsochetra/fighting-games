import { SAVE_CAM_ART } from '../../art/save-cam.js';
import { drawActor } from '../actors/draw-actor.js';
import { looksOf } from '../actors/looks.js';
import { createActorArt } from '../actors/sheets.js';
import { ellipse } from '../duel/shapes.js';
import { drawDiveFigure } from './dive-figure.js';
import { DEPTH, project } from './view.js';

// with no sheets loaded the block figure stands in, drawn straight onto the frame
const FIGURE_ART = createActorArt({ createCanvas: null });

// the sheet's frame for a standing pose: the pose counts its frames as the sheet it was made for
// did, a sheet of fewer is read at the same share of its length
function stateOf(art, pose) {
  const animation = art.manifest.animations[pose.animation] ?? art.manifest.animations.idle;
  const frame = Math.min(
    animation.frames - 1,
    Math.round((pose.frame / Math.max(1, pose.of - 1)) * (animation.frames - 1)),
  );

  return { name: pose.animation, age: (frame * 60) / animation.fps + 0.5, direction: 'south' };
}

// on the grass under him, as wide as he lies or flies; a dive's frame says where
export function drawKeeperShadow(pen, pose) {
  const ground = project({ x: 0, y: 0, z: DEPTH.keeper }).y;
  const lying = pose.animation === 'fall';

  ellipse(pen, {
    x: pose.shadow?.x ?? pose.x + (lying ? 12 : 0),
    y: ground,
    radiusX: pose.shadow?.radiusX ?? (lying ? 24 : 12),
    radiusY: 3,
    color: SAVE_CAM_ART.shadow,
  });
}

// the keeper in his own kit, one pixel of his art to one of the cut-in's: diving on the dive's
// pixel maps, standing on his sheets
export function drawKeeper(pen, { pose, match, keeper, actors }) {
  const art = actors ?? FIGURE_ART;
  const look = looksOf(match).players[keeper] ?? looksOf(match).players[0];
  const { context } = pen;

  if (pose.figure) {
    const number = match.players[keeper]?.number;

    drawDiveFigure(pen, {
      map: pose.figure,
      x: pose.x,
      y: pose.y,
      mirror: pose.mirror,
      look,
      number,
    });

    return;
  }

  context.save();
  context.translate(pen.origin.x + pose.x * pen.unit, pen.origin.y + pose.y * pen.unit);
  context.scale(pen.unit, pen.unit);
  context.imageSmoothingEnabled = false;
  drawActor(context, art, { look, state: stateOf(art, pose), x: 0, y: 0 });
  context.restore();
}

// a ball held to the chest: his gloves over it either side
export function drawHeldGloves(pen, { x, y, radius }) {
  const [deep, mid, light] = SAVE_CAM_ART.glove;

  for (const side of [-1, 1]) {
    const left = Math.round(x + side * radius - (side < 0 ? 3 : 0));

    pen.rect([left - 1, y - 3, 5, 6], deep);
    pen.rect([left, y - 2, 3, 4], mid);
    pen.rect([left, y - 2, 3, 1], light);
  }
}
