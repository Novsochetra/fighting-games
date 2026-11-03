import { SKIP_CHEVRONS } from '../../art/dialogue/cues.js';
import { ART_KEYS, DIALOGUE } from '../../art/dialogue/palette.js';
import { drawText, textOf } from '../text.js';
import { onGrid } from './motion.js';
import { ART, drawPixelMap, fillArt, mapWidth } from './pixel-map.js';

// Khmer asks with the word alone, as a question, until the user gives the sentence
export const SKIP_LABEL = { en: 'SKIP', km: 'រំលង' };
export const SKIP_ASKING_LABEL = { en: 'TAP AGAIN TO SKIP', km: 'រំលង?' };

const PULSE_TICKS = 15;

// a bevel of temple gold round a plate dark enough to read over a spotlight
function drawPlate(context, rect, { asking, tick }) {
  const lit = asking && Math.floor(tick / PULSE_TICKS) % 2 === 0;
  const { x, y, width, height } = rect;

  context.globalAlpha = DIALOGUE.skipPlateAlpha;
  fillArt(context, DIALOGUE.skipPlate, rect);
  context.globalAlpha = 1;
  fillArt(context, lit ? DIALOGUE.skipEdgeAsking : DIALOGUE.skipEdgeLight, {
    x,
    y,
    width,
    height: ART,
  });
  fillArt(context, lit ? DIALOGUE.skipEdgeAsking : DIALOGUE.skipEdgeLight, {
    x,
    y,
    width: ART,
    height,
  });
  fillArt(context, DIALOGUE.skipEdge, { x, y: y + height - ART, width, height: ART });
  fillArt(context, DIALOGUE.skipEdge, { x: x + width - ART, y, width: ART, height });
}

function drawLabel(context, rect, { asking, lang }) {
  const label = textOf(asking ? SKIP_ASKING_LABEL : SKIP_LABEL, lang);

  drawText(context, label, {
    x: rect.x + 12,
    y: rect.y + rect.height / 2,
    baseline: 'middle',
    color: asking ? DIALOGUE.skipAsking : DIALOGUE.skip,
    shadow: DIALOGUE.textShadow,
    size: 16,
  });
  drawPixelMap(context, SKIP_CHEVRONS, {
    x: rect.x + rect.width - mapWidth(SKIP_CHEVRONS) * ART - 10,
    y: rect.y + 8,
    colors: ART_KEYS,
  });
}

function drawHold(context, rect, progress) {
  const bar = {
    x: rect.x + ART,
    y: rect.y + rect.height - ART * 2,
    width: rect.width - ART * 2,
    height: ART,
  };

  fillArt(context, DIALOGUE.skipTrack, bar);
  fillArt(context, DIALOGUE.skipFill, { ...bar, width: onGrid(bar.width * progress) });
}

export function drawSkipTag(context, rect, { progress = 0, asking = false, lang, tick = 0 }) {
  context.save();
  drawPlate(context, rect, { asking, tick });
  drawLabel(context, rect, { asking, lang });

  if (progress > 0) {
    drawHold(context, rect, progress);
  }

  context.restore();
}
