import { describe, expect, it } from 'vitest';
import { skinProblems } from '../../../../../packages/touch-pad/src/skin-check.js';
import { SKINS } from '../../../src/data/skins/skins.js';

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

  // a pill is for what runs the game (play, pause, settings); every button a skin draws is a move
  it('draw every move as a round key, never a pill', () => {
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
});
