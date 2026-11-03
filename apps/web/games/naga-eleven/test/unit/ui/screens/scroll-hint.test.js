import { describe, expect, it } from 'vitest';
import { markScroll } from '../../../../src/ui/screens/scroll-hint.js';

function fakeScreen({ scrollTop = 0, scrollHeight, clientHeight }) {
  const classes = new Set();

  return {
    scrollTop,
    scrollHeight,
    clientHeight,
    classes,
    classList: { toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) },
  };
}

describe('the hint that a screen goes on below', () => {
  it('docks the buttons and points down on a screen taller than the phone', () => {
    const screen = fakeScreen({ scrollHeight: 711, clientHeight: 390 });

    markScroll(screen);

    expect([...screen.classes].sort()).toEqual(['has-more', 'is-scrollable']);
  });

  it('stops pointing down at the end, and keeps the dock', () => {
    const screen = fakeScreen({ scrollTop: 321, scrollHeight: 711, clientHeight: 390 });

    markScroll(screen);

    expect([...screen.classes]).toEqual(['is-scrollable']);
  });

  it('marks nothing on a screen that fits, or is a pixel over from rounding', () => {
    const fits = fakeScreen({ scrollHeight: 390, clientHeight: 390 });
    const rounded = fakeScreen({ scrollHeight: 391, clientHeight: 390 });

    markScroll(fits);
    markScroll(rounded);

    expect([...fits.classes, ...rounded.classes]).toEqual([]);
  });

  it('leaves a missing screen be', () => {
    expect(() => markScroll(null)).not.toThrow();
  });
});
