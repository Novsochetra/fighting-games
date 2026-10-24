import { describe, expect, it, vi } from 'vitest';
import {
  CORNER_SHARE,
  cornerSourceRect,
  sampleSplash,
  splashColors,
} from '../../../src/home/launch-splash.js';

const icon = (overrides = {}) => ({
  tagName: 'IMG',
  complete: true,
  naturalWidth: 500,
  naturalHeight: 500,
  ...overrides,
});

function fakeDocument(pixels) {
  const context = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: Uint8ClampedArray.from(pixels) })),
  };
  const canvas = { getContext: vi.fn(() => context) };
  return { document: { createElement: vi.fn(() => canvas) }, canvas, context };
}

describe('cornerSourceRect', () => {
  it('takes a fifth of the icon at each corner, past the artwork in its middle', () => {
    const size = { width: 500, height: 400 };
    expect(CORNER_SHARE).toBe(0.2);
    expect(cornerSourceRect(size, [0, 0])).toEqual([0, 0, 100, 80]);
    expect(cornerSourceRect(size, [1, 0])).toEqual([400, 0, 100, 80]);
    expect(cornerSourceRect(size, [0, 1])).toEqual([0, 320, 100, 80]);
    expect(cornerSourceRect(size, [1, 1])).toEqual([400, 320, 100, 80]);
  });
});

describe('splashColors', () => {
  it('averages the top corners and the bottom corners into a gradient', () => {
    const pixels = [10, 20, 30, 255, 30, 40, 50, 255, 200, 100, 0, 255, 100, 50, 1, 255];
    expect(splashColors(pixels)).toEqual({ top: 'rgb(20 30 40)', bottom: 'rgb(150 75 1)' });
  });
});

describe('sampleSplash', () => {
  it('draws each corner of the icon into one pixel and reads back the colors', () => {
    const pixels = [0, 0, 0, 255, 0, 0, 0, 255, 255, 128, 0, 255, 255, 128, 0, 255];
    const { document, canvas, context } = fakeDocument(pixels);
    expect(sampleSplash(document, icon())).toEqual({
      top: 'rgb(0 0 0)',
      bottom: 'rgb(255 128 0)',
    });
    expect(canvas).toMatchObject({ width: 2, height: 2 });
    expect(context.drawImage.mock.calls.map((call) => call.slice(1))).toEqual([
      [0, 0, 100, 100, 0, 0, 1, 1],
      [400, 0, 100, 100, 1, 0, 1, 1],
      [0, 400, 100, 100, 0, 1, 1, 1],
      [400, 400, 100, 100, 1, 1, 1, 1],
    ]);
  });

  it.each([
    ['no art', null],
    ['a monogram', { tagName: 'SPAN' }],
    ['a cover still loading', icon({ complete: false })],
    ['a cover that failed', icon({ naturalWidth: 0 })],
  ])('has no colors for %s, so the launch keeps the plain splash', (_, art) => {
    const { document, context } = fakeDocument([]);
    expect(sampleSplash(document, art)).toBeNull();
    expect(context.drawImage).not.toHaveBeenCalled();
  });

  it('has no colors where canvas is missing', () => {
    const document = { createElement: () => ({}) };
    expect(sampleSplash(document, icon())).toBeNull();
  });
});
