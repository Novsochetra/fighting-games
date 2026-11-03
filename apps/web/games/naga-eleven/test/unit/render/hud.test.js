import { describe, expect, it } from 'vitest';
import { halfOf, minuteText } from '../../../src/render/hud/clock.js';

describe('the match clock', () => {
  it('shows the football minute, as a broadcast does', () => {
    expect(minuteText({ minute: 0 })).toBe("0'");
    expect(minuteText({ minute: 34.7 })).toBe("34'");
    expect(minuteText({ minute: 90 })).toBe("90'");
    expect(minuteText({})).toBe("0'");
  });

  it('knows the half, the first until the second begins', () => {
    expect(halfOf({ half: 1 })).toBe(1);
    expect(halfOf({ half: 2 })).toBe(2);
    expect(halfOf({})).toBe(1);
  });
});
