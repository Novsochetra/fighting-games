import { describe, expect, it } from 'vitest';
import { TAG_ART } from '../../../src/art/duel/icons.js';
import { DUEL_INK } from '../../../src/art/duel/palette.js';
import { CHARACTERS } from '../../../src/data/characters.js';
import { MOVES } from '../../../src/data/moves.js';
import { MENU, ROOMY_MENU, UNIT } from '../../../src/render/duel/layout.js';
import { drawMenuOf } from '../../../src/render/duel/menu-draw.js';
import { firstShown, rowBox } from '../../../src/render/duel/menu.js';
import { createPen } from '../../../src/render/duel/pen.js';
import { textOf } from '../../../src/render/text.js';
import { moveOption } from '../../../src/sim/combos/offers.js';
import { createRecordingContext } from '../../support/recording-context.js';

// The duel menu's tags ("+8", CHAIN) each had an ink frame, and two side by side ran into one
// black box that broke the lit row's purple band. And a duo's row showed its DUO tag but not its
// partner, whom the README promises on the row: only the head named him, and only while the row
// was lit. The tags sit on the row's own colour now, and a duo's names its partner.

const option = (id, extra) => moveOption(MOVES[id], extra);

const OPTIONS = [
  option('twin-naga', { cost: 36, partner: 1, partnerShare: 24, tag: 'duo' }),
  option('flying-naga', { tag: 'chain', from: 'hanuman-leap', bonus: 8 }),
  option('naga-shot', { id: 'chain:naga-shot', tag: 'chain', from: 'apsara-curl', bonus: 8 }),
  option('mekong-current', { tag: 'finisher', level: 3 }),
  option('garuda-volley', { bonus: 8 }),
];
const MATCH = { players: [{ name: CHARACTERS.sochetra.name }, { name: CHARACTERS.rithy.name }] };
const PLATE_BACKS = new Set(Object.values(TAG_ART).map((art) => art.back));
// an icon shares a plate's colours, but is drawn in art pixels; a plate stands 6 or 8 tall
const PLATE_LEAST = 6 * UNIT;
const MENUS = { normal: MENU, roomy: ROOMY_MENU };

// what the menu drew: each rect in canvas pixels with its colour, and each line of words
function drawnMenu({ cursor, lang, menu }) {
  const { context, calls } = createRecordingContext();
  const rects = [];
  const words = [];

  context.measureText = (text) => ({ width: [...text].length * 8 });
  drawMenuOf(createPen(context, { unit: UNIT }), {
    options: OPTIONS,
    side: 'attack',
    cursor,
    match: MATCH,
    lang,
    tick: 0,
    menu,
  });

  let colour = null;

  for (const { name, args } of calls) {
    if (name === 'fillStyle') {
      colour = args[0];
    } else if (name === 'fillRect') {
      rects.push({ colour, x: args[0], y: args[1], width: args[2], height: args[3] });
    } else if (name === 'fillText') {
      words.push({ text: args[0], x: args[1], y: args[2] });
    }
  }

  return { rects, words };
}

// a row's band on the canvas, by the option it shows
function bandOf(index, { cursor, menu }) {
  const box = rowBox(index - firstShown({ cursor }, OPTIONS.length, menu), menu);

  return { x: box.x * UNIT, y: box.y * UNIT, width: box.width * UNIT, height: box.height * UNIT };
}

const overlaps = (rect, area) =>
  rect.x < area.x + area.width &&
  rect.x + rect.width > area.x &&
  rect.y < area.y + area.height &&
  rect.y + rect.height > area.y;

// the tags of a row and one art pixel round them, as far as its band goes
function tagsOf(rects, band) {
  const plates = rects.filter(
    (rect) => PLATE_BACKS.has(rect.colour) && rect.height >= PLATE_LEAST && overlaps(rect, band),
  );
  const left = Math.min(...plates.map((plate) => plate.x)) - UNIT;
  const right = Math.max(...plates.map((plate) => plate.x + plate.width)) + UNIT;

  return { plates, around: { ...band, x: left, width: right - left } };
}

// the art pixels of an area left in ink once every rect is painted in turn, as a canvas shows them
function inkShownIn(rects, area) {
  const shown = new Map();

  for (const rect of rects.filter((each) => overlaps(each, area))) {
    for (let y = rect.y; y < rect.y + rect.height; y += UNIT) {
      for (let x = rect.x; x < rect.x + rect.width; x += UNIT) {
        shown.set(`${x}:${y}`, { x, y, width: UNIT, height: UNIT, colour: rect.colour });
      }
    }
  }

  return [...shown.values()].filter((cell) => cell.colour === DUEL_INK && overlaps(cell, area));
}

describe.each(Object.entries(MENUS))('the %s duel menu’s tags', (kind, menu) => {
  it.each(['en', 'km'])('sit on the row’s own colour, lit or not, in %s', (lang) => {
    for (const lit of [0, 1]) {
      const { rects } = drawnMenu({ cursor: lit, lang, menu });

      for (const index of [0, 1, 2]) {
        const band = bandOf(index, { cursor: lit, menu });
        const { plates, around } = tagsOf(rects, band);
        const ink = inkShownIn(rects, around);

        expect(plates.length, `${kind} ${lang} row ${index}`).toBeGreaterThan(0);
        expect(ink, `${kind} ${lang} row ${index}, row ${lit} lit`).toEqual([]);
      }
    }
  });

  it.each(['en', 'km'])('leave the lit band’s top and bottom edges whole, in %s', (lang) => {
    const { rects } = drawnMenu({ cursor: 1, lang, menu });
    const band = bandOf(1, { cursor: 1, menu });
    const edges = [
      { ...band, height: UNIT },
      { ...band, y: band.y + band.height - UNIT, height: UNIT },
    ];
    const { plates } = tagsOf(rects, band);

    expect(plates.filter((plate) => edges.some((edge) => overlaps(plate, edge)))).toEqual([]);
  });

  it.each(['en', 'km'])('name a duo’s partner on its row, lit or not, in %s', (lang) => {
    const partner = textOf(CHARACTERS.rithy.name, lang).toUpperCase();

    for (const cursor of [0, 1]) {
      const band = bandOf(0, { cursor, menu });
      const { words } = drawnMenu({ cursor, lang, menu });
      const onRow = words.filter(
        (word) => word.y >= band.y && word.y < band.y + band.height && word.x > band.x,
      );

      expect(
        onRow.some((word) => word.text.toUpperCase().includes(partner)),
        `${kind} ${lang} cursor ${cursor}`,
      ).toBe(true);
    }
  });
});
