import { describe, expect, it } from 'vitest';
import { hingeOf, readHinge } from '../../../src/ui/screen/viewport-segments.js';

const rect = (x, y, width, height) => ({ x, y, width, height });

describe('viewport segments', () => {
  it('lays out as one screen where the browser reports no segments', () => {
    expect(readHinge({})).toBeNull();
    expect(readHinge({ viewport: {} })).toBeNull();
  });

  it('lays out as one screen while the phone lies flat', () => {
    expect(readHinge({ viewport: { segments: [rect(0, 0, 884, 1104)] } })).toBeNull();
  });

  it('gives the game the top half of a phone folded like a laptop', () => {
    const segments = [rect(0, 442, 1104, 442), rect(0, 0, 1104, 442)];

    expect(readHinge({ viewport: { segments } })).toEqual({
      stacked: true,
      game: rect(0, 0, 1104, 442),
      controls: rect(0, 442, 1104, 442),
    });
  });

  it('gives the game the left screen of a Surface Duo held like a book', () => {
    const segments = [rect(574, 0, 540, 720), rect(0, 0, 540, 720)];

    expect(hingeOf(segments)).toMatchObject({ stacked: false, game: rect(0, 0, 540, 720) });
  });

  it('copies the segment, which the browser hands over as a DOMRect', () => {
    const segment = { ...rect(0, 0, 540, 720), top: 0, toJSON: () => ({}) };

    expect(hingeOf([segment, rect(574, 0, 540, 720)]).game).toEqual(rect(0, 0, 540, 720));
  });
});
