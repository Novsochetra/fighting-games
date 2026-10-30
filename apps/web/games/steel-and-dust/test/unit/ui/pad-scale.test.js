import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BUTTON_SCALES } from '../../../src/data/settings.js';
import { layoutOf, SKINS } from '../../../src/data/skins/skins.js';
import { BEZEL, padScaleOf } from '../../../src/ui/screen/pad-scale.js';
import { outlinesOn, PHONES, tightestGap } from '../../support/control-room.js';

const KEYS = ['light', 'heavy', 'jump', 'dash', 'ult'];
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };
const [SMALL, MEDIUM, LARGE] = BUTTON_SCALES;

function scaleOn([width, height], { skin, buttonSize, keyShapes = {}, safe = NO_INSETS }) {
  const context = {
    elements: { app: { clientWidth: width, clientHeight: height } },
    game: { settings: { skin, buttonSize, keyShapes } },
    hingeNow: () => null,
  };

  return padScaleOf(context, safe);
}

const sizesOn = (phone, skin) =>
  [0, 1, 2].map((buttonSize) => scaleOn(phone, { skin, buttonSize }));

const MIXES = Array.from({ length: 2 ** KEYS.length }, (_, mix) =>
  Object.fromEntries(KEYS.filter((key, i) => mix & (1 << i)).map((key) => [key, 'pill'])),
);

const CASES = ['clear-jade', 'dusk'].flatMap((skin) =>
  Object.entries(PHONES).flatMap(([orientation, phones]) =>
    phones.flatMap((phone) =>
      [0, 1, 2].map((buttonSize) => ({ skin, orientation, phone, buttonSize })),
    ),
  ),
);

// held sideways a shell's panels either side of the game's bezel hold the controls: DASH and the
// d-pad the left one, the rest the right
function offTheBezel(outlines, { skin, orientation, phone: [width] }, scale) {
  const { screen } = SKINS[skin].layouts[orientation];

  if (!SKINS[skin].pills || orientation === 'portrait') {
    return true;
  }

  const leftEdge = (screen.left - BEZEL.side) * scale;
  const rightEdge = width - (screen.right - BEZEL.side) * scale;

  return outlines.every(({ id, box }) =>
    id === 'dash' || id === 'dpad' ? box.right <= leftEdge : box.left >= rightEdge,
  );
}

function expectRoomIn(place) {
  const { skin, orientation, phone, buttonSize } = place;
  const [width, height] = phone;
  const where = `${skin} ${phone} size ${buttonSize}`;

  for (const keyShapes of SKINS[skin].pills ? MIXES : [{}]) {
    const scale = scaleOn(phone, { skin, buttonSize, keyShapes });
    const outlines = outlinesOn(layoutOf(skin, orientation, keyShapes).items, phone, scale);
    const onScreen = outlines.every(
      ({ box }) => box.left >= 0 && box.top >= 0 && box.right <= width && box.bottom <= height,
    );

    expect(tightestGap(outlines), `${where} ${Object.keys(keyShapes)}`).toBeGreaterThanOrEqual(
      12 * scale - 0.01,
    );
    expect(onScreen && offTheBezel(outlines, place, scale), where).toBe(true);
  }
}

describe('the scale the touch controls are drawn at', () => {
  it('is the Button size picked for the classic controls, which their own styles place', () => {
    expect(sizesOn([360, 740], 'classic')).toEqual(BUTTON_SCALES);
    expect(sizesOn([667, 375], 'classic')).toEqual(BUTTON_SCALES);
  });

  // Large grew a Clear skin's keys into each other on most phones: JUMP onto the d-pad held
  // upright, HEAVY into ULT held sideways
  it('keeps Small and Medium for a Clear skin, and grows Large only as far as a phone has room', () => {
    for (const phones of Object.values(PHONES)) {
      for (const phone of phones) {
        const [small, medium, large] = sizesOn(phone, 'clear-jade');

        expect([small, medium], `${phone}`).toEqual([SMALL, MEDIUM]);
        expect(large, `${phone}`).toBeGreaterThan(MEDIUM);
        expect(large, `${phone}`).toBeLessThanOrEqual(LARGE);
      }
    }

    expect(sizesOn([430, 932], 'clear-jade')[2]).toBe(LARGE);
    expect(sizesOn([932, 430], 'clear-jade')[2]).toBe(LARGE);
    expect(sizesOn([390, 844], 'clear-jade')[2]).toBeLessThan(LARGE);
  });

  it('is the same whichever keys are pills, so a key reshaped never resizes the others', () => {
    const allPills = Object.fromEntries(KEYS.map((key) => [key, 'pill']));

    expect(scaleOn([390, 844], { skin: 'clear-lotus', buttonSize: 2, keyShapes: allPills })).toBe(
      scaleOn([390, 844], { skin: 'clear-lotus', buttonSize: 2 }),
    );
  });

  // Dusk's d-pad stood on HEAVY and DASH on a small phone held upright, even at Medium
  it("gives Dusk's d-pad room from HEAVY and DASH on a small upright phone", () => {
    const [, medium, large] = sizesOn([360, 740], 'dusk');

    expect(medium).toBeLessThan(MEDIUM);
    expect(large).toBe(medium);
    expect(sizesOn([390, 844], 'dusk')[1]).toBe(MEDIUM);
  });

  it('measures the room inside the safe area, clear of a notch and the home bar held sideways', () => {
    const notch = { ...NO_INSETS, left: 47, right: 47, bottom: 21 };

    expect(scaleOn([844, 390], { skin: 'clear-jade', buttonSize: 2, safe: notch })).toBeLessThan(
      scaleOn([844, 390], { skin: 'clear-jade', buttonSize: 2 }),
    );
  });

  it('keeps every control apart, on the screen and off the bezel, in any mix of keys', () => {
    for (const place of CASES) {
      expectRoomIn(place);
    }
  });

  it("keeps the controls off the bezel a Clear skin's stylesheet draws", () => {
    const css = readFileSync(join(import.meta.dirname, '../../../styles/skin-clear.css'), 'utf8');

    expect(css).toContain(`--bezel: calc(${BEZEL.side}px * var(--btn));`);
    expect(css).toContain(`--bezel-chin: calc(var(--bezel) + ${BEZEL.name}px);`);
  });
});
