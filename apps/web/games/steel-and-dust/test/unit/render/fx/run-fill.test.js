import { describe, expect, it } from 'vitest';
import { createRunFill } from '../../../../src/render/fx/run-fill.js';
import { drawnRects, recordingPainter } from './fx-recorder.js';

function filled(rects) {
  const { context, log } = recordingPainter();
  const fills = createRunFill(context);
  for (const [x, y, width, height] of rects) {
    fills.add(x, y, width, height);
  }
  fills.flush();
  return drawnRects(log).map(({ x, y, width, height }) => [x, y, width, height]);
}

describe('a run of fills', () => {
  it('joins rects carrying on along a row, either way', () => {
    expect(
      filled([
        [10, 5, 0.5, 2],
        [10.5, 5, 0.5, 2],
        [11, 5, 0.5, 2],
      ]),
    ).toEqual([[10, 5, 1.5, 2]]);
    expect(
      filled([
        [10, 5, 0.5, 2],
        [9.5, 5, 0.5, 2],
      ]),
    ).toEqual([[9.5, 5, 1, 2]]);
  });

  it('joins rects carrying on down a column, either way', () => {
    expect(
      filled([
        [4, 1, 3, 0.5],
        [4, 1.5, 3, 0.5],
        [4, 0.5, 3, 0.5],
      ]),
    ).toEqual([[4, 0.5, 3, 1.5]]);
    expect(
      filled([
        [4, 1, 3, 0.5],
        [4, 0.5, 3, 0.5],
      ]),
    ).toEqual([[4, 0.5, 3, 1]]);
  });

  it('starts a new fill where a rect steps off the run, and drops empty ones', () => {
    expect(
      filled([
        [0, 0, 0.5, 1],
        [0.5, 0.5, 0.5, 1],
        [1, 0.5, 0, 1],
        [1, 0.5, 0.5, 1],
      ]),
    ).toEqual([
      [0, 0, 0.5, 1],
      [0.5, 0.5, 1, 1],
    ]);
  });
});
