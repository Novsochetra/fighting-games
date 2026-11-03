import { describe, expect, it } from 'vitest';

import { frameRuns } from '../../../../../src/render/duel/clash/sprite-mask.js';
import { createPixelCanvas } from '../../../../support/pixel-canvas.js';

// a sheet of two frames 4 by 3: an L in the first, one dot in the second
function sheet() {
  const canvas = createPixelCanvas(8, 3);
  const context = canvas.getContext('2d');

  context.fillStyle = '#ff0000';
  context.fillRect(0, 0, 1, 3);
  context.fillRect(1, 2, 3, 1);
  context.fillRect(6, 1, 1, 1);

  return canvas;
}

describe('the runs of a frame of a sheet', () => {
  it('reads each row of painted pixels as runs from the frame corner', () => {
    const canvas = sheet();

    expect(frameRuns(canvas, { x: 0, y: 0, width: 4, height: 3 })).toEqual([
      [0, 0, 1],
      [0, 1, 1],
      [0, 2, 4],
    ]);
    expect(frameRuns(canvas, { x: 4, y: 0, width: 4, height: 3 })).toEqual([[2, 1, 1]]);
  });

  it('works a frame out once and keeps it', () => {
    const canvas = sheet();
    const box = { x: 0, y: 0, width: 4, height: 3 };

    expect(frameRuns(canvas, box)).toBe(frameRuns(canvas, box));
  });

  it('has nothing to read from an image that is no canvas', () => {
    expect(frameRuns({ width: 4, height: 3 }, { x: 0, y: 0, width: 4, height: 3 })).toBeNull();
  });
});
