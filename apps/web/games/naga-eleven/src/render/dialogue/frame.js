import { ART_KEYS, DIALOGUE } from '../../art/dialogue/palette.js';
import { drawBands, drawFill, innerOf } from './frame-band.js';
import { ART, drawPixelMap, fillArt, mapHeight, mapWidth } from './pixel-map.js';
import { drawStamped } from './stamp.js';

// art pixels round the box that its corners and crest reach out into
const MARGIN = 12;
const SHADOW_OFFSET = 2;

const bandMiddle = (style) => Math.floor((style.top.length - 1) / 2);

function drawCorners(context, box, style) {
  const size = mapWidth(style.corner);
  const near = bandMiddle(style) - Math.floor(size / 2);
  const farX = box.x + box.width - 1 - bandMiddle(style) - Math.floor(size / 2);
  const farY = box.y + box.height - 1 - bandMiddle(style) - Math.floor(size / 2);

  for (const [x, y, flipX, flipY] of [
    [box.x + near, box.y + near, false, false],
    [farX, box.y + near, true, false],
    [box.x + near, farY, false, true],
    [farX, farY, true, true],
  ]) {
    drawPixelMap(context, style.corner, { x: x * ART, y: y * ART, colors: ART_KEYS, flipX, flipY });
  }
}

function drawCrest(context, box, style) {
  if (!style.crest) {
    return;
  }

  const x = box.x + Math.floor((box.width - mapWidth(style.crest)) / 2);
  const y = box.y + bandMiddle(style) + 1 - mapHeight(style.crest);

  drawPixelMap(context, style.crest, { x: x * ART, y: y * ART, colors: ART_KEYS });
}

// the box stands a little off what is behind it
function drawShadow(context, box) {
  context.save();
  context.globalAlpha = DIALOGUE.boxShadowAlpha;
  fillArt(context, DIALOGUE.boxShadow, {
    x: (box.x + SHADOW_OFFSET) * ART,
    y: (box.y + SHADOW_OFFSET) * ART,
    width: box.width * ART,
    height: box.height * ART,
  });
  context.restore();
}

function paintFrame(context, box, style) {
  const inner = innerOf(box, style);

  drawShadow(context, box);
  drawFill(context, inner, style);
  drawBands(context, box, style);
  drawCorners(context, box, style);
  drawCrest(context, box, style);
}

// `rect` in canvas pixels, on whole art pixels
export function drawFrame(context, rect, style) {
  const box = { x: MARGIN, y: MARGIN, width: rect.width / ART, height: rect.height / ART };
  const reach = MARGIN * ART;

  drawStamped(
    context,
    `${style.id}:${rect.width}x${rect.height}`,
    {
      x: Math.round(rect.x - reach),
      y: Math.round(rect.y - reach),
      width: rect.width + reach * 2,
      height: rect.height + reach * 2,
    },
    (stamp) => paintFrame(stamp, box, style),
  );
}

export const innerRect = (rect, style) => {
  const depth = style.top.length * ART;

  return {
    x: rect.x + depth,
    y: rect.y + depth,
    width: rect.width - depth * 2,
    height: rect.height - depth * 2,
  };
};
