import { createPainter } from '../../../../src/render/painter.js';
import { createRecordingContext } from '../../../support/recording-canvas.js';
import { drawnRects, ticksUpTo } from '../ambient/ambient-recorder.js';

export { drawnRects, ticksUpTo };

export const PAINTING = { recordingId: () => 'painting' };

// a recording painter: what one call to `draw` does to the canvas
export function record(draw) {
  const { context, log } = createRecordingContext(null);
  draw(createPainter(context));
  return { log, context };
}

// every drawImage of the painting as its source and destination boxes
export function drawnRows(log) {
  return log
    .filter((entry) => entry.startsWith('drawImage(painting,'))
    .map((entry) => {
      const [sx, sy, width, height, x, y] = entry.slice(19, -1).split(',').map(Number);
      return { sx, sy, width, height, x, y };
    });
}
