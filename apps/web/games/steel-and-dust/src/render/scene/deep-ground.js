import { VIEW_HEIGHT } from '../../config.js';

// the stretches of a picture that tiles along the road covering columns `x` to `x + width`
function tileSpans(x, width, tileWidth) {
  const spans = [];

  for (let drawn = 0; drawn < width; ) {
    const sourceX = (((x + drawn) % tileWidth) + tileWidth) % tileWidth;
    const span = Math.min(width - drawn, tileWidth - sourceX);

    spans.push({ sourceX, span, x: x + drawn });
    drawn += span;
  }

  return spans;
}

// the paving casts a shadow on the wall just under it, darkest at its edge
const CAP_SHADOW = [0.42, 0.2];

// the road's body under its paving lies at the world's own rows, not its surface's, so every step
// stands on the same courses and earth, from `fromY` on down
export function drawDeepRun(painter, deep, { run, fromY, shadow }) {
  const top = Math.max(0, Math.round(fromY));
  const height = VIEW_HEIGHT - top;

  if (height <= 0) {
    return;
  }

  for (const { sourceX, span, x } of tileSpans(run.x, run.width, deep.image.width)) {
    painter.context.drawImage(deep.image, sourceX, top, span, height, x, top, span, height);
  }

  CAP_SHADOW.forEach((alpha, row) => {
    painter
      .alpha(alpha)
      .use(shadow)
      .rect(run.x, top + row, run.width, 1);
  });
  painter.alpha(1);
}

// a face picture is its variants side by side, each `width` wide, the step's edge `inside` columns
// in from its high side: a built step's, or a breach's, broken through the road and running on
// down out of sight, one variant for the bank on either side so the two never mirror each other
const FACES = { face: { width: 11, inside: 5 }, breach: { width: 16, inside: 6 } };

function faceVariant(step, { picture, variants }) {
  const variant =
    picture === 'breach' ? Number(step.highOnLeft) : Math.floor(step.x / 7) % variants;

  return step.highOnLeft ? variant : variants - 1 - variant;
}

// the ends of the courses where a step cuts through the body, each jutting out over the low side
// or fallen back by its own amount, at the world's rows from under the paving down to the low ground
export function drawDeepFace(context, deep, { step, fromY }) {
  const name = step.foot > VIEW_HEIGHT ? 'breach' : 'face';
  const face = deep[name];
  const { width, inside } = FACES[name];
  const top = Math.max(0, Math.round(fromY));
  const height = Math.min(step.foot, VIEW_HEIGHT) - top;

  if (!face?.ready || height <= 0) {
    return;
  }

  const variants = Math.floor(face.image.width / width);
  const sourceX = faceVariant(step, { picture: name, variants }) * width;
  const x = step.highOnLeft ? step.x - inside : step.x - width + inside;
  const picture = step.highOnLeft ? face.image : face.mirrored;

  context.drawImage(picture, sourceX, top, width, height, x, top, width, height);
}
