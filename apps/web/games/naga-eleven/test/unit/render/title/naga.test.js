import { describe, expect, it } from 'vitest';
import { NAGA_EYES, NAGA_HEAD } from '../../../../src/art/title/naga-head.js';
import { headSpots, nagaEyes } from '../../../../src/render/title/naga.js';
import { titleLayout } from '../../../../src/render/title/title-scene.js';

describe('the great Naga', () => {
  it('has a head map of even rows, its eyes where the map has their light', () => {
    expect(new Set(NAGA_HEAD.map((row) => row.length)).size).toBe(1);
    NAGA_EYES.forEach((eye) => expect(NAGA_HEAD[eye.y][eye.x]).toBe('w'));
  });

  it('raises seven heads, mirrored about its middle, the middle one highest', () => {
    const spots = headSpots({ x: 192, y: 110 });

    expect(spots).toHaveLength(7);
    spots.forEach((spot, i) => {
      expect(spot.x - 192).toBe(192 - spots[6 - i].x);
      expect(spot.y).toBe(spots[6 - i].y);
    });
    expect(Math.min(...spots.map((spot) => spot.y))).toBe(spots[3].y);
  });

  it('keeps fourteen eyes inside the picture', () => {
    const layout = titleLayout({ width: 384, height: 216 });
    const eyes = nagaEyes({ x: layout.center, y: layout.heart });

    expect(eyes).toHaveLength(14);
    eyes.forEach((eye) => {
      expect(eye.x).toBeGreaterThanOrEqual(0);
      expect(eye.y).toBeGreaterThanOrEqual(0);
      expect(eye.x).toBeLessThan(384);
    });
  });

  it('lays a wider picture out about its own middle', () => {
    expect(titleLayout({ width: 400, height: 210 })).toMatchObject({ center: 200, horizon: 147 });
  });
});
