import { ART_KEYS } from '../../art/dialogue/palette.js';
import { WINDOW } from '../../art/dialogue/frame.js';
import { currentLine } from '../../story/scene.js';
import { drawPortrait } from '../portraits/index.js';
import { drawCaption } from './caption.js';
import { OVERLAY_CAPTION, overlayLayout } from './layout.js';
import { onGrid, remaining } from './motion.js';
import { ART, fillArt } from './pixel-map.js';
import { drawSpeech } from './speech.js';

const RISE_TICKS = 10;
const RISE_DISTANCE = 24;

// the overlay rises from below the view as it opens, so it never pops over the play
export const overlayRise = (state) => onGrid(RISE_DISTANCE * remaining(state.tick, RISE_TICKS));

const inset = (rect, by) => ({
  x: rect.x + by,
  y: rect.y + by,
  width: rect.width - by * 2,
  height: rect.height - by * 2,
});

function drawWindow(context, rect) {
  WINDOW.band.forEach((key, i) => {
    fillArt(context, ART_KEYS[key], inset(rect, i * ART));
  });
  fillArt(context, ART_KEYS[WINDOW.back], inset(rect, WINDOW.band.length * ART));
}

function drawSpeaker(context, line, layout) {
  drawWindow(context, layout.window);
  drawPortrait(context, {
    ...line.portrait,
    x: layout.portrait.x,
    y: layout.portrait.y,
    scale: layout.portrait.scale,
    flip: line.side === 'right',
  });
}

export function drawDialogueOverlay(
  context,
  state,
  { lang = state.lang, tick = state.tick, characters } = {},
) {
  const line = currentLine(state);

  if (!line) {
    return;
  }

  context.save();
  context.imageSmoothingEnabled = false;
  context.translate(0, overlayRise(state));

  if (line.portrait) {
    const layout = overlayLayout(line.side);

    drawSpeech(context, line, { layout, lang, tick, characters });
    drawSpeaker(context, line, layout);
  } else {
    drawCaption(context, line, { rect: OVERLAY_CAPTION, tick });
  }

  context.restore();
}
