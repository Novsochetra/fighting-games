import { ICON_PALETTE, ICONS } from '../../art/duel/icons.js';
import { DUEL_UI } from '../../art/duel/palette.js';
import { drawText, measureText, textOf } from '../text.js';
import { drawGrid } from './grid.js';
import { duelMenu, MENU, toCanvas } from './layout.js';
import { detailOf } from './menu-detail.js';
import { firstShown, menuHeight, menuOptions, rowBox } from './menu.js';
import { drawRow } from './menu-row.js';
import { pendingSide } from './show.js';
import { panel } from './plates.js';

const HEADS = {
  attack: { en: 'YOUR MOVE', km: 'ជ្រើសរើសការវាយលុក' },
  defend: { en: 'STOP HIM', km: 'ជ្រើសរើសការការពារ' },
};

// a taller row (a finger's menu) keeps its picture and words in the middle of it
const contentOf = (box) => ({
  ...box,
  y: box.y + Math.floor((box.height - MENU.row) / 2),
  height: MENU.row,
});

// the lit row: a brighter band, and the cursor nodding beside it
function lightRow(pen, { box, tick }) {
  const [deep, mid, light] = DUEL_UI.rowLit;
  const bob = Math.round(Math.sin(tick / 5) * 1.5);

  pen.rect([box.x, box.y, box.width, box.height], mid);
  pen.rect([box.x, box.y, box.width, 1], light);
  pen.rect([box.x, box.y + box.height - 1, box.width, 1], deep);
  drawGrid(pen, {
    rows: ICONS.cursor,
    palette: ICON_PALETTE.special,
    x: box.x + 1 + bob,
    y: contentOf(box).y + 1,
  });
}

// the head: whose pick it is, and on its right what the lit row brings with it (the partner of a
// duo, the skill a chain starts from, the combo a finisher was built on)
function head(pen, { side, detail, lang, menu }) {
  const title = textOf(HEADS[side], lang);
  const size = measureText(pen.context, title, { size: 16 }) > toCanvas(menu.width / 2) ? 8 : 16;

  drawText(pen.context, title, {
    x: pen.origin.x + toCanvas(menu.x + 6),
    y: pen.origin.y + toCanvas(menu.y + 1) + (size === 16 ? 7 : 11),
    color: DUEL_UI.gold,
    shadow: DUEL_UI.shadow,
    size,
  });

  if (detail) {
    drawText(pen.context, detail, {
      x: pen.origin.x + toCanvas(menu.x + menu.width - 12),
      y: pen.origin.y + toCanvas(menu.y + 1) + 12,
      color: DUEL_UI.muted,
      shadow: DUEL_UI.shadow,
      align: 'right',
      size: 8,
    });
  }

  pen.rect([menu.x + 4, menu.y + menu.head - 2, menu.width - 8, 1], DUEL_UI.panelEdge[1]);
}

export function drawMenu(pen, show, { lang, tick }) {
  drawMenuOf(pen, {
    options: menuOptions(show),
    side: pendingSide(show),
    cursor: show.cursor,
    match: show.match,
    lang,
    tick,
  });
}

// a menu of these options for this side, the lit one at `cursor`, laid out as `menu` (layout.js)
export function drawMenuOf(pen, { options, side, cursor, match, lang, tick, menu = duelMenu() }) {
  if (options.length === 0) {
    return;
  }

  const first = firstShown({ cursor }, options.length, menu);
  const detail = detailOf(match, options[cursor], lang);
  const height = menuHeight(options.length, menu);

  panel(pen, { x: menu.x, y: menu.y, width: menu.width, height });
  head(pen, { side, detail, lang, menu });
  options.slice(first, first + menu.rows).forEach((option, slot) => {
    const box = rowBox(slot, menu);

    if (first + slot === cursor) {
      lightRow(pen, { box, tick });
    }

    drawRow(pen, { option, box: contentOf(box), lang, match });
  });
  moreMarks(pen, { first, count: options.length, tick, menu });
}

// a chevron of rows `widths` wide, each centred on the one column
function chevron(pen, { x, y, widths, color }) {
  widths.forEach((width, i) => pen.rect([x + 1 - (width - 1) / 2, y + i, width, 1], color));
}

// little arrows on the panel's edge when there are options above or below the ones shown
function moreMarks(pen, { first, count, tick, menu }) {
  const x = menu.x + menu.width - 8;
  const bob = Math.floor(tick / 8) % 2;
  const widths = menu.arrow;
  const color = DUEL_UI.gold;

  if (first > 0) {
    chevron(pen, { x, y: menu.y + 3 - bob, widths, color });
  }

  if (first + menu.rows < count) {
    const y = menu.y + menuHeight(count, menu) - 2 - widths.length + bob;

    chevron(pen, { x, y, widths: [...widths].reverse(), color });
  }
}
