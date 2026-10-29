import { describe, expect, it } from 'vitest';
import { skinProblems } from '../../../../../packages/touch-pad/src/skin-check.js';
import { BUTTON_SCALES } from '../../../src/data/settings.js';
import { keyShapesOf, layoutOf, pillsOffered, SKINS } from '../../../src/data/skins/skins.js';

// what a touch control can give the fighter: a direction it holds, or a button's action
const INPUTS = new Set(['up', 'right', 'down', 'left', 'light', 'heavy', 'jump', 'dash', 'ult']);

const KEYS = ['light', 'heavy', 'jump', 'dash', 'ult'];

const inputsOf = (item) => (Array.isArray(item.inputs) ? item.inputs : Object.values(item.inputs));

// a control on a screen [width, height] at a Button size's scale, which grows the keys and their
// offsets from the screen's edges alike (the pad's CSS): a round key or a pill is the line its ends
// sweep along (none for a round key) and their radius; the d-pad is its square
function outlineOf(item, [width, height], scale) {
  const across = item.size * scale;
  const down = across * (item.aspect ?? 1);
  const x = item.at.x * width + item.at.dx * scale;
  const y = item.at.y * height + item.at.dy * scale;
  const radius = item.kind === 'dpad' ? 0 : Math.min(across, down) / 2;
  const box = {
    left: x - across / 2,
    right: x + across / 2,
    top: y - down / 2,
    bottom: y + down / 2,
  };
  const sweep =
    item.kind === 'dpad'
      ? box
      : { left: box.left + radius, right: box.right - radius, top: y, bottom: y };

  return { id: item.id, box, sweep, radius };
}

const apart = (low, high) => Math.max(0, low - high);

function gapBetween(first, second) {
  const across = Math.max(
    apart(first.sweep.left, second.sweep.right),
    apart(second.sweep.left, first.sweep.right),
  );
  const down = Math.max(
    apart(first.sweep.top, second.sweep.bottom),
    apart(second.sweep.top, first.sweep.bottom),
  );

  return Math.hypot(across, down) - first.radius - second.radius;
}

function tightestGap(shapes) {
  return Math.min(
    ...shapes.flatMap((shape, i) => shapes.slice(i + 1).map((other) => gapBetween(shape, other))),
  );
}

// the bezel round the game's screen (styles/skin-clear.css), which grows with Button size
const BEZEL = 12;

// held sideways the shell's panels either side of the game's bezel hold the controls: DASH and the
// d-pad the left one, the rest the right; upright the game stands above them all
function outside(shapes, { layout, orientation, scale }, [width, height]) {
  const panel = {
    left: [0, (layout.screen.left - BEZEL) * scale],
    right: [width - (layout.screen.right - BEZEL) * scale, width],
  };
  const sideOf = (id) => (id === 'dash' || id === 'dpad' ? 'left' : 'right');
  const inPanel = ({ id, box }) =>
    orientation === 'portrait' ||
    (box.left >= panel[sideOf(id)][0] && box.right <= panel[sideOf(id)][1]);
  const onScreen = ({ box }) =>
    box.left >= 0 && box.top >= 0 && box.right <= width && box.bottom <= height;

  return shapes.filter((shape) => !onScreen(shape) || !inPanel(shape)).map((shape) => shape.id);
}

function expectRoomFor({ layout, orientation, screen, where }) {
  const [small, medium, large] = BUTTON_SCALES;
  const round = SKINS['clear-jade'].layouts[orientation];
  const shapes = (items, scale) => items.map((item) => outlineOf(item, screen, scale));

  for (const scale of [small, medium]) {
    const placed = { layout, orientation, scale };

    expect(tightestGap(shapes(layout.items, scale)), where).toBeGreaterThan(12 * scale);
    expect(outside(shapes(layout.items, scale), placed, screen), where).toEqual([]);
  }

  expect(tightestGap(shapes(layout.items, large)), where).toBeGreaterThanOrEqual(
    Math.min(12 * large, tightestGap(shapes(round.items, large))) - 0.01,
  );
}

const PHONES = {
  landscape: [
    [667, 375],
    [740, 360],
    [844, 390],
    [932, 430],
  ],
  portrait: [
    [360, 740],
    [375, 667],
    [390, 844],
    [430, 932],
  ],
};

describe('the skins Steel & Dust ships', () => {
  it('are each a skin the touch pad can draw', () => {
    for (const [id, skin] of Object.entries(SKINS)) {
      expect(skin.id).toBe(id);
      expect(skinProblems(skin), id).toEqual([]);
    }
  });

  it('give only inputs the game knows', () => {
    for (const skin of Object.values(SKINS)) {
      for (const layout of Object.values(skin.layouts)) {
        for (const item of layout.items) {
          expect(
            inputsOf(item).filter((input) => !INPUTS.has(input)),
            item.id,
          ).toEqual([]);
        }
      }
    }
  });

  // a pill is for what runs the game (play, pause, settings), or a player's pick for the shoulder
  // keys; every button a skin draws is a move
  it('draw every move as a round key in their own layouts', () => {
    for (const skin of Object.values(SKINS)) {
      for (const layout of Object.values(skin.layouts)) {
        const pills = layout.items.filter((item) => (item.aspect ?? 1) !== 1);

        expect(
          pills.map((item) => `${skin.id} ${item.id}`),
          skin.id,
        ).toEqual([]);
      }
    }
  });

  it('offer a pill for every key of a Clear skin, each layout with them one the pad can draw', () => {
    const offering = Object.values(SKINS).filter((skin) => skin.pills);

    expect(offering.map((skin) => skin.id)).toEqual(
      Object.keys(SKINS).filter((id) => id.startsWith('clear-')),
    );

    for (const skin of offering) {
      const pick = Object.fromEntries(KEYS.map((key) => [key, 'pill']));
      const layouts = Object.fromEntries(
        Object.keys(skin.layouts).map((orientation) => [
          orientation,
          layoutOf(skin.id, orientation, pick),
        ]),
      );

      expect(skinProblems({ ...skin, layouts }), skin.id).toEqual([]);

      for (const [orientation, layout] of Object.entries(layouts)) {
        const ids = (items) => items.map((item) => item.id);
        const pilled = layout.items.filter((item) => (item.aspect ?? 1) !== 1);

        expect(pillsOffered(skin.id, orientation).sort(), skin.id).toEqual([...KEYS].sort());
        expect(ids(pilled).sort()).toEqual([...KEYS].sort());
        expect(ids(layout.items)).toEqual(ids(skin.layouts[orientation].items));
      }
    }
  });

  it("look up a skin's layout with a pill for each key picked that it offers one for", () => {
    const clear = SKINS['clear-lotus'];
    const dashOnly = layoutOf('clear-lotus', 'portrait', { dash: 'pill' });
    const shapeOf = (layout, id) => layout.items.find((item) => item.id === id).aspect ?? 1;

    expect([shapeOf(dashOnly, 'dash'), shapeOf(dashOnly, 'ult')]).toEqual([0.44, 1]);
    expect(layoutOf('clear-lotus', 'portrait', {})).toBe(clear.layouts.portrait);
    expect(layoutOf('clear-lotus', 'landscape', { dpad: 'pill' })).toBe(clear.layouts.landscape);
    expect(layoutOf('dusk', 'landscape', { dash: 'pill' })).toBe(SKINS.dusk.layouts.landscape);
    expect(pillsOffered('classic', 'landscape')).toEqual([]);
  });

  // the touch pad keeps the pad it drew for the same layout: a new one each fit drew the pad again
  // every time, letting go of every held key
  it('hand out the same layout for the same pick, every time', () => {
    const pick = { ult: 'pill' };

    expect(layoutOf('clear-ember', 'landscape', pick)).toBe(
      layoutOf('clear-ember', 'landscape', { ...pick }),
    );
    expect(keyShapesOf({ keyShapes: { dash: 'pill', ult: 'round', jump: 3 } })).toEqual({
      dash: 'pill',
    });
    expect([keyShapesOf({}), keyShapesOf({ keyShapes: null })]).toEqual([{}, {}]);
  });

  // any key of a Clear skin may be round or a pill on its own, so each of the 32 mixes is checked
  // on small and large phones: at Small and Medium no two controls come closer than a thumb tells
  // apart, nor leave the screen or, held sideways, their panel beside the game. Large crowds the
  // shell's round keys on its own on these phones, so there a pill only keeps from crowding them more
  it('keep every control clear of the others in any mix of round keys and pills', () => {
    for (const [orientation, screens] of Object.entries(PHONES)) {
      for (let mix = 0; mix < 2 ** KEYS.length; mix++) {
        const pick = Object.fromEntries(
          KEYS.filter((_, i) => mix & (1 << i)).map((key) => [key, 'pill']),
        );
        const layout = layoutOf('clear-jade', orientation, pick);

        for (const screen of screens) {
          expectRoomFor({ layout, orientation, screen, where: `${screen} ${Object.keys(pick)}` });
        }
      }
    }
  });
});
