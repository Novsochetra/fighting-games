import { afterEach, describe, expect, it } from 'vitest';

import {
  applyValue,
  EDITABLE,
  editsOf,
  resetValue,
  shotsProblem,
  textOf,
} from '../../../../dev/camera-lab/src/shot-lists.js';
import { CINEMA } from '../../../../src/data/cinema.js';
import { CLASH_SHOTS } from '../../../../src/data/shots.js';
import { chaseFull } from '../../../../src/render/duel/chase/chase-length.js';

const KEYS = Object.keys(EDITABLE);

afterEach(() => KEYS.forEach(resetValue));

describe("the camera lab's shot lists", () => {
  it.each(KEYS.filter((key) => !EDITABLE[key].timings))(
    "reads the game's own %s as right",
    (key) => {
      expect(shotsProblem(EDITABLE[key].value, EDITABLE[key].most)).toBeNull();
    },
  );

  it("lays a list that reads right into the game's own, and keeps it as a change", () => {
    const shots = [
      { from: 0, on: 'middle', step: 0 },
      { from: 30, on: 'impact', step: 3, glide: 8 },
    ];

    expect(applyValue('clash', shots)).toBeNull();
    expect(CLASH_SHOTS).toEqual(shots);
    expect(editsOf()).toEqual({ clash: shots });
  });

  it.each([
    ['no list', { from: 0 }],
    ['an empty list', []],
    [
      'a shot out of order',
      [
        { from: 10, on: 'middle', step: 0 },
        { from: 5, on: 'impact', step: 1 },
      ],
    ],
    ['a step the lens has not', [{ from: 0, on: 'middle', step: 4 }]],
    ['a glide of nothing', [{ from: 0, on: 'middle', step: 1, glide: 0 }]],
    ['no point to look at', [{ from: 0, step: 1 }]],
  ])('turns down %s and leaves the game as it was', (_, value) => {
    const before = JSON.stringify(CLASH_SHOTS);

    expect(applyValue('clash', value)).toEqual(expect.any(String));
    expect(JSON.stringify(CLASH_SHOTS)).toBe(before);
  });

  it("lets a save cam's outcome start at its contact, after 0", () => {
    expect(applyValue('saveCam.catch', [{ from: 40, on: 'gloves', step: 3 }])).toBeNull();
  });

  it('tunes the timings in place, so the game reads them at once', () => {
    const timings = JSON.parse(JSON.stringify(CINEMA));

    timings.chase.ticks = 64;

    expect(applyValue('cinema', timings)).toBeNull();
    expect(chaseFull()).toBe(64);
    expect(applyValue('cinema', { ...timings, clashFreeze: -1 })).toEqual(expect.any(String));
    expect(applyValue('cinema', { budget: {} })).toEqual(expect.any(String));
  });

  it('puts the file back on a reset', () => {
    applyValue('clash', [{ from: 0, on: 'middle', step: 2 }]);
    resetValue('clash');

    expect(editsOf()).toEqual({});
  });

  it('shows a list a shot a line', () => {
    const lines = textOf('clash').split('\n');

    expect(lines).toHaveLength(CLASH_SHOTS.length + 2);
    expect(JSON.parse(lines[1].replace(/,$/, ''))).toEqual(CLASH_SHOTS[0]);
  });
});
