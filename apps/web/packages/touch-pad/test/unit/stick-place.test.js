import { describe, expect, it } from 'vitest';
import { customStickPlace } from '../../src/stick-place.js';

describe('a placed stick on the touch layer', () => {
  const screen = { width: 800, height: 400 };
  const place = (x, y, radius = 64) =>
    customStickPlace({ stick: { x, y, size: 1 }, layer: screen, radius });

  it('keeps the left half of the screen as its zone on the left', () => {
    expect(place(0.1, 0.75)).toEqual({ zone: { left: 0, width: 400 }, rest: { x: 80, y: 300 } });
  });

  it('takes the right half as its zone on the right, resting inside it', () => {
    expect(place(0.85, 0.7)).toEqual({ zone: { left: 400, width: 400 }, rest: { x: 280, y: 280 } });
  });

  it('widens the zone to reach past the rim of a stick near the middle', () => {
    expect(place(0.45, 0.5).zone).toEqual({ left: 0, width: 456 });
    const right = place(0.55, 0.5);
    expect(right.zone.left).toBeCloseTo(344);
    expect(right.zone.width).toBeCloseTo(456);
    expect(right.zone.left).toBeLessThan(440 - 64);
    expect(right.rest.x).toBeCloseTo(96);
  });

  it('keeps a stick that grew, or a screen that shrank, whole on the layer', () => {
    expect(place(1, 0, 96).rest).toEqual({ x: 304, y: 96 });
    expect(place(0, 1, 96)).toEqual({ zone: { left: 0, width: 400 }, rest: { x: 96, y: 304 } });
    expect(place(0.9, 0.5, 300).rest.y).toBe(200);
  });
});
