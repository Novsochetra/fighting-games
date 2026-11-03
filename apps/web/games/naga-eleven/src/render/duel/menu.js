import { chooseDuel, duelOptions } from '../../sim/duel/index.js';
import { ART, duelMenu, MENU, UNIT } from './layout.js';
import { openingCursor } from './menu-rows.js';
import { pendingSide, shownRound } from './show.js';

export const menuOptions = (show) => {
  const side = pendingSide(show);

  return side ? duelOptions(show.match, side) : [];
};

// at most this many rows show at once on a big stage; the list scrolls to keep the cursor in the
// middle
export const VISIBLE_ROWS = MENU.rows;

export const menuHeight = (count, menu = duelMenu()) =>
  menu.head + Math.min(count, menu.rows) * menu.row + 4;

export const firstShown = (show, count, menu = duelMenu()) =>
  Math.max(0, Math.min(show.cursor - Math.floor(menu.rows / 2), count - menu.rows));

export function rowBox(slot, menu = duelMenu()) {
  return {
    x: menu.x + 3,
    y: menu.y + menu.head + slot * menu.row,
    width: menu.width - 6,
    height: menu.row,
  };
}

const inside = (box, { x, y }) =>
  x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height;

// a tap over the rows shown, on the head and what stands above it, scrolls up, and one under them,
// down to the bottom bar, scrolls down: a finger has no up and down keys
function scrollOf({ first, count, menu }, at) {
  const bottom = menu.y + menu.head + Math.min(count, menu.rows) * menu.row;
  const up = { x: menu.x, y: menu.y - menu.head, width: menu.width, height: menu.head * 2 };
  const down = { x: menu.x, y: bottom, width: menu.width, height: ART.height - bottom };

  if (first > 0 && inside(up, at)) {
    return -1;
  }

  return first + menu.rows < count && inside(down, at) ? 1 : 0;
}

// what a tap lands on, in canvas pixels: an option (`index`), or a scroll of the list (`scroll`);
// null off the menu or when it is not open
export function hitTest(show, point) {
  if (show.stage !== 'menu') {
    return null;
  }

  const menu = duelMenu();
  const options = menuOptions(show);
  const count = options.length;
  const first = firstShown(show, count, menu);
  const at = { x: point.x / UNIT, y: point.y / UNIT };
  const slot = [...Array(Math.min(menu.rows, count)).keys()].find((i) =>
    inside(rowBox(i, menu), at),
  );

  if (slot !== undefined) {
    return { index: first + slot, id: options[first + slot].id };
  }

  const scroll = scrollOf({ first, count, menu }, at);

  return scroll ? { scroll } : null;
}

// a scroll lights the option just past the rows shown that way, and the list follows it
function scrolled(show, count, scroll) {
  const first = firstShown(show, count);

  return scroll < 0 ? first - 1 : Math.min(count - 1, first + duelMenu().rows);
}

// the menu opens with the cursor on the big move, so a quick PASS plays it
export function openMenu(show) {
  const side = pendingSide(show);

  show.cursor = openingCursor(menuOptions(show), {
    side,
    attack: side === 'defend' ? shownRound(show)?.picked.attack : null,
  });
}

function confirm(show, options, index) {
  const side = pendingSide(show);

  return chooseDuel(show.match, side, options[index].id);
}

// a tap scrolls the list, or lights and picks the option it lands on
function tapMenu(show, options, tapped) {
  if (tapped.scroll) {
    show.cursor = scrolled(show, options.length, tapped.scroll);

    return false;
  }

  show.cursor = tapped.index;

  return confirm(show, options, tapped.index);
}

function keyMenu(show, options, pressed) {
  const step = (pressed.down ? 1 : 0) - (pressed.up ? 1 : 0);

  show.cursor = (show.cursor + step + options.length) % options.length;

  return pressed.pass ? confirm(show, options, show.cursor) : false;
}

// up and down move the cursor round the options, pass (or a tap on one) picks it
export function stepMenu(show, input = {}) {
  const options = menuOptions(show);

  if (options.length === 0) {
    return false;
  }

  const tapped = input.tap ? hitTest(show, input.tap) : null;

  return tapped ? tapMenu(show, options, tapped) : keyMenu(show, options, input.pressed ?? {});
}
