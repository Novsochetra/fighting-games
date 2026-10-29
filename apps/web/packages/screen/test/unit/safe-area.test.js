// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { createSafeArea } from '../../src/safe-area.js';

describe('the safe area', () => {
  it('reads the notch and home bar insets the browser gives a probe, as numbers', () => {
    const readSafeArea = createSafeArea(document, {
      getComputedStyle: () => ({
        paddingTop: '47px',
        paddingRight: '0px',
        paddingBottom: '34px',
        paddingLeft: '',
      }),
    });

    expect(readSafeArea()).toEqual({ top: 47, right: 0, bottom: 34, left: 0 });
  });

  it('measures each time, as a turn of the phone moves the notch', () => {
    const style = vi.fn(() => ({ paddingTop: '0px' }));
    const readSafeArea = createSafeArea(document, { getComputedStyle: style });

    readSafeArea();
    readSafeArea();

    expect(style).toHaveBeenCalledTimes(2);
  });
});
