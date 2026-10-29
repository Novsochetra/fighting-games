import { describe, expect, it } from 'vitest';
import { skinProblems } from '../../../../../packages/touch-pad/src/skin-check.js';
import { keyShapeOf, layoutOf, offersKeyShapes, SKINS } from '../../../src/data/skins/skins.js';

// what a touch control can give the fighter: a direction it holds, or a button's action
const INPUTS = new Set(['up', 'right', 'down', 'left', 'light', 'heavy', 'jump', 'dash', 'ult']);

const inputsOf = (item) => (Array.isArray(item.inputs) ? item.inputs : Object.values(item.inputs));

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

  it('offer pills for DASH and ULT alone, the same controls in a layout the pad can draw', () => {
    const offering = Object.values(SKINS).filter((skin) => offersKeyShapes(skin.id));

    expect(offering.map((skin) => skin.id)).toEqual(
      Object.keys(SKINS).filter((id) => id.startsWith('clear-')),
    );

    for (const skin of offering) {
      expect(skinProblems({ ...skin, layouts: skin.shapes.pill }), skin.id).toEqual([]);

      for (const [orientation, layout] of Object.entries(skin.shapes.pill)) {
        const pills = layout.items.filter((item) => (item.aspect ?? 1) !== 1);
        const ids = (items) => items.map((item) => item.id);

        expect(ids(pills).sort()).toEqual(['dash', 'ult']);
        expect(ids(layout.items)).toEqual(ids(skin.layouts[orientation].items));
      }
    }
  });

  it("look up a skin's layout in the shape picked, else round", () => {
    const clear = SKINS['clear-lotus'];

    expect(layoutOf('clear-lotus', 'portrait', 'pill')).toBe(clear.shapes.pill.portrait);
    expect(layoutOf('clear-lotus', 'portrait', 'round')).toBe(clear.layouts.portrait);
    expect(layoutOf('clear-lotus', 'landscape', 'square')).toBe(clear.layouts.landscape);
    expect(layoutOf('dusk', 'landscape', 'pill')).toBe(SKINS.dusk.layouts.landscape);
    expect([keyShapeOf({ keyShape: 'pill' }), keyShapeOf({}), keyShapeOf({ keyShape: 3 })]).toEqual(
      ['pill', 'round', 'round'],
    );
  });
});
