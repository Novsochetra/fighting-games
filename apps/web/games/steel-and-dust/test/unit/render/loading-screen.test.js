import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../src/art/colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../src/config.js';
import { drawLoadingScreen } from '../../../src/render/overlays/loading-screen.js';
import { createPainter } from '../../../src/render/painter.js';
import { textWidth } from '../../../src/render/text/draw-text.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

function drawFrames(count) {
  const view = { loadingFrames: 0 };
  return Array.from({ length: count }, () => {
    const { context, log } = createRecordingContext(null);
    drawLoadingScreen(createPainter(context), view);
    return log;
  });
}

// the label's own pixels, after its shadow; a dot is a single pixel of the 3x5 font
function labelPixels(log) {
  const start = log.lastIndexOf(`fillStyle=${COLORS.lilac}`);
  return log
    .slice(start + 1)
    .map((call) => call.slice('fillRect('.length, -1).split(',').map(Number));
}

describe('the loading screen', () => {
  const frames = drawFrames(81);

  it('covers the whole view in night and draws no sprite', () => {
    for (const log of [frames[0], frames[80]]) {
      expect(log.slice(0, 2)).toEqual([
        `fillStyle=${COLORS.night}`,
        `fillRect(0,0,${VIEW_WIDTH},${VIEW_HEIGHT})`,
      ]);
      expect(log.some((call) => call.startsWith('drawImage('))).toBe(false);
    }
  });

  it('adds a dot every 20 frames up to three, then starts over', () => {
    const word = labelPixels(frames[0]).length;
    const dots = [0, 20, 40, 60, 79, 80].map((frame) => labelPixels(frames[frame]).length - word);
    expect(dots).toEqual([0, 1, 2, 3, 3, 0]);
  });

  it('holds the word still in the middle of the view as the dots come and go', () => {
    const left = (log) => Math.min(...labelPixels(log).map(([x]) => x));
    for (const frame of [0, 20, 40, 60]) {
      expect(left(frames[frame])).toBe((VIEW_WIDTH - textWidth('LOADING...', 2)) / 2);
    }
    const ys = labelPixels(frames[0]).flatMap(([, y, , height]) => [y, y + height]);
    expect(Math.min(...ys) + Math.max(...ys)).toBe(VIEW_HEIGHT);
  });
});
