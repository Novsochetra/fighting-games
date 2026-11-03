import { describe, expect, it } from 'vitest';
import { VIEW } from '../../../src/config.js';
import { installCanvasTaps, viewPointOf } from '../../../src/input/canvas-taps.js';

describe('taps on the canvas', () => {
  it('land in the view’s own pixels at any size the canvas is shown', () => {
    const rect = { left: 100, top: 50, width: VIEW.width * 2, height: VIEW.height * 2 };

    expect(viewPointOf(rect, { clientX: 100, clientY: 50 })).toEqual({ x: 0, y: 0 });
    expect(viewPointOf(rect, { clientX: 100 + VIEW.width, clientY: 50 + VIEW.height })).toEqual({
      x: VIEW.width / 2,
      y: VIEW.height / 2,
    });
  });

  it('are handed to whoever listens', () => {
    const listeners = {};
    const canvas = {
      addEventListener: (type, listener) => {
        listeners[type] = listener;
      },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: VIEW.width, height: VIEW.height }),
    };
    const taps = [];

    installCanvasTaps(canvas, (point) => taps.push(point));
    listeners.pointerdown({ clientX: 10, clientY: 20 });

    expect(taps).toEqual([{ x: 10, y: 20 }]);
  });
});
