import { drawDeepFace } from './deep-ground.js';

// a jump smaller than this is a slope's stair-step, not a face
const SHEER = 3;
// the face's rough outer edge stands up to this far out over the low side
const FACE_OUT = 2;
// the high side's turf hangs a pixel past the face, drooping a row at its tip
const LIP = [
  { from: 0, to: FACE_OUT, drop: 0, rows: 4 },
  { from: FACE_OUT, to: FACE_OUT + 1, drop: 1, rows: 2 },
];
// the low side's turf runs on under the foot of the face, so the face stands in it
const FOOT = { from: -5, to: FACE_OUT, drop: 0, rows: 9 };
// a wide faint band and a narrow darker one at the foot of the face, on the low side
const CONTACT_SHADOW = [
  { width: 9, height: 3, alpha: 0.2 },
  { width: 4, height: 4, alpha: 0.3 },
];

// how far the turf rolls down over the shoulder of a face, by columns from its edge
const SHOULDER = [4, 2, 1, 1];

function dropToward(surfaceAt, x, side) {
  for (let distance = 1; distance <= SHOULDER.length; distance++) {
    const edge = x + side * distance;
    const fall = surfaceAt(edge) - surfaceAt(edge - side);
    if (fall >= SHEER) {
      return Math.min(SHOULDER[distance - 1], Math.floor(fall / 3));
    }
  }
  return 0;
}

// the road is drawn with the top of every face rounded off, though fighters still stand on the
// sheer step: the turf rolls over the edge instead of ending in a square corner
export function roundedShoulders(surfaceAt) {
  return (x) => surfaceAt(x) + Math.max(dropToward(surfaceAt, x, 1), dropToward(surfaceAt, x, -1));
}

export function cliffSteps(runs) {
  const steps = [];
  for (let i = 1; i < runs.length; i++) {
    const [before, after] = [runs[i - 1], runs[i]];
    if (Math.abs(before.y - after.y) >= SHEER) {
      const top = Math.min(before.y, after.y);
      const foot = Math.max(before.y, after.y);
      steps.push({ x: after.x, top, foot, highOnLeft: before.y < after.y });
    }
  }
  return steps;
}

// the columns `from` to `to` pixels out from the face toward its low side
function across(step, from, to) {
  const width = to - from;
  return step.highOnLeft ? { x: step.x + from, width } : { x: step.x - to, width };
}

// rows of the painted cross-section, down to `rows` under the surface at `surfaceY`, on its own
// columns so they join the road they came from
function drawSlice(context, texture, step, { surfaceY, slice }) {
  const { image, top } = texture;
  const { x, width } = across(step, slice.from, slice.to);
  const height = top + slice.rows;
  for (let drawn = 0; drawn < width;) {
    const sourceX = (((x + drawn) % image.width) + image.width) % image.width;
    const span = Math.min(width - drawn, image.width - sourceX);
    const destinationY = surfaceY + slice.drop - top;
    context.drawImage(image, sourceX, 0, span, height, x + drawn, destinationY, span, height);
    drawn += span;
  }
}

function drawContactShadow(painter, step, color) {
  for (const { width, height, alpha } of CONTACT_SHADOW) {
    const { x } = across(step, FACE_OUT, FACE_OUT + width);
    painter
      .alpha(alpha)
      .use(color)
      .rect(x, step.foot - 1, width, height);
  }
  painter.alpha(1);
}

// the cliff picture is the face of a step whose high ground is on the left; a face the other
// way round uses its mirror image. It hangs from the lip and is cut off at the low ground
function drawFace(context, cliff, step) {
  const { image, mirrored } = cliff;
  const rise = Math.min(step.foot - step.top, image.height);
  const { x, width } = across(step, FACE_OUT - image.width, FACE_OUT);
  const picture = step.highOnLeft ? image : mirrored;
  context.drawImage(picture, 0, 0, width, rise, x, step.top, width, rise);
}

export function drawCliffFaces(painter, runs, { texture, cliff, colors, deep }) {
  const { context } = painter;
  for (const step of cliffSteps(runs)) {
    if (deep) {
      drawDeepFace(context, deep, { step, fromY: step.top - texture.top + deep.from });
    }
    drawFace(context, cliff, step);
    for (const slice of LIP) {
      drawSlice(context, texture, step, { surfaceY: step.top, slice });
    }
    drawSlice(context, texture, step, { surfaceY: step.foot, slice: FOOT });
    drawContactShadow(painter, step, colors.shadow);
  }
}
