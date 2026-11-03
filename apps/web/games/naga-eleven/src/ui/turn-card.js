import { isPortrait } from '../../../../packages/screen/src/stage-fit.js';
import { TURN_PHONE, TURN_PHONE_PALETTE } from '../art/turn-phone.js';
import { drawGrid, gridSize } from '../render/duel/grid.js';
import { createPen } from '../render/duel/pen.js';

// upright, a screen narrower than this asks to be turned: on a phone the pitch was a strip a
// quarter of its height, the footballers 7 px tall; a tablet upright still plays over its controls
export const TURN_BELOW_WIDTH = 600;

const UPRIGHT = 'is-upright';
const CARD_ID = 'turn-card';

// both languages at once, as the card can come up before a language is picked
export const TURN_WORDS = {
  en: 'Turn your phone sideways',
  km: 'បង្វិលទូរស័ព្ទរបស់អ្នកទៅផ្ដេក',
};

export const needsTurnCard = ({ width, height, touchOn }) =>
  Boolean(touchOn) && isPortrait(width, height) && width < TURN_BELOW_WIDTH;

function drawPhone(canvas) {
  const { width, height } = gridSize(TURN_PHONE);

  Object.assign(canvas, { width, height });

  const context = canvas.getContext?.('2d');

  if (context) {
    context.imageSmoothingEnabled = false;
    drawGrid(createPen(context, { unit: 1 }), {
      rows: TURN_PHONE,
      palette: TURN_PHONE_PALETTE,
      x: 0,
      y: 0,
    });
  }
}

function element(document, tag, { className, text, lang }) {
  const node = document.createElement(tag);

  node.className = className;

  if (text) {
    Object.assign(node, { textContent: text, lang });
  }

  return node;
}

function buildCard(document) {
  const card = element(document, 'div', { className: 'turn-card' });
  const panel = element(document, 'div', { className: 'panel turn-panel' });
  const phone = element(document, 'canvas', { className: 'turn-phone' });

  card.id = CARD_ID;
  card.setAttribute('role', 'alert');
  phone.setAttribute('aria-hidden', 'true');
  drawPhone(phone);
  panel.append(
    element(document, 'div', { className: 'panel-trim' }),
    phone,
    element(document, 'p', {
      className: 'panel-title turn-title',
      text: TURN_WORDS.en,
      lang: 'en',
    }),
    element(document, 'p', { className: 'turn-khmer', text: TURN_WORDS.km, lang: 'km' }),
  );
  card.append(panel);

  return card;
}

// the card is made the first time a phone is held upright, so a desktop never draws it
export function showTurnCard(document, shown) {
  if (shown && !document.getElementById(CARD_ID)) {
    document.body.append(buildCard(document));
  }

  document.documentElement.classList.toggle(UPRIGHT, shown);
}

// asked on every frame: the match pauses as the card comes over it, and again should play start
// under it (a replay running out, a pad's Start)
export function pauseUnderCard(root, pause) {
  if (root.classList.contains(UPRIGHT) && root.classList.contains('is-playing')) {
    pause();
  }
}
