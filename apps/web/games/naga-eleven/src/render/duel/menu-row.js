import { ICON_PALETTE, ICONS, TAG_ART } from '../../art/duel/icons.js';
import { DUEL_UI } from '../../art/duel/palette.js';
import { SKILL_WORDS } from '../../data/skill-words.js';
import { drawText, measureText, numberIn, sizeFor, textOf } from '../text.js';
import { drawGrid } from './grid.js';
import { toCanvas } from './layout.js';
import { rowFacts } from './menu-rows.js';
import { drawTag, tagWords } from './menu-tags.js';

const NAME_LEFT = 20;

// what the picker pays, at the row's right end: the spirit, or FREE
function pays(pen, { box, facts, lang }) {
  const right = box.x + box.width - 2;
  const y = box.y + 2;

  if (facts.pays === 'free') {
    return drawTag(pen, { pieces: [textOf(SKILL_WORDS.free, lang)], art: TAG_ART.free, right, y });
  }

  if (!facts.pays) {
    return right;
  }

  drawGrid(pen, { rows: ICONS.special, palette: ICON_PALETTE.spirit, x: right - 18, y: box.y + 1 });
  label(pen, {
    text: numberIn(facts.pays, lang),
    x: right,
    y: box.y,
    color: DUEL_UI.spirit[3],
    align: 'right',
  });

  return right - 20;
}

function label(pen, { text, x, y, color, align = 'left', room = Infinity }) {
  const size = measureText(pen.context, text, { size: 16 }) > toCanvas(room) ? 8 : 16;

  drawText(pen.context, text, {
    x: pen.origin.x + toCanvas(x),
    y:
      pen.origin.y +
      toCanvas(y) +
      (size === 16 ? 7 : 11) -
      (sizeFor(text, size) > 8 && size === 8 ? 3 : 0),
    color,
    shadow: DUEL_UI.shadow,
    align,
    size,
  });
}

const NAME_COLOURS = {
  special: DUEL_UI.gold,
  skill: ICON_PALETTE.skill[3],
  combo: ICON_PALETTE.combo[3],
};

// a row: its picture, its name, and at its right what lifts it and what it costs
export function drawRow(pen, { option, box, lang, match = null }) {
  const facts = rowFacts(option, match);
  const name = textOf(option.label, lang);
  const after = pays(pen, { box, facts, lang });
  const room = after - box.x - NAME_LEFT;
  const words = tagWords(pen.context, { tags: facts.tags, lang, name, room });
  const right = facts.tags.reduceRight(
    (edge, tag, i) =>
      drawTag(pen, { pieces: words[i], art: TAG_ART[tag.word], right: edge, y: box.y + 2 }),
    after,
  );

  drawGrid(pen, {
    rows: ICONS[facts.icon] ?? ICONS.special,
    palette: ICON_PALETTE[facts.palette],
    x: box.x + 10,
    y: box.y + 1,
  });
  label(pen, {
    text: name,
    x: box.x + NAME_LEFT,
    y: box.y,
    color: NAME_COLOURS[facts.palette] ?? DUEL_UI.text,
    room: right - box.x - NAME_LEFT,
  });
}
