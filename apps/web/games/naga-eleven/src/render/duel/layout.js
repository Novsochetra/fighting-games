// the cut-ins are laid out on a grid of art pixels three canvas pixels square: 256 by 144
export const UNIT = 3;
export const ART = { width: 256, height: 144 };
export const BAR = 14;

export const INNER = { top: BAR, bottom: ART.height - BAR };

export const CUTIN_BAND = { top: 34, height: 76 };

// the menu sits between the two name plates, its gold frame clear of theirs; `row` and `head` in
// art pixels, `rows` the most it shows at once, `arrow` the widths of the rows of its scroll arrows
export const MENU = { x: 73, y: 58, width: 110, row: 10, head: 12, rows: 5, arrow: [3, 5] };

// a finger picks from a phone's small stage: three rows tall enough to tap, the menu risen to just
// under VS and its foot just over the bottom bar, and arrows big enough to see it scrolls on a tap
export const ROOMY_MENU = { ...MENU, y: 52, row: 20, rows: 3, arrow: [3, 5, 7] };

// the least a row may be on the screen, in CSS px, for a finger to land on it and not the next
export const TAP_ROW = 44;

let roomy = false;

// the stage fit (src/ui/stage.js) says how tall the stage stands and whether a finger plays
export function fitDuelMenu({ touch, stageHeight }) {
  roomy = Boolean(touch) && (MENU.row * stageHeight) / ART.height < TAP_ROW;
}

export const duelMenu = () => (roomy ? ROOMY_MENU : MENU);

export const PORTRAIT_ART = 64;
export const PORTRAITS = { attack: { x: 6, y: 20 }, defend: { x: 186, y: 20 } };

export const toCanvas = (artValue) => artValue * UNIT;
