import { describe, expect, it } from 'vitest';
import { createGrid, fillRow } from '../../../../src/render/portraits/grid.js';
import { paintRuns, runsOf } from '../../../../src/render/portraits/runs.js';
import { createRecordingContext } from '../../../support/recording-context.js';

describe('portrait runs', () => {
  it('joins neighbouring cells of one colour into a run', () => {
    const grid = createGrid();

    fillRow(grid, { y: 2, from: 3, to: 6, letter: 'B' });
    fillRow(grid, { y: 2, from: 7, to: 7, letter: 'O' });

    expect(runsOf(grid, { cloth: '#111111', outline: '#000000' })).toEqual([
      { y: 2, from: 3, to: 6, colour: '#111111' },
      { y: 2, from: 7, to: 7, colour: '#000000' },
    ]);
  });

  it('draws each run at whole-pixel scale, mirrored inside the box when flipped', () => {
    const { context, calls } = createRecordingContext();
    const runs = [{ y: 1, from: 0, to: 1, colour: '#123456' }];

    paintRuns(context, runs, { x: 10, y: 20, unit: 2, flip: true });

    expect(calls.find((call) => call.name === 'fillRect').args).toEqual([10 + 62 * 2, 22, 4, 2]);
  });
});
