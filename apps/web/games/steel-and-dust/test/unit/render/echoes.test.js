import { describe, expect, it } from 'vitest';
import { FX_COLORS } from '../../../src/art/fx-colors.js';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { echoFrame, echoLook } from '../../../src/render/fx/echoes.js';

const echoAt = (time, wakeAt = null) => ({
  sprite: ['thrust', 3, 1],
  strikeAt: POUNDING_LION.echoDelay,
  wakeAt,
  time,
});

describe("an echo's frames", () => {
  it('holds the blow it was left with, in the row it was struck in', () => {
    expect(echoFrame(echoAt(1))).toEqual(['thrust', 3, 1]);
  });

  it('winds up on the frame before, then strikes again', () => {
    const { strikeAt } = echoAt(0);
    expect(echoFrame(echoAt(strikeAt - 1))).toEqual(['thrust', 2, 1]);
    expect(echoFrame(echoAt(strikeAt))).toEqual(['thrust', 3, 1]);
    expect(echoFrame(echoAt(strikeAt + 20))).toEqual(['thrust', 3, 1]);
  });
});

describe("an echo's look", () => {
  it('is see-through gold that keeps every line of him, and flickers', () => {
    const held = [1, 3].map((time) => echoLook(echoAt(time)));
    for (const look of held) {
      expect(look).toMatchObject({ rim: FX_COLORS.lionGold, relief: true });
      expect(look.alpha).toBeLessThan(0.8);
    }
    expect(held[0].alpha).not.toBe(held[1].alpha);
  });

  it('burns pale and solid as it strikes again and as it wakes', () => {
    const striking = echoLook(echoAt(echoAt(0).strikeAt));
    const waking = echoLook(echoAt(60, 58));
    for (const look of [striking, waking]) {
      expect(look).toMatchObject({ body: FX_COLORS.reliefRim, relief: false });
      expect(look.alpha).toBeGreaterThan(0.8);
    }
    expect(echoLook(echoAt(40, 58)).relief).toBe(true);
  });
});
