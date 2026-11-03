import { HUD } from '../../art/hud.js';
import { SKILL_WORDS } from '../../data/skill-words.js';
import { drawText, khmerRoom, measureText, textOf } from '../text.js';
import { drawComboBurst, drawComboFlames } from './combo-flair.js';
import { PLATE_PAD, plateRect, readableRamp } from './combo-plate.js';
import { counterView } from './combo-view.js';
import { drawKeyCap, keyCapWidth } from './key-cap.js';
import { comboRect } from './layout.js';
import { drawPanel } from './panel.js';
import { drawLevel, levelWidth } from './pixel-digits.js';

const DIGITS = 22;
const BAR = { width: 44, height: 2 };
const SIDE_GAP = 4;
// the finisher's key and word stand clear of the number even as a climb pops it
const NUMBER_ROOM = levelWidth(4) + SIDE_GAP;
const FLAMES_FROM = 5;
// from the digits' ink outline to the foot of the hold bar's
const DRAWN_HEIGHT = DIGITS + 16;

const rampOf = (view, kit) =>
  ({ side: readableRamp(kit.shirt), gold: HUD.gold, grey: HUD.grey })[view.mode];

function wordsOf(view, lang) {
  const combo = textOf(SKILL_WORDS.combo, lang);
  const finisher = view.mode === 'gold' && view.live ? textOf(SKILL_WORDS.finisher, lang) : null;

  return { combo, finisher };
}

function widthOf(context, view, words) {
  const left = Math.max(levelWidth(view.cell), measureText(context, words.combo), BAR.width);

  if (!words.finisher) {
    return left;
  }

  const right = Math.max(keyCapWidth(context, 'SHOOT'), measureText(context, words.finisher));

  return NUMBER_ROOM + right;
}

function drawHoldBar(context, { x, y, view, ramp }) {
  context.fillStyle = HUD.ink;
  context.fillRect(x - 1, y - 1, BAR.width + 2, BAR.height + 2);
  context.fillStyle = HUD.inset;
  context.fillRect(x, y, BAR.width, BAR.height);
  context.fillStyle = ramp[3];
  context.fillRect(x, y, Math.round(BAR.width * view.hold), BAR.height);
}

// the steered side sees the key that strikes its finisher; the other side only that one is coming
function drawFinisher(context, { x, y, words, withKey }) {
  if (withKey) {
    drawKeyCap(context, { label: 'SHOOT', x, y: y + 1, ramp: HUD.ready });
  }

  drawText(context, words.finisher, {
    x,
    y: y + 15,
    color: HUD.gold[3],
    shadow: HUD.ink,
    size: 8,
  });
}

function drawCounter(context, { view, rect, ramp, words, tick }) {
  const x = rect.x + 1 + view.shake;
  const bottom = rect.y + DIGITS;
  const room = khmerRoom(words.combo);

  if (view.live && view.level >= FLAMES_FROM) {
    const top = bottom - 7 * view.cell;

    drawComboFlames(context, { x, top, width: levelWidth(view.cell), tick });
  }

  drawLevel(context, { level: view.level, x, bottom, cell: view.cell, ramp });
  drawText(context, words.combo, {
    x,
    y: bottom + 3 + room / 3,
    color: ramp[3],
    shadow: HUD.ink,
    size: 8,
  });
  drawHoldBar(context, { x, y: bottom + 13 + room, view, ramp });

  if (words.finisher) {
    drawFinisher(context, {
      x: x + NUMBER_ROOM,
      y: rect.y + 2,
      words,
      withKey: rect.side === 'left',
    });
  }

  if (view.burst !== null) {
    drawComboBurst(context, { x: x + levelWidth(3) / 2, y: bottom - 10, age: view.burst });
  }
}

// each side's combo counter from x2 (README "HUD") on its plate, the steered side's under the player
// card and the other's in the top right corner; `alphas` fade each while the ball passes under it
export function drawComboCounters(context, match, { effects, kits, lang, tick, alphas = [1, 1] }) {
  for (const team of [0, 1]) {
    const view = counterView(effects, match, team, tick);

    if (view && view.alpha > 0) {
      const words = wordsOf(view, lang);
      const box = comboRect(match, team);
      const drawn = {
        width: widthOf(context, view, words) + 2,
        height: DRAWN_HEIGHT + khmerRoom(words.combo),
      };
      const plate = plateRect(box, drawn);

      context.globalAlpha = view.alpha * (alphas[team] ?? 1);
      drawPanel(context, plate);
      drawCounter(context, {
        view,
        rect: { ...box, x: plate.x + PLATE_PAD.x, y: plate.y + PLATE_PAD.y },
        ramp: rampOf(view, kits[team].outfield),
        words,
        tick,
      });
      context.globalAlpha = 1;
    }
  }
}
