// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../src/config.js';
import { ART, UNIT } from '../../../src/render/duel/layout.js';
import { hitTest, menuOptions, rowBox, stepMenu } from '../../../src/render/duel/menu.js';
import { createDuelShow } from '../../../src/render/duel/show.js';
import { fitStage } from '../../../src/ui/stage.js';
import { fakeMatch, startMeeting } from '../../support/duel-fixtures.js';

// On a phone held sideways (812 x 375) the duel menu's rows stood 26 CSS px tall, too small for a
// finger to land on one and not the next; and a finger, which has no up and down keys, could pick
// none of the options past the five the menu showed. A phone's rows now stand at least 44 px
// tall, and a tap over or under them scrolls the list.
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };
const PHONES = [
  [667, 375],
  [812, 375],
  [812, 330],
  [780, 360],
  [932, 430],
  [1024, 768],
];
const MOVES = ['naga-shot', 'hanuman-leap', 'garuda-volley', 'power-shot', 'seven-headed-naga'];

let canvas;

function fit(width, height, touchOn = true) {
  fitStage(
    { innerWidth: width, innerHeight: height, devicePixelRatio: 3 },
    { canvas, safe: NO_INSETS, touchOn },
  );

  return parseFloat(canvas.style.height);
}

function menuShow() {
  const match = fakeMatch();

  Object.assign(match.players[3], { x: 860, y: 200 });
  startMeeting(match, { at: 850, attacker: { moves: MOVES, spirit: 100 } });

  const show = createDuelShow(match);

  show.stage = 'menu';

  return { match, show };
}

const centreOf = (box, dy = box.height / 2) => ({
  x: (box.x + box.width / 2) * UNIT,
  y: (box.y + dy) * UNIT,
});

// the options a tap on each row shown would pick
function shownIndexes(show) {
  const indexes = [];

  for (let slot = 0; hitTest(show, centreOf(rowBox(slot)))?.index !== undefined; slot += 1) {
    indexes.push(hitTest(show, centreOf(rowBox(slot))).index);
  }

  return indexes;
}

// taps alone, as a finger has: over the rows or under them till the option shows, then on it
function pickByTaps(show, target) {
  for (let taps = 0; taps < 20; taps += 1) {
    const shown = shownIndexes(show);
    const slot = shown.indexOf(target);

    if (slot >= 0) {
      return stepMenu(show, { tap: centreOf(rowBox(slot)) });
    }

    const below = target > shown.at(-1);
    const edge = rowBox(below ? shown.length - 1 : 0);

    stepMenu(show, { tap: centreOf(edge, below ? edge.height + 4 : -4) });
  }

  return false;
}

beforeEach(() => {
  document.body.innerHTML = '<canvas id="pitch"></canvas>';
  canvas = Object.assign(document.getElementById('pitch'), WORLD_VIEW);
});

describe('the duel menu on a touch screen', () => {
  it.each(PHONES)('stands each row at least 44 CSS px tall, %i x %i', (width, height) => {
    const stageHeight = fit(width, height);

    expect((rowBox(0).height * stageHeight) / ART.height).toBeGreaterThanOrEqual(44);
  });

  it('lets a finger reach and pick every option, scrolling by taps alone', () => {
    fit(812, 375);

    const count = menuOptions(menuShow().show).length;

    expect(count).toBeGreaterThan(5);

    for (let target = 0; target < count; target += 1) {
      const { match, show } = menuShow();
      const wanted = menuOptions(show)[target].id;

      expect(pickByTaps(show, target), `option ${target}`).toBe(true);
      expect(match.duel.rounds[0].picked.attack.id).toBe(wanted);
    }
  });

  it('keeps the menu as it was for a mouse on a big screen', () => {
    fit(1280, 720, false);

    expect(rowBox(0).height).toBe(10);
  });
});
