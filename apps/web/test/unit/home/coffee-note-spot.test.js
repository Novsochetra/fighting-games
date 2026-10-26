import { describe, expect, it } from 'vitest';
import { fitsBesideButton } from '../../../src/home/coffee-note-spot.js';

// A tall phone: the hero's buttons end at 728 and the coffee button at 912.
const tallPhone = { buttonBottom: 912, actionsBottom: 728, gap: 12 };

describe('fitsBesideButton', () => {
  it('fits a note that clears the hero buttons by the gap', () => {
    expect(fitsBesideButton({ ...tallPhone, noteHeight: 152 })).toBe(true);
    expect(fitsBesideButton({ ...tallPhone, noteHeight: 172 })).toBe(true);
  });

  it('does not fit a note that would come within the gap of the hero buttons', () => {
    expect(fitsBesideButton({ ...tallPhone, noteHeight: 173 })).toBe(false);
  });

  it('does not fit where the hero fills the screen and its buttons sit just above the coffee button', () => {
    expect(
      fitsBesideButton({ buttonBottom: 647, actionsBottom: 563, gap: 12, noteHeight: 152 }),
    ).toBe(false);
  });

  it('fits once the hero buttons have scrolled up out of the way', () => {
    expect(
      fitsBesideButton({ buttonBottom: 647, actionsBottom: -40, gap: 12, noteHeight: 152 }),
    ).toBe(true);
  });
});
