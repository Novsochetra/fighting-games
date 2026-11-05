import { describe, expect, it } from 'vitest';
import {
  dragOffset,
  isOutside,
  pullOf,
  readIntent,
  shouldDismiss,
  trackVelocity,
} from '@/components/sheet/sheet-drag.js';

describe('dragOffset', () => {
  it('follows the finger down and never lifts the sheet above its place', () => {
    expect(dragOffset(400, 460)).toBe(60);
    expect(dragOffset(400, 380)).toBe(0);
  });
});

describe('pullOf', () => {
  it('is the share of the sheet pulled down, at most all of it', () => {
    expect(pullOf(150, 600)).toBe(0.25);
    expect(pullOf(900, 600)).toBe(1);
    expect(pullOf(50, 0)).toBe(0);
  });
});

describe('shouldDismiss', () => {
  it('dismisses past a third of the sheet, however slow', () => {
    expect(shouldDismiss({ offset: 210, height: 600, velocity: 0 })).toBe(true);
    expect(shouldDismiss({ offset: 190, height: 600, velocity: 0 })).toBe(false);
  });

  it('dismisses on a flick down, but not on a twitch', () => {
    expect(shouldDismiss({ offset: 60, height: 600, velocity: 0.9 })).toBe(true);
    expect(shouldDismiss({ offset: 10, height: 600, velocity: 0.9 })).toBe(false);
    expect(shouldDismiss({ offset: 60, height: 600, velocity: -0.9 })).toBe(false);
  });
});

describe('readIntent', () => {
  it('drags the sheet on a move down from its top', () => {
    expect(readIntent({ dx: 2, dy: 8, atTop: true })).toBe('drag');
  });

  it('leaves to the scroll a move up, a move sideways and a sheet scrolled down', () => {
    expect(readIntent({ dx: 0, dy: -8, atTop: true })).toBe('scroll');
    expect(readIntent({ dx: 12, dy: 4, atTop: true })).toBe('scroll');
    expect(readIntent({ dx: 0, dy: 8, atTop: false })).toBe('scroll');
  });

  it('waits while the finger has not moved', () => {
    expect(readIntent({ dx: 0, dy: 0, atTop: true })).toBe('undecided');
  });
});

describe('isOutside', () => {
  const rect = { left: 0, right: 390, top: 100, bottom: 700 };

  it('tells a point on the dimmed page from one on the sheet', () => {
    expect(isOutside(rect, { clientX: 200, clientY: 50 })).toBe(true);
    expect(isOutside(rect, { clientX: 200, clientY: 300 })).toBe(false);
  });
});

describe('trackVelocity', () => {
  it('measures pixels a millisecond since the last move', () => {
    const last = { y: 100, time: 1000, velocity: 0 };

    expect(trackVelocity(last, 120, 1016)).toEqual({ y: 120, time: 1016, velocity: 1.25 });
  });

  it('keeps the last speed when two moves come at once', () => {
    const last = { y: 100, time: 1000, velocity: 0.4 };

    expect(trackVelocity(last, 110, 1000).velocity).toBe(0.4);
  });
});
