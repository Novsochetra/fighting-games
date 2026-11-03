import { PLATE_END, PLATE_PROFILE } from '../../art/dialogue/cues.js';
import { ART_KEYS, DIALOGUE } from '../../art/dialogue/palette.js';
import { drawText, isKhmer, measureText } from '../text.js';
import { ART, drawPixelMap, fillArt, mapWidth } from './pixel-map.js';

const NAME_STYLE = { size: 16, weight: 700 };
const SIDE_ROOM = 6;

const endWidth = mapWidth(PLATE_END) * ART;

export const PLATE_HEIGHT = PLATE_PROFILE.length * ART;

const labelOf = (name) => (isKhmer(name) ? name : name.toUpperCase());

// `limit` is as far as the plate may reach from `x`; a longer one slides back to keep inside it
function fittedLeft({ x, align, limit }, width) {
  const left = align === 'right' ? x - width : x;

  if (limit === undefined) {
    return left;
  }

  return align === 'right' ? Math.max(left, limit) : Math.min(left, limit - width);
}

export function plateRect(context, name, anchor) {
  const textWidth = Math.ceil(measureText(context, labelOf(name), NAME_STYLE) / ART) * ART;
  const width = textWidth + (endWidth + SIDE_ROOM) * 2;

  return { x: fittedLeft(anchor, width), y: anchor.y, width, height: PLATE_HEIGHT };
}

function drawRibbon(context, rect) {
  const middle = { x: rect.x + endWidth, width: rect.width - endWidth * 2 };

  PLATE_PROFILE.forEach((key, row) => {
    fillArt(context, ART_KEYS[key], { ...middle, y: rect.y + row * ART, height: ART });
  });
  drawPixelMap(context, PLATE_END, { x: rect.x, y: rect.y, colors: ART_KEYS });
  drawPixelMap(context, PLATE_END, {
    x: rect.x + rect.width - endWidth,
    y: rect.y,
    colors: ART_KEYS,
    flipX: true,
  });
}

export function drawNamePlate(context, name, anchor) {
  const rect = plateRect(context, name, anchor);
  const khmer = isKhmer(name);

  drawRibbon(context, rect);
  drawText(context, labelOf(name), {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2 + (khmer ? 1 : 0),
    align: 'center',
    baseline: 'middle',
    color: DIALOGUE.name,
    shadow: DIALOGUE.nameShadow,
    ...NAME_STYLE,
  });

  return rect;
}
