import { afterEach, describe, expect, it, vi } from 'vitest';
import { PAINTED_THEMES } from '../../../../src/art/painted-themes/index.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../../src/config.js';
import { createPainter } from '../../../../src/render/painter.js';
import { drawAmbientEffect } from '../../../../src/render/scene/ambient/index.js';
import { MARGIN } from '../../../../src/render/scene/ambient/motion.js';
import { createRecordingContext } from '../../../support/recording-canvas.js';
import {
  ALL_COLORS,
  SAMPLE_EFFECTS,
  drawnRects,
  recordAmbient,
  recordEffect,
  ticksUpTo,
} from './ambient-recorder.js';

const BUSY = { tick: 300, cameraX: 100 };
const CAMERAS = [0, 37, 500, 1290];

function isInsideMargin(rect) {
  return (
    rect.x >= -MARGIN &&
    rect.y >= -MARGIN &&
    rect.x + rect.width <= VIEW_WIDTH + MARGIN &&
    rect.y + rect.height <= VIEW_HEIGHT + MARGIN
  );
}

function alphaValues(log) {
  return log.filter((entry) => entry.startsWith('globalAlpha=')).map((entry) => +entry.slice(12));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each(Object.entries(SAMPLE_EFFECTS))('the %s effect', (_kind, effect) => {
  const otherPlane = effect.plane === 'back' ? 'front' : 'back';

  it('replays exactly the same canvas calls for the same tick and camera', () => {
    const first = recordEffect(effect, BUSY).log;
    expect(first.length).toBeGreaterThan(0);
    expect(recordEffect(effect, BUSY).log).toEqual(first);
  });

  it('moves when the tick changes', () => {
    const later = recordEffect(effect, { ...BUSY, tick: BUSY.tick + 7 }).log;
    expect(later).not.toEqual(recordEffect(effect, BUSY).log);
  });

  it('draws nothing on the other plane', () => {
    expect(recordEffect(effect, { ...BUSY, plane: otherPlane }).log).toEqual([]);
  });

  it('never calls Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    for (const tick of ticksUpTo(600, 50)) {
      recordEffect(effect, { tick, cameraX: tick });
    }
    expect(random).not.toHaveBeenCalled();
  });

  it('stays in the view and its margin, keeps alpha in range and leaves it at 1', () => {
    for (const tick of ticksUpTo(3000, 97)) {
      for (const cameraX of CAMERAS) {
        const { log, alpha } = recordEffect(effect, { tick, cameraX });
        expect(drawnRects(log).filter((rect) => !isInsideMargin(rect))).toEqual([]);
        expect(alphaValues(log).every((value) => value >= 0 && value <= 1)).toBe(true);
        expect(alpha).toBe(1);
      }
    }
  });

  it('keeps the number of rects modest', () => {
    for (const tick of ticksUpTo(3000, 211)) {
      const rects = drawnRects(recordEffect(effect, { tick, cameraX: tick }).log);
      expect(rects.length).toBeLessThan(200);
    }
  });
});

describe('drawAmbient', () => {
  const { mist, leaves } = SAMPLE_EFFECTS;

  it('draws only the effects of the plane it is asked for', () => {
    const both = [mist, leaves];
    expect(recordAmbient(both, { ...BUSY, plane: 'back' }).log).toEqual(
      recordEffect(mist, BUSY).log,
    );
    expect(recordAmbient(both, { ...BUSY, plane: 'front' }).log).toEqual(
      recordEffect(leaves, BUSY).log,
    );
  });

  it('draws nothing without effects, for an unknown kind or for a forest without the color', () => {
    const pineRidge = PAINTED_THEMES.pineRidge.ambient;
    expect(recordAmbient(undefined, BUSY).log).toEqual([]);
    expect(recordAmbient([{ kind: 'rain', plane: 'back' }], BUSY).log).toEqual([]);
    expect(recordEffect(leaves, { ...BUSY, colors: pineRidge }).log).toEqual([]);
  });
});

describe('drawAmbientEffect', () => {
  const { mist } = SAMPLE_EFFECTS;
  const drawOne = (effect, colors = ALL_COLORS) => {
    const { context, log } = createRecordingContext(null);
    drawAmbientEffect(createPainter(context), { effect, ...BUSY, colors });
    return log;
  };

  it('draws one effect just as the plane it lies on would, whatever its plane', () => {
    expect(drawOne(mist)).toEqual(recordEffect(mist, BUSY).log);
    expect(drawOne({ ...mist, plane: undefined })).toEqual(recordEffect(mist, BUSY).log);
  });

  it('skips an unknown kind and a kind without its color', () => {
    expect(drawOne({ kind: 'rain' })).toEqual([]);
    expect(drawOne(mist, {})).toEqual([]);
  });
});
