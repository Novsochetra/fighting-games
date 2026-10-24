import { describe, expect, it } from 'vitest';
import {
  SLOT_SCALES,
  centerShift,
  circularOffset,
  isJump,
  slotFor,
} from '../../../src/home/carousel-layout.js';

describe('circularOffset', () => {
  it('places each card the shorter way round from the selected one', () => {
    const offsets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => circularOffset(index, 0, 10));
    expect(offsets).toEqual([0, 1, 2, 3, 4, 5, -4, -3, -2, -1]);
  });

  it('follows the selection around the loop', () => {
    expect(circularOffset(0, 9, 10)).toBe(1);
    expect(circularOffset(9, 0, 10)).toBe(-1);
    expect(circularOffset(4, 6, 10)).toBe(-2);
  });

  it('copes with one game, two games and none', () => {
    expect(circularOffset(0, 0, 1)).toBe(0);
    expect(circularOffset(1, 0, 2)).toBe(1);
    expect(circularOffset(0, 1, 2)).toBe(1);
    expect(circularOffset(0, 0, 0)).toBe(0);
  });
});

describe('centerShift', () => {
  it('puts each card beside the smaller ones in between, edge to edge before the gaps', () => {
    expect(centerShift(0)).toBe(0);
    expect(centerShift(1)).toBeCloseTo(0.5 + 0.4);
    expect(centerShift(2)).toBeCloseTo(0.5 + 0.8 + 0.32);
    expect(centerShift(3)).toBeCloseTo(0.5 + 0.8 + 0.64 + 0.25);
  });
});

describe('slotFor', () => {
  it('lifts the center card: full size, full brightness, on top and ringed', () => {
    expect(slotFor(0)).toMatchObject({
      distance: 0,
      shift: 0,
      scale: 1,
      dimming: 1,
      opacity: 1,
      depth: SLOT_SCALES.length,
      isCenter: true,
      isHidden: false,
    });
  });

  it('shrinks, dims and lowers cards by distance, on their own side', () => {
    const left = slotFor(-1);
    const right = slotFor(2);
    expect(left).toMatchObject({
      side: -1,
      scale: 0.8,
      dimming: 0.62,
      opacity: 1,
      isCenter: false,
    });
    expect(right).toMatchObject({ side: 1, scale: 0.64, dimming: 0.42, opacity: 0.8 });
    expect(left.depth).toBeGreaterThan(right.depth);
  });

  it('hides every card from the third on, stacked at the third place', () => {
    expect(slotFor(3)).toMatchObject({ distance: 3, opacity: 0, isHidden: true });
    expect(slotFor(-7)).toEqual({ ...slotFor(3), side: -1 });
  });
});

describe('isJump', () => {
  it('spots a card that crosses to the other side of the loop', () => {
    expect(isJump(-1, 1)).toBe(true);
    expect(isJump(5, -4)).toBe(true);
  });

  it('lets a card slide one place, and has no jump on the first layout', () => {
    expect(isJump(1, 0)).toBe(false);
    expect(isJump(0, -1)).toBe(false);
    expect(isJump(undefined, 3)).toBe(false);
  });
});
