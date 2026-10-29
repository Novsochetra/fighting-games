import { describe, expect, it } from 'vitest';
import { gapBetween, outlineOf, roomyScale } from '../../src/pad-room.js';

const LAYER = { left: 0, top: 0, width: 400, height: 800 };

const button = (id, at, size = 60, aspect) => ({
  id,
  kind: 'button',
  inputs: [id],
  at,
  size,
  ...(aspect && { aspect }),
});

describe('a control stood by its own place', () => {
  it('moves off its corner and grows with the scale, as the pad stands it', () => {
    const key = button('a', { x: 1, y: 1, dx: -50, dy: -100 });

    expect(outlineOf(key, LAYER, 1).box).toEqual({ left: 320, right: 380, top: 670, bottom: 730 });
    expect(outlineOf(key, LAYER, 1.2).box).toEqual({
      left: 304,
      right: 376,
      top: 644,
      bottom: 716,
    });
    expect(outlineOf(key, { ...LAYER, left: 20, top: 30 }, 1).box.left).toBe(340);
  });

  it('is a round key, a pill along its straight sides, or a square d-pad', () => {
    const pill = outlineOf(button('a', { x: 0, y: 0, dx: 100, dy: 100 }, 100, 0.4), LAYER, 1);
    const dpad = outlineOf(
      { id: 'd', kind: 'dpad', at: { x: 0, y: 0, dx: 100, dy: 100 } },
      LAYER,
      1,
    );

    expect([pill.radius, pill.sweep.left, pill.sweep.right]).toEqual([20, 70, 130]);
    expect([dpad.radius, dpad.sweep]).toEqual([0, dpad.box]);
    expect(dpad.box.right - dpad.box.left).toBe(64);
  });

  it('measures the room between two controls, or a control and a rect, less than 0 overlapping', () => {
    const left = outlineOf(button('a', { x: 0, y: 0, dx: 100, dy: 100 }), LAYER, 1);
    const right = outlineOf(button('b', { x: 0, y: 0, dx: 200, dy: 100 }), LAYER, 1);
    const near = outlineOf(button('c', { x: 0, y: 0, dx: 150, dy: 100 }), LAYER, 1);

    expect(gapBetween(left, right)).toBe(40);
    expect(gapBetween(left, near)).toBe(-10);
    expect(gapBetween(left, { left: 140, right: 200, top: 0, bottom: 300 })).toBe(10);
  });
});

describe('the scale a skin has room for', () => {
  // a key off the bottom-left corner and one off the top-left: they close in on each other as the
  // scale grows, the layer as tall as it was
  const apartUp = (dy) => [
    [button('low', { x: 0, y: 1, dx: 60, dy: -60 })],
    [button('high', { x: 0, y: 0, dx: 60, dy })],
  ];

  it('is the wanted one where the controls have room', () => {
    const variants = apartUp(60);

    expect(roomyScale({ variants, layer: LAYER, wanted: 1.2, floor: 0.8, gap: 12 })).toBe(1.2);
  });

  it('shrinks controls anchored to opposite edges until they keep the gap', () => {
    const layer = { ...LAYER, height: 200 };
    const scale = roomyScale({ variants: apartUp(60), layer, wanted: 1.2, floor: 0.8, gap: 12 });

    // 200 px tall, two 60 px keys 60 px in from either edge: 200 - 120k - 60k = 12k
    expect(scale).toBe(1.04);
  });

  it('keeps every shape a control may take clear, a pill as much as its round key', () => {
    const layer = { ...LAYER, height: 240 };
    const round = apartUp(60);
    const pill = button('low', { x: 0, y: 1, dx: 60, dy: -90 }, 100, 0.4);
    const pilled = [[...round[0], pill], round[1]];

    expect(roomyScale({ variants: round, layer, wanted: 1.2, floor: 0.8, gap: 12 })).toBe(1.2);
    // the pill stands higher: 240 - 90k - 20k - 60k - 30k = 12k
    expect(roomyScale({ variants: pilled, layer, wanted: 1.2, floor: 0.8, gap: 12 })).toBe(1.13);
  });

  it("keeps the controls whole on the layer and clear of what the game's screen needs", () => {
    const wide = [[button('a', { x: 1, y: 0.5, dx: -40 })]];
    const screen = (scale) => [{ left: 0, right: 300, top: 0, bottom: 400 + 150 * scale }];
    const low = [[button('b', { x: 0.5, y: 1, dy: -200 })]];

    expect(roomyScale({ variants: wide, layer: LAYER, wanted: 1.2, floor: 0.8, gap: 0 })).toBe(1.2);
    expect(
      roomyScale({
        variants: [[button('a', { x: 1, y: 0.5, dx: -20 })]],
        layer: LAYER,
        wanted: 1.2,
        floor: 0.8,
        gap: 0,
      }),
    ).toBe(0.8);
    // the key's top, 800 - 230k, meets the screen's bottom, 400 + 150k
    expect(
      roomyScale({ variants: low, layer: LAYER, keepOut: screen, wanted: 1.2, floor: 0.8, gap: 0 }),
    ).toBe(1.05);
  });

  it('leaves the scale alone for controls the game places itself, and stops at the floor', () => {
    const unplaced = [[{ id: 'a', kind: 'button', inputs: ['a'] }]];
    const crowded = [
      [button('a', { x: 0, y: 0, dx: 10, dy: 10 })],
      [button('b', { x: 0, y: 0, dx: 10, dy: 10 })],
    ];

    expect(roomyScale({ variants: unplaced, layer: LAYER, wanted: 1.2, floor: 0.8, gap: 12 })).toBe(
      1.2,
    );
    expect(roomyScale({ variants: crowded, layer: LAYER, wanted: 1.2, floor: 0.8, gap: 12 })).toBe(
      0.8,
    );
  });
});
