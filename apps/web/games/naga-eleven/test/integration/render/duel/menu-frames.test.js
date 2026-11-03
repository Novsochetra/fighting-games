import { describe, expect, it } from 'vitest';

import { BASIC_OPTIONS } from '../../../../src/data/duels.js';
import { MOVES } from '../../../../src/data/moves.js';
import { MENU, ROOMY_MENU, UNIT } from '../../../../src/render/duel/layout.js';
import { drawMenuOf } from '../../../../src/render/duel/menu-draw.js';
import { firstShown, rowBox, VISIBLE_ROWS } from '../../../../src/render/duel/menu.js';
import { openingCursor, rowFacts } from '../../../../src/render/duel/menu-rows.js';
import { createPen } from '../../../../src/render/duel/pen.js';
import { specialOption } from '../../../../src/sim/duel/options.js';
import { busyIn, strictContext } from './strict-context.js';

const basic = (id) => ({ ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0 });
const move = (id, extra = {}) => ({ ...specialOption(MOVES[id]), ...extra });

// a striker with every kind of row on offer, in the order the sim offers them
const ROWS = [
  basic('shoot'),
  move('twin-naga', { family: 'star', tag: 'duo', partner: 3, cost: 36, bonus: 8 }),
  move('flying-naga', { family: 'combo', tag: 'chain', bonus: 8 }),
  move('naga-shot', { family: 'star', tag: 'chain', from: 'apsara-curl', bonus: 8 }),
  move('mekong-current', { family: 'combo', tag: 'finisher' }),
  move('garuda-volley', { family: 'star', bonus: 4 }),
  move('seven-headed-naga', { family: 'star' }),
  move('kouprey-kick', { family: 'role' }),
];

const match = { players: Array.from({ length: 10 }, (_, i) => ({ name: `Player ${i}` })) };

function drawn(cursor, lang, menu = MENU) {
  const { canvas, context, bad } = strictContext();

  drawMenuOf(createPen(context, { unit: UNIT }), {
    options: ROWS,
    side: 'attack',
    cursor,
    match,
    lang,
    tick: 30,
    menu,
  });

  return { canvas, bad };
}

const rowArea = (slot, menu = MENU) => {
  const box = rowBox(slot, menu);

  return { x: box.x * UNIT, y: box.y * UNIT, width: box.width * UNIT, height: box.height * UNIT };
};

describe('the duel menu with every kind of row', () => {
  it('draws every row at every place of the scroll, in English and Khmer, with no NaN', () => {
    for (const lang of ['en', 'km']) {
      for (let cursor = 0; cursor < ROWS.length; cursor += 1) {
        const { canvas, bad } = drawn(cursor, lang);

        expect(bad, `${lang} ${cursor}`).toEqual([]);

        for (let slot = 0; slot < VISIBLE_ROWS; slot += 1) {
          expect(busyIn(canvas, rowArea(slot)), `${lang} ${cursor} ${slot}`).toBeGreaterThan(100);
        }
      }
    }
  });

  it('shows five rows at a time and scrolls the rest into view with the cursor', () => {
    expect(firstShown({ cursor: 0 }, ROWS.length)).toBe(0);
    expect(firstShown({ cursor: ROWS.length - 1 }, ROWS.length)).toBe(ROWS.length - VISIBLE_ROWS);

    const { canvas } = drawn(0, 'en');
    const below = {
      x: MENU.x * UNIT,
      y: rowArea(VISIBLE_ROWS).y,
      width: MENU.width * UNIT,
      height: 6,
    };

    expect(busyIn(canvas, below)).toBeLessThan(MENU.width * UNIT * 6);
  });

  it('opens on the strongest move, its tags and its price beside it', () => {
    const cursor = openingCursor(ROWS, { side: 'attack' });

    expect(ROWS[cursor].id).toBe('seven-headed-naga');
    expect(rowFacts(ROWS[1]).tags.map((tag) => tag.word)).toEqual(['bonus', 'duo']);
    expect(rowFacts(ROWS[4]).pays).toBe('free');
  });
});

describe('the duel menu a finger picks from, with every kind of row', () => {
  it('draws three tall rows at every place of the scroll, in English and Khmer, with no NaN', () => {
    for (const lang of ['en', 'km']) {
      for (let cursor = 0; cursor < ROWS.length; cursor += 1) {
        const { canvas, bad } = drawn(cursor, lang, ROOMY_MENU);

        expect(bad, `${lang} ${cursor}`).toEqual([]);

        for (let slot = 0; slot < ROOMY_MENU.rows; slot += 1) {
          const area = rowArea(slot, ROOMY_MENU);

          expect(busyIn(canvas, area), `${lang} ${cursor} ${slot}`).toBeGreaterThan(100);
        }
      }
    }
  });

  it('keeps each row’s picture and name in the middle of its band', () => {
    const { canvas } = drawn(0, 'en', ROOMY_MENU);
    const band = rowArea(1, ROOMY_MENU);
    const edge = (y) => ({ ...band, y, height: 3 * UNIT });

    expect(busyIn(canvas, edge(band.y))).toBeLessThan(busyIn(canvas, edge(band.y + 8 * UNIT)));
    expect(busyIn(canvas, edge(band.y + band.height - 3 * UNIT))).toBeLessThan(
      busyIn(canvas, edge(band.y + 8 * UNIT)),
    );
  });
});
