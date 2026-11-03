import { DIALOGUE } from '../../art/dialogue/palette.js';
import { VIEW } from '../../config.js';
import { currentLine, isSkipAsked, skipProgress } from '../../story/scene.js';
import { drawBackdrop } from '../backdrops/index.js';
import { drawCaption } from './caption.js';
import { CAPTION, LETTERBOX, sceneLayout, skipTagRect } from './layout.js';
import { onGrid, remaining } from './motion.js';
import { fillArt } from './pixel-map.js';
import { drawSkipTag } from './skip-tag.js';
import { drawSpeech } from './speech.js';
import { drawStage } from './stage.js';

const LETTERBOX_TICKS = 18;
const FADE_TICKS = 16;

function drawLetterbox(context, sceneTick) {
  const height = onGrid(LETTERBOX * (1 - remaining(sceneTick, LETTERBOX_TICKS)));

  fillArt(context, DIALOGUE.letterbox, { x: 0, y: 0, width: VIEW.width, height });
  fillArt(context, DIALOGUE.letterbox, {
    x: 0,
    y: VIEW.height - height,
    width: VIEW.width,
    height,
  });
}

function drawFadeIn(context, sceneTick) {
  const alpha = remaining(sceneTick, FADE_TICKS);

  if (alpha > 0) {
    context.save();
    context.globalAlpha = alpha;
    fillArt(context, DIALOGUE.fade, { x: 0, y: 0, width: VIEW.width, height: VIEW.height });
    context.restore();
  }
}

function drawLine(context, state, { line, lang, tick, characters }) {
  if (!line.portrait) {
    drawCaption(context, line, { rect: CAPTION, tick });

    return;
  }

  drawStage(context, state, sceneLayout);
  drawSpeech(context, line, { layout: sceneLayout(line.side), lang, tick, characters });
}

// `tick` runs the backdrop and the arrow; the scene's own clock runs its slides and fades
export function drawScene(
  context,
  state,
  { lang = state.lang, tick = state.tick, characters } = {},
) {
  const line = currentLine(state);

  context.imageSmoothingEnabled = false;
  drawBackdrop(context, state.scene?.backdrop ?? 'black', { tick });

  if (line) {
    drawLine(context, state, { line, lang, tick, characters });
  }

  drawLetterbox(context, state.tick);

  if (line) {
    const asking = isSkipAsked(state);

    drawSkipTag(context, skipTagRect(asking), {
      progress: skipProgress(state),
      asking,
      lang,
      tick,
    });
  }

  drawFadeIn(context, state.tick);
}
