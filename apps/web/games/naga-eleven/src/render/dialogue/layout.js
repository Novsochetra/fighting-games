import { FULL_FRAME, SLIM_FRAME, WINDOW } from '../../art/dialogue/frame.js';
import { VIEW } from '../../config.js';
import { PORTRAIT_SIZE } from '../portraits/index.js';
import { isKhmer } from '../text.js';
import { innerRect } from './frame.js';
import { ART, mapWidth } from './pixel-map.js';

export const LETTERBOX = 12;

const PAD = 10;

// Silkscreen is crisp at 16 px; the Khmer face needs more room for the marks stacked above and
// below its letters
export const textStyleOf = (text) =>
  isKhmer(text) ? { size: 20, lineHeight: 28 } : { size: 16, lineHeight: 21 };

const FULL_BOX = { x: 24, y: 290, width: 720, height: 124 };
const FULL_PORTRAIT = PORTRAIT_SIZE * 2;
// a speaker's hands, gloves and scarf are drawn along the foot of their portrait: only its last
// rows go behind the box's edge
const PORTRAIT_TUCK = 4;
const CREST_GAP = 6;

function crestSpan() {
  const width = mapWidth(FULL_FRAME.crest) * ART;
  const left =
    FULL_BOX.x + Math.floor((FULL_BOX.width / ART - mapWidth(FULL_FRAME.crest)) / 2) * ART;

  return { left, right: left + width };
}

// the name stands on the box's edge beside the speaker, toward the middle, so it covers none of
// them; a name too long for the room slides back over their shoulder, never into the crest
function scenePlate(portraitX, left) {
  const crest = crestSpan();

  return left
    ? { x: portraitX + FULL_PORTRAIT, align: 'left', limit: crest.left - CREST_GAP }
    : { x: portraitX, align: 'right', limit: crest.right + CREST_GAP };
}

// a full-screen scene: the speaker stands on the box's top edge, their name beside them
export function sceneLayout(side) {
  const inner = innerRect(FULL_BOX, FULL_FRAME);
  const left = side !== 'right';
  const portraitX = left ? 40 : VIEW.width - 40 - FULL_PORTRAIT;

  return {
    box: FULL_BOX,
    frame: FULL_FRAME,
    portrait: {
      x: portraitX,
      y: FULL_BOX.y + PORTRAIT_TUCK - FULL_PORTRAIT,
      scale: 2,
      size: FULL_PORTRAIT,
    },
    plate: { ...scenePlate(portraitX, left), y: FULL_BOX.y - 16 },
    text: { x: inner.x + PAD, y: inner.y + 7, width: inner.width - PAD * 2 - 20, height: 84 },
    arrow: { x: inner.x + inner.width - 26, y: inner.y + inner.height - 18 },
  };
}

export const CAPTION = { x: 0, y: 296, width: VIEW.width, height: 118 };

const around = ({ x, y, size }, by) => ({
  x: x - by,
  y: y - by,
  width: size + by * 2,
  height: size + by * 2,
});

const OVERLAY_BOX = { x: 104, y: 326, width: 560, height: 96 };

// over a live match the box keeps low and small, so the play stays in view
export function overlayLayout(side) {
  const inner = innerRect(OVERLAY_BOX, SLIM_FRAME);
  const left = side !== 'right';
  const windowX = left ? inner.x + 6 : inner.x + inner.width - 6 - PORTRAIT_SIZE;
  const textX = left ? windowX + PORTRAIT_SIZE + 14 : inner.x + PAD;

  return {
    box: OVERLAY_BOX,
    frame: SLIM_FRAME,
    portrait: { x: windowX, y: inner.y + 4, scale: 1, size: PORTRAIT_SIZE },
    window: around({ x: windowX, y: inner.y + 4, size: PORTRAIT_SIZE }, WINDOW.band.length * ART),
    plate: {
      x: left ? OVERLAY_BOX.x + 12 : OVERLAY_BOX.x + OVERLAY_BOX.width - 12,
      y: OVERLAY_BOX.y - 18,
      align: left ? 'left' : 'right',
    },
    text: { x: textX, y: inner.y + 6, width: inner.width - PORTRAIT_SIZE - PAD - 40, height: 63 },
    arrow: {
      x: left ? inner.x + inner.width - 24 : windowX - 24,
      y: inner.y + inner.height - 16,
    },
  };
}

export const OVERLAY_CAPTION = { x: 0, y: 318, width: VIEW.width, height: 106 };

// resting, the tag is a word and two chevrons; asking, it spells out what a second tap does
const SKIP_WIDTH = { resting: 104, asking: 232 };

export function skipTagRect(asking = false) {
  const width = asking ? SKIP_WIDTH.asking : SKIP_WIDTH.resting;

  return { x: VIEW.width - 16 - width, y: LETTERBOX + 6, width, height: 30 };
}

export const SKIP_TAG = skipTagRect();

// a thumb is wider than the tag, so its touch reaches past it to the view's top right corner
export function skipTouchRect(asking = false) {
  const tag = skipTagRect(asking);

  return { x: tag.x - 16, y: 0, width: VIEW.width - tag.x + 16, height: tag.y + tag.height + 16 };
}
