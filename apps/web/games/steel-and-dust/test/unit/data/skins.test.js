import { describe, expect, it } from 'vitest';
import { skinProblems } from '../../../../../packages/touch-pad/src/skin-check.js';
import {
  keyShapesOf,
  layoutOf,
  pillsOffered,
  shapesOf,
  SKINS,
} from '../../../src/data/skins/skins.js';

// what a touch control can give the fighter: a direction it holds, or a button's action
const INPUTS = new Set(['up', 'right', 'down', 'left', 'light', 'heavy', 'jump', 'dash', 'ult']);

const KEYS = ['light', 'heavy', 'jump', 'dash', 'ult'];

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

  it('offer pills on every handheld, for every key of a Clear one, each layout one the pad draws', () => {
    const offering = Object.values(SKINS).filter((skin) => skin.pills);

    expect(offering.map((skin) => skin.id)).toEqual(
      Object.keys(SKINS).filter((id) => SKINS[id].layouts.landscape.shell),
    );
    expect(offering.map((skin) => skin.id)).toContain('sandstone');

    for (const skin of offering) {
      const pick = Object.fromEntries(KEYS.map((key) => [key, 'pill']));
      const layouts = Object.fromEntries(
        Object.keys(skin.layouts).map((orientation) => [
          orientation,
          layoutOf(skin.id, orientation, pick),
        ]),
      );

      expect(skinProblems({ ...skin, layouts }), skin.id).toEqual([]);

      const offered = skin.id.startsWith('clear-') ? KEYS : ['dash', 'ult'];

      for (const [orientation, layout] of Object.entries(layouts)) {
        const ids = (items) => items.map((item) => item.id);
        const pilled = layout.items.filter((item) => (item.aspect ?? 1) !== 1);

        expect(pillsOffered(skin.id, orientation).sort(), skin.id).toEqual([...offered].sort());
        expect(ids(pilled).sort()).toEqual([...offered].sort());
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

  it('list each control in every shape it may take, for the room a skin has', () => {
    const clear = shapesOf('clear-mekong', 'portrait');
    const kindsOf = (shapes) => shapes.map((item) => item.aspect ?? 1);

    expect(clear.map((shapes) => shapes[0].id)).toEqual(
      SKINS['clear-mekong'].layouts.portrait.items.map((item) => item.id),
    );
    expect(clear.find(([item]) => item.id === 'dpad')).toHaveLength(1);
    expect(kindsOf(clear.find(([item]) => item.id === 'light'))).toEqual([1, 0.44]);
    expect(shapesOf('dusk', 'landscape').every((shapes) => shapes.length === 1)).toBe(true);
  });
});
