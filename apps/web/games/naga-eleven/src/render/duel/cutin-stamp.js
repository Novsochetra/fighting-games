import { TAG_ART } from '../../art/duel/icons.js';
import { DUEL_INK, DUEL_UI, WORD_RAMPS } from '../../art/duel/palette.js';
import { SKILL_WORDS } from '../../data/skill-words.js';
import { measureText, sizeFor, textOf } from '../text.js';
import { hash } from './hash.js';
import { ART, toCanvas, UNIT } from './layout.js';
import { finisherLevel } from './menu-detail.js';
import { drawOutlinedText } from './outlined-text.js';
import { drawPixelWord, wordWidth } from './pixel-word.js';
import { ring } from './shapes.js';

const LANDS = 16;
// the Khmer word is set this many of the canvas's pixels for each of the art's in the stamp's
// letters, so at rest it is the size of the move's own Khmer name, and it slams down with them
const GLOSS_PER_SIZE = 12;
// drawOutlinedText rings a word 2 px each side
const OUTLINE = 4;

const STAMPS = {
  duo: () => ({ text: 'DUO', art: TAG_ART.duo, km: SKILL_WORDS.duo }),
  chain: () => ({ text: 'CHAIN', art: TAG_ART.chain, km: SKILL_WORDS.chain }),
  finisher: (option, match) => {
    const level = finisherLevel(option, match);

    return {
      text: `X${level} COMBO`,
      art: TAG_ART.bonus,
      km: SKILL_WORDS.combo,
      flames: level >= 5,
    };
  },
};

// flames licking up either side of the plate of a combo at its height, x5
function flames(pen, { left, top, width, height, tick }) {
  for (const side of [left - 7, left + width + 1]) {
    for (let x = side; x < side + 6; x += 2) {
      const tall = Math.round(height * (0.5 + hash(x, Math.floor(tick / 3), 231) * 0.6));
      const bottom = top + height;

      pen.rect([x, bottom - tall, 2, tall], WORD_RAMPS.ember[3]);
      pen.rect([x, bottom - tall * 0.7, 2, tall * 0.7], WORD_RAMPS.ember[2]);
      pen.rect([x, bottom - tall, 2, 1], WORD_RAMPS.ember[1]);
    }
  }
}

// in Khmer the stamp's own word stands in the plate beside the English: under the plate it was
// small and touched the move's name stamped below
function glossOf(pen, { stamp, size, lang }) {
  if (lang !== 'km') {
    return null;
  }

  const text = textOf(stamp.km, 'km');
  const fontSize = sizeFor(text, size * GLOSS_PER_SIZE);
  const width = measureText(pen.context, text, { size: fontSize, weight: 700 }) + OUTLINE;

  return { text, fontSize, width: Math.ceil(width / UNIT) + 3 };
}

function drawGloss(pen, { gloss, left, top, height, color }) {
  drawOutlinedText(pen.context, gloss.text, {
    x: pen.origin.x + toCanvas(left + gloss.width / 2),
    y: pen.origin.y + Math.round(toCanvas(top + height / 2) - gloss.fontSize * 0.52),
    size: gloss.fontSize,
    color,
  });
}

function plate(pen, { stamp, box, size, gloss }) {
  const { left, top, width, height } = box;
  const wordRoom = wordWidth(stamp.text, size) + 8;

  pen.rect([left - 1, top - 1, width + 2, height + 2], DUEL_INK);
  pen.rect([left, top, width, height], stamp.art.back);
  pen.rect([left + 1, top + 1, width - 2, height - 2], stamp.art.edge);
  pen.rect([left + 2, top + 2, width - 4, height - 4], stamp.art.back);
  drawPixelWord(pen, {
    text: stamp.text,
    x: left + wordRoom / 2,
    y: top + 3,
    size,
    ramp: WORD_RAMPS.gold,
  });

  if (gloss) {
    pen.rect([left + wordRoom - 2, top + 4, 1, height - 8], stamp.art.edge);
    drawGloss(pen, { gloss, left: left + wordRoom, top, height, color: stamp.art.text });
  }
}

// a stamp slammed onto the band's top edge: DUO, CHAIN, or the combo it was built on
export function drawCutinStamp(pen, { tag, option, match, side, ticks, tick, lang }) {
  const stamp = STAMPS[tag]?.(option, match);

  if (!stamp || ticks < LANDS) {
    return;
  }

  const size = ticks < LANDS + 2 ? 3 : 2;
  const gloss = glossOf(pen, { stamp, size, lang });
  const width = wordWidth(stamp.text, size) + 8 + (gloss?.width ?? 0);
  const height = size * 7 + 6;
  const left = side === 'attack' ? ART.width - width - 10 : 10;
  const top = 16 - (size - 2) * 3;

  if (stamp.flames) {
    flames(pen, { left, top, width, height, tick });
  }

  plate(pen, { stamp, box: { left, top, width, height }, size, gloss });

  if (ticks < LANDS + 10) {
    ring(pen, {
      x: left + width / 2,
      y: top + height / 2,
      radius: 8 + (ticks - LANDS) * 4,
      width: 1,
      color: DUEL_UI.white,
    });
  }
}
