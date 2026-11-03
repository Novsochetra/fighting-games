import { afterEach, describe, expect, it } from 'vitest';

import { duelOptions } from '../../../../src/sim/duel/index.js';
import {
  ART,
  BAR,
  duelMenu,
  fitDuelMenu,
  MENU,
  PORTRAIT_ART,
  PORTRAITS,
  ROOMY_MENU,
  TAP_ROW,
  UNIT,
} from '../../../../src/render/duel/layout.js';
import {
  firstShown,
  hitTest,
  menuHeight,
  rowBox,
  stepMenu,
  VISIBLE_ROWS,
} from '../../../../src/render/duel/menu.js';
import { createDuelShow } from '../../../../src/render/duel/show.js';
import { fakeMatch, startMeeting } from '../../../support/duel-fixtures.js';

const MOVES = ['naga-shot', 'hanuman-leap', 'garuda-volley', 'power-shot'];

function menuShow(moves = MOVES) {
  const match = fakeMatch();

  Object.assign(match.players[3], { x: 860, y: 200 });
  startMeeting(match, { at: 850, attacker: { moves, spirit: 100 } });

  const show = createDuelShow(match);

  show.stage = 'menu';

  return { match, show };
}

const centreOf = (slot) => {
  const box = rowBox(slot);

  return { x: (box.x + box.width / 2) * UNIT, y: (box.y + box.height / 2) * UNIT };
};

describe('the duel menu', () => {
  it('moves the cursor round the options and picks with pass', () => {
    const { match, show } = menuShow();
    const options = duelOptions(match, 'attack');

    stepMenu(show, { pressed: { up: true } });

    expect(show.cursor).toBe(options.length - 1);

    stepMenu(show, { pressed: { down: true } });
    stepMenu(show, { pressed: { down: true } });

    expect(stepMenu(show, { pressed: { pass: true } })).toBe(true);
    expect(match.duel.rounds[0].picked.attack.id).toBe(options[1].id);
  });

  it('answers a tap on a row with that option, and nothing off the menu', () => {
    const { show } = menuShow();

    expect(hitTest(show, centreOf(1))).toEqual({ index: 1, id: 'pass' });
    expect(hitTest(show, { x: 4, y: 4 })).toBeNull();

    show.stage = 'versus';

    expect(hitTest(show, centreOf(1))).toBeNull();
  });

  it('scrolls a long list to keep the cursor in view, and taps follow the scroll', () => {
    const { match, show } = menuShow();
    const count = duelOptions(match, 'attack').length;

    expect(count).toBeGreaterThan(VISIBLE_ROWS);

    show.cursor = count - 1;

    expect(firstShown(show, count)).toBe(count - VISIBLE_ROWS);
    expect(hitTest(show, centreOf(VISIBLE_ROWS - 1)).index).toBe(count - 1);
  });

  it('picks the option a tap lands on at once', () => {
    const { match, show } = menuShow();

    expect(stepMenu(show, { tap: centreOf(0) })).toBe(true);
    expect(match.duel.rounds[0].picked.attack.id).toBe('dribble');
  });
});

describe.each([
  ['the duel menu box', MENU],
  ['the duel menu box a finger picks from', ROOMY_MENU],
])('%s', (_, menu) => {
  // the gold frame of each panel stands 2 canvas pixels outside it
  const FRAME = 2;

  it('stands clear of both name plates, frames and all', () => {
    const attackPlateRight = (PORTRAITS.attack.x - 1 + PORTRAIT_ART + 2) * UNIT + FRAME;
    const defendPlateLeft = (PORTRAITS.defend.x - 1) * UNIT - FRAME;

    expect(menu.x * UNIT - FRAME).toBeGreaterThan(attackPlateRight);
    expect((menu.x + menu.width) * UNIT + FRAME).toBeLessThan(defendPlateLeft);
  });

  it('stands its gold frame clear of the bottom bar, however many rows it holds', () => {
    expect(menu.y + menuHeight(20, menu) + FRAME / UNIT).toBeLessThanOrEqual(ART.height - BAR);
  });
});

// VS lands 4 art pixels a dot, 7 dots tall, its foot at this row (versus.js)
const VS_FOOT = 36 - 4 * 3.5 + 4 * 7;

describe('the duel menu a finger picks from', () => {
  afterEach(() => fitDuelMenu({ touch: false, stageHeight: 720 }));

  it('comes up on a touch screen whose stage shows the rows too small to tap', () => {
    fitDuelMenu({ touch: true, stageHeight: 375 });

    expect(duelMenu()).toBe(ROOMY_MENU);
    expect(rowBox(0).height).toBe(ROOMY_MENU.row);
  });

  it('stays the menu it was for a mouse, and for a finger on a big stage', () => {
    fitDuelMenu({ touch: false, stageHeight: 375 });

    expect(duelMenu()).toBe(MENU);

    fitDuelMenu({ touch: true, stageHeight: (TAP_ROW * ART.height) / MENU.row });

    expect(duelMenu()).toBe(MENU);
  });

  it('stands its rows at least a finger tall on a stage 320 px high', () => {
    expect((ROOMY_MENU.row * 320) / ART.height).toBeGreaterThanOrEqual(TAP_ROW);
  });

  it('stands under VS, its gold frame clear of it', () => {
    expect(ROOMY_MENU.y - 2).toBeGreaterThanOrEqual(VS_FOOT);
  });

  it('scrolls on a tap over or under its rows, and picks nothing on one', () => {
    fitDuelMenu({ touch: true, stageHeight: 375 });

    const { match, show } = menuShow();
    const rows = ROOMY_MENU.rows;

    show.cursor = 0;

    const under = rowBox(rows - 1);
    const tapUnder = { x: (under.x + 10) * UNIT, y: (under.y + under.height + 4) * UNIT };

    expect(hitTest(show, tapUnder)).toEqual({ scroll: 1 });
    expect(stepMenu(show, { tap: tapUnder })).toBe(false);
    expect(show.cursor).toBe(rows);
    expect(firstShown(show, duelOptions(match, 'attack').length)).toBeGreaterThan(0);
    expect(match.duel.rounds[0].picked.attack).toBeNull();

    const tapOver = { x: (ROOMY_MENU.x + 10) * UNIT, y: (ROOMY_MENU.y + 2) * UNIT };

    expect(hitTest(show, tapOver)).toEqual({ scroll: -1 });
  });

  it('answers no scroll where nothing more lies that way', () => {
    fitDuelMenu({ touch: true, stageHeight: 375 });

    const { show } = menuShow();
    const over = { x: (ROOMY_MENU.x + 10) * UNIT, y: (ROOMY_MENU.y + 2) * UNIT };

    show.cursor = 0;

    expect(hitTest(show, over)).toBeNull();
  });
});
