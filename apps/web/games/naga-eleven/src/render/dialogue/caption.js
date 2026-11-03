import { CAPTION_FADE, RULE_DIAMOND } from '../../art/dialogue/cues.js';
import { ART_KEYS, DIALOGUE, GOLD } from '../../art/dialogue/palette.js';
import { drawNextArrow } from './cues.js';
import { drawLineText } from './dialogue-text.js';
import { ART, drawPixelMap, fillArt, mapWidth } from './pixel-map.js';

const FADE_STEP = 12;

function drawBand(context, rect) {
  const fade = CAPTION_FADE.length * FADE_STEP;

  context.save();
  CAPTION_FADE.forEach((alpha, i) => {
    context.globalAlpha = alpha * DIALOGUE.captionAlpha;

    for (const x of [rect.x + i * FADE_STEP, rect.x + rect.width - (i + 1) * FADE_STEP]) {
      fillArt(context, DIALOGUE.caption, { ...rect, x, width: FADE_STEP });
    }
  });
  context.globalAlpha = DIALOGUE.captionAlpha;
  fillArt(context, DIALOGUE.caption, { ...rect, x: rect.x + fade, width: rect.width - fade * 2 });
  context.restore();
}

function drawRule(context, { x, y, width }) {
  const diamond = mapWidth(RULE_DIAMOND) * ART;
  const middle = Math.round((x + width / 2 - diamond / 2) / ART) * ART;
  const reach = Math.round(width * 0.36);
  const steps = [GOLD[1], GOLD[2], GOLD[3], GOLD[4]];

  steps.forEach((color, i) => {
    const span = Math.round((reach * (steps.length - i)) / steps.length / ART) * ART;

    fillArt(context, color, { x: middle - span, y, width: span, height: ART });
    fillArt(context, color, { x: middle + diamond, y, width: span, height: ART });
  });
  drawPixelMap(context, RULE_DIAMOND, { x: middle, y: y - ART * 3, colors: ART_KEYS });
}

// narration has no speaker to give a box and a name to
export function drawCaption(context, line, { rect, tick }) {
  drawBand(context, rect);
  drawRule(context, { x: rect.x, y: rect.y + 8, width: rect.width });
  drawRule(context, { x: rect.x, y: rect.y + rect.height - 10, width: rect.width });
  drawLineText(context, line, {
    area: { x: rect.x + 96, y: rect.y + 16, width: rect.width - 192, height: rect.height - 32 },
    color: DIALOGUE.narration,
    shadow: DIALOGUE.narrationShadow,
    center: true,
  });

  if (line.typed) {
    drawNextArrow(context, { x: rect.x + rect.width - 120, y: rect.y + rect.height - 30 }, tick);
  }
}
