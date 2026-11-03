import { describe, expect, it } from 'vitest';
import { arrangeView } from '../../../../../packages/screen/src/stage-fit.js';
import { outlineOf } from '../../../../../packages/touch-pad/src/pad-room.js';
import { VIEW } from '../../../src/config.js';
import { DRILL_IDS, DRILLS } from '../../../src/data/training.js';
import { PITCH_SIDE } from '../../../src/data/skins/pitch-side.js';
import { BADGE } from '../../../src/render/training/hud.js';
import { drillKeys } from '../../../src/render/training/touch-keys.js';
import { createDrill } from '../../../src/training/index.js';
import { TARGETS } from '../../../src/training/target-shot/targets.js';

// On a phone the touch pad's pause key covered most of a drill's grade badge (84% of it on a
// 667 x 375 phone held sideways, 76% upright), and RUN, which does nothing in Target Shot, covered
// half its bottom right target
const PHONES = [
  { width: 667, height: 375, safe: { top: 0, right: 0, bottom: 0, left: 0 } },
  { width: 844, height: 390, safe: { top: 0, right: 47, bottom: 21, left: 47 } },
  { width: 932, height: 430, safe: { top: 0, right: 59, bottom: 21, left: 59 } },
  { width: 390, height: 844, safe: { top: 47, right: 0, bottom: 34, left: 0 } },
  { width: 360, height: 780, safe: { top: 24, right: 0, bottom: 0, left: 0 } },
  { width: 430, height: 932, safe: { top: 59, right: 0, bottom: 34, left: 0 } },
];

const TARGET_HALF = 36;

const overlaps = (one, other) =>
  one.left < other.right &&
  one.right > other.left &&
  one.top < other.bottom &&
  one.bottom > other.top;

// each key the phone shows, as a box in the canvas's own pixels
function keysOn(phone) {
  const portrait = phone.height > phone.width;
  const { rect } = arrangeView({
    ...phone,
    hinge: null,
    view: VIEW,
    controlsHeight: 250,
    frame: null,
  });
  const scale = rect.width / VIEW.width;
  const { safe } = phone;
  const layer = {
    left: safe.left,
    top: safe.top,
    width: phone.width - safe.left - safe.right,
    height: phone.height - safe.top - safe.bottom,
  };
  const toCanvas = (x, y) => ({ x: (x - rect.x) / scale, y: (y - rect.y) / scale });

  return PITCH_SIDE.layouts[portrait ? 'portrait' : 'landscape'].items
    .filter((item) => item.kind === 'button')
    .map((item) => {
      const { box } = outlineOf(item, layer, 1);
      const from = toCanvas(box.left, box.top);
      const to = toCanvas(box.right, box.bottom);

      return { item, box: { left: from.x, top: from.y, right: to.x, bottom: to.y } };
    });
}

const targetBoxes = () =>
  TARGETS.map(({ x, y }) => {
    const middle = { x: (192 + x / 2) * 2, y: (124 - y / 2) * 2 };

    return {
      left: middle.x - TARGET_HALF,
      right: middle.x + TARGET_HALF,
      top: middle.y - TARGET_HALF,
      bottom: middle.y + TARGET_HALF,
    };
  });

describe('a drill on a phone', () => {
  it.each(PHONES)('keeps the grade badge clear of the pause key, $width x $height', (phone) => {
    const badge = {
      left: BADGE.x,
      top: BADGE.y,
      right: BADGE.x + BADGE.size,
      bottom: BADGE.y + BADGE.height,
    };
    const pause = keysOn(phone).find(({ item }) => item.id === 'pause');

    expect(overlaps(badge, pause.box)).toBe(false);
  });

  it.each(PHONES)('shows no key of Target Shot over a target, $width x $height', (phone) => {
    const shown = drillKeys(Object.assign(createDrill('target-shot'), { phase: 'play' }));
    const keys = keysOn(phone).filter(({ item }) =>
      item.inputs.some((input) => shown.includes(input)),
    );

    for (const { box } of keys) {
      for (const target of targetBoxes()) {
        expect(overlaps(box, target)).toBe(false);
      }
    }
  });

  it.each(DRILL_IDS)(
    'shows the keys the how-to of %s names, and stands the rest aside',
    (drill) => {
      const shown = drillKeys(Object.assign(createDrill(drill), { phase: 'play' }));
      const named = DRILLS[drill].howTo.map((line) => line.en).join(' ');

      for (const [key, input] of [
        ['RUN', 'sprint'],
        ['SHOOT', 'shoot'],
        ['PASS', 'pass'],
      ]) {
        expect(shown.includes(input)).toBe(named.includes(key));
      }
    },
  );
});
