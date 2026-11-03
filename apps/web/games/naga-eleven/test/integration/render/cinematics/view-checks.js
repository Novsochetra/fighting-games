import { VIEW } from '../../../../src/config.js';
import { createRecordingContext } from '../../../support/recording-context.js';

// a recording context measures each letter 6 px wide at 8 px, as Silkscreen near enough does
export function recorder() {
  const recording = createRecordingContext();

  recording.context.measureText = (text) => ({
    width: [...text].length * 0.75 * Number(/(\d+)px/.exec(recording.context.font)?.[1] ?? 8),
  });

  return recording;
}

export const numbersOf = (calls) =>
  calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

export const fillRects = (calls) =>
  calls
    .filter((call) => call.name === 'fillRect')
    .map(({ args: [x, y, width, height] }) => ({ x, y, width, height }));

// every rect is on whole pixels, and lies in the view or no further out than `margin`
export function strays(calls, margin = 0) {
  return fillRects(calls).filter(
    ({ x, y, width, height }) =>
      ![x, y, width, height].every(Number.isInteger) ||
      x < -margin ||
      y < -margin ||
      x + width > VIEW.width + margin ||
      y + height > VIEW.height + margin,
  );
}

const hexAt = (data, at) =>
  `#${[0, 1, 2].map((i) => data[at + i].toString(16).padStart(2, '0')).join('')}`;

export function coloursOf(canvas) {
  const found = new Set();

  for (let at = 0; at < canvas.data.length; at += 4) {
    if (canvas.data[at + 3] > 0) {
      found.add(hexAt(canvas.data, at));
    }
  }

  return found;
}

export const alphaAt = (canvas, x, y) => canvas.data[(y * canvas.width + x) * 4 + 3];
