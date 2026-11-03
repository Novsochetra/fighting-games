import { arrangeView, isPortrait } from '../../../../packages/screen/src/stage-fit.js';
import { VIEW } from '../config.js';
import { fitDuelMenu } from '../render/duel/layout.js';
import { needsTurnCard, showTurnCard } from './turn-card.js';

// the touch controls' height under the stage, where an upright tablet stands them
const CONTROLS_HEIGHT = 250;

// below one screen pixel to a canvas pixel the nearest pixel drops whole columns and rows, and
// with them thin lines and the strokes of small words; smoothing keeps every stroke
const isShrunk = (rect, canvas, pixelRatio = 1) => rect.width * pixelRatio < canvas.width;

export function fitStage(window, { canvas, safe, touchOn }) {
  const { innerWidth: width, innerHeight: height, devicePixelRatio } = window;
  const { rect } = arrangeView({
    width,
    height,
    safe,
    hinge: null,
    view: VIEW,
    controlsHeight: touchOn ? CONTROLS_HEIGHT : null,
    frame: null,
  });

  Object.assign(canvas.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  canvas.classList.toggle('is-shrunk', isShrunk(rect, canvas, devicePixelRatio));
  fitDuelMenu({ touch: touchOn, stageHeight: rect.height });
  showTurnCard(canvas.ownerDocument, needsTurnCard({ width, height, touchOn }));

  return { portrait: isPortrait(width, height) };
}
