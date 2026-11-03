import { describe, expect, it } from 'vitest';
import { DUEL_UI } from '../../../src/art/duel/palette.js';
import { CHARACTERS } from '../../../src/data/characters.js';
import { MOVES } from '../../../src/data/moves.js';
import { MENU, ROOMY_MENU, UNIT } from '../../../src/render/duel/layout.js';
import { drawMenuOf } from '../../../src/render/duel/menu-draw.js';
import { createPen } from '../../../src/render/duel/pen.js';
import { numberIn, textOf } from '../../../src/render/text.js';
import { moveOption } from '../../../src/sim/combos/offers.js';
import { createRecordingContext } from '../../support/recording-context.js';

// With a duo's row lit, the duel menu named its partner twice: his row's tag said DUO + RITHY and
// the menu's head said + Rithy beside it. The row names him; the head tells what the row cannot,
// what each of the two pays.

const OPTIONS = [
  moveOption(MOVES['twin-naga'], { cost: 36, partner: 1, partnerShare: 24, tag: 'duo' }),
  moveOption(MOVES['garuda-volley'], { bonus: 8 }),
];
const MATCH = { players: [{ name: CHARACTERS.sochetra.name }, { name: CHARACTERS.rithy.name }] };

// the words the menu wrote, each once: a word's shadow is the same word again
function wordsOf({ lang, menu }) {
  const { context, calls } = createRecordingContext();
  const words = [];
  let colour = null;

  context.measureText = (text) => ({ width: [...text].length * 8 });
  drawMenuOf(createPen(context, { unit: UNIT }), {
    options: OPTIONS,
    side: 'attack',
    cursor: 0,
    match: MATCH,
    lang,
    tick: 0,
    menu,
  });

  for (const { name, args } of calls) {
    if (name === 'fillStyle') {
      colour = args[0];
    } else if (name === 'fillText' && colour !== DUEL_UI.shadow) {
      words.push(args[0]);
    }
  }

  return words;
}

describe.each([
  ['normal', MENU],
  ['roomy', ROOMY_MENU],
])('the %s duel menu with a duo lit', (kind, menu) => {
  it.each(['en', 'km'])('names the partner once, on his row, in %s', (lang) => {
    const partner = textOf(CHARACTERS.rithy.name, lang).toUpperCase();
    const naming = wordsOf({ lang, menu }).filter((word) => word.toUpperCase().includes(partner));

    expect(naming, `${kind} ${lang}`).toHaveLength(1);
  });

  it.each(['en', 'km'])('heads it with what each of the two pays, in %s', (lang) => {
    const shares = `${numberIn(36, lang)} + ${numberIn(24, lang)}`;

    expect(wordsOf({ lang, menu }), `${kind} ${lang}`).toContain(shares);
  });
});
