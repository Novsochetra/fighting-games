import { describe, expect, it } from 'vitest';
import { isQuickSecondTap } from '../../../src/ui/screen/gesture-guards.js';

describe('menu double-tap fix', () => {
  it('catches a quick second tap in the same spot', () => {
    expect(isQuickSecondTap({ distance: 3, sinceLastTap: 200 })).toBe(true);
  });

  it('leaves slow taps and swipes alone', () => {
    expect(isQuickSecondTap({ distance: 3, sinceLastTap: 500 })).toBe(false);
    expect(isQuickSecondTap({ distance: 40, sinceLastTap: 100 })).toBe(false);
  });
});
