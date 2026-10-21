import { describe, expect, it } from 'vitest';
import { nextSlots, wrapOffset } from '../../../src/ui/heroes/carousel-slots.js';

const slotsOf = (placed) => placed.map((card) => card.slot);
const fromOf = (placed) => placed.map((card) => card.from);

describe('the hero carousel slots', () => {
  it('stands every card round the middle one, looping past the ends', () => {
    expect([0, 1, 2, 3, 4, 5].map((index) => wrapOffset(index, 0, 6))).toEqual([
      0, 1, 2, 3, -2, -1,
    ]);
    expect([0, 1, 2, 3, 4, 5].map((index) => wrapOffset(index, 5, 6))).toEqual([
      1, 2, 3, -2, -1, 0,
    ]);
  });

  it('places the cards without moving them when the list opens', () => {
    const placed = nextSlots(null, 2, 6);
    expect(slotsOf(placed)).toEqual([-2, -1, 0, 1, 2, 3]);
    expect(fromOf(placed)).toEqual([null, null, null, null, null, null]);
  });

  it('keeps the card that goes out of sight on the left on the left', () => {
    const placed = nextSlots([0, 1, 2, 3, -2, -1], 1, 6);
    expect(slotsOf(placed)).toEqual([-1, 0, 1, 2, -3, -2]);
    expect(fromOf(placed)).toEqual([null, null, null, null, null, null]);
  });

  it('brings a card that comes round the loop in from out of sight on its own side', () => {
    const placed = nextSlots([-1, 0, 1, 2, -3, -2], 2, 6);
    expect(slotsOf(placed)).toEqual([-2, -1, 0, 1, 2, -3]);
    expect(fromOf(placed)).toEqual([null, null, null, null, 3, null]);
  });

  it('turns the other way just as well', () => {
    const placed = nextSlots([0, 1, 2, 3, -2, -1], 5, 6);
    expect(slotsOf(placed)).toEqual([1, 2, 3, -2, -1, 0]);
    expect(fromOf(placed)).toEqual([null, null, null, -3, null, null]);
  });

  it('turns two places at once when a far card is picked', () => {
    const placed = nextSlots([0, 1, 2, 3, -2, -1], 2, 6);
    expect(slotsOf(placed)).toEqual([-2, -1, 0, 1, 2, -3]);
    expect(fromOf(placed)).toEqual([null, null, null, null, 4, null]);
  });

  it('leaves every card where it is when the middle does not change', () => {
    const placed = nextSlots([-1, 0, 1, 2, -3, -2], 1, 6);
    expect(slotsOf(placed)).toEqual([-1, 0, 1, 2, -3, -2]);
    expect(fromOf(placed)).toEqual([null, null, null, null, null, null]);
  });
});
