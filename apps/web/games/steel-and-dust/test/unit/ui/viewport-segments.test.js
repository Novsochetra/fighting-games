import { describe, expect, it, vi } from 'vitest';
import { hingeOf, onFoldChange, readHinge } from '../../../src/ui/screen/viewport-segments.js';

const rect = (x, y, width, height) => ({ x, y, width, height });
const FOLD = { width: 1104, height: 884 };
const DUO = { width: 1114, height: 720 };

describe('viewport segments', () => {
  it('lays out as one screen where the browser reports no segments, as Safari and Firefox', () => {
    expect(readHinge({}, FOLD)).toBeNull();
    expect(readHinge({ viewport: {} }, FOLD)).toBeNull();
    expect(readHinge({ viewport: { segments: null } }, FOLD)).toBeNull();
  });

  it('lays out as one screen while the phone lies flat', () => {
    expect(readHinge({ viewport: { segments: [rect(0, 0, 1104, 884)] } }, FOLD)).toBeNull();
  });

  it('gives the game the top half of a phone folded like a laptop', () => {
    const segments = [rect(0, 442, 1104, 442), rect(0, 0, 1104, 442)];

    expect(readHinge({ viewport: { segments } }, FOLD)).toEqual({
      stacked: true,
      game: rect(0, 0, 1104, 442),
      controls: rect(0, 442, 1104, 442),
    });
  });

  it('gives the game the left screen of a Surface Duo held like a book', () => {
    const segments = [rect(574, 0, 540, 720), rect(0, 0, 540, 720)];

    expect(hingeOf(segments, DUO)).toMatchObject({ stacked: false, game: rect(0, 0, 540, 720) });
  });

  it('copies the segment, which the browser hands over as a DOMRect', () => {
    const segment = { ...rect(0, 0, 540, 720), top: 0, toJSON: () => ({}) };

    expect(hingeOf([segment, rect(574, 0, 540, 720)], DUO).game).toEqual(rect(0, 0, 540, 720));
  });

  it('lets a segment round a pixel past the edge of the screen', () => {
    expect(hingeOf([rect(0, 0, 557, 720), rect(557, 0, 557.5, 720)], DUO)).not.toBeNull();
  });

  it('lays out as one screen when the segments are no boxes on the screen it measures', () => {
    const halves = (width, height) => [rect(0, 0, width, height), rect(width, 0, width, height)];

    expect(hingeOf(halves(700, 720), DUO)).toBeNull();
    expect(hingeOf(halves(540, 900), DUO)).toBeNull();
    expect(hingeOf([rect(0, 0, 0, 720), rect(0, 0, 1114, 720)], DUO)).toBeNull();
  });

  it('lays out as one screen when the segments overlap', () => {
    expect(hingeOf([rect(0, 0, 600, 720), rect(500, 0, 614, 720)], DUO)).toBeNull();
  });

  it('lays out as one screen for more than two segments', () => {
    const thirds = [rect(0, 0, 368, 720), rect(373, 0, 368, 720), rect(746, 0, 368, 720)];

    expect(readHinge({ viewport: { segments: thirds } }, DUO)).toBeNull();
  });
});

describe('a change of fold', () => {
  // Chrome's window: a posture, and a media query list per segment query
  function foldingWindow() {
    const lists = new Map();
    const matchMedia = (query) => {
      lists.set(query, lists.get(query) ?? new EventTarget());
      return lists.get(query);
    };

    return { navigator: { devicePosture: new EventTarget() }, matchMedia, lists };
  }

  it('calls back when the posture or the segments change', () => {
    const window = foldingWindow();
    const callback = vi.fn();

    onFoldChange(window, callback);
    window.navigator.devicePosture.dispatchEvent(new Event('change'));
    for (const list of window.lists.values()) {
      list.dispatchEvent(new Event('change'));
    }

    expect(window.lists.size).toBe(2);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('asks nothing of a browser that knows neither posture nor segments', () => {
    expect(() => onFoldChange({ navigator: {} }, vi.fn())).not.toThrow();
  });

  it('asks nothing of a media query list without addEventListener, as before Safari 14', () => {
    const oldList = { matches: false, addListener: vi.fn() };
    const window = { navigator: {}, matchMedia: () => oldList };

    expect(() => onFoldChange(window, vi.fn())).not.toThrow();
  });
});
