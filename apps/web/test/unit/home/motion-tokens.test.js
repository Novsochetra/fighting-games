import { describe, expect, it } from 'vitest';
import {
  parseDuration,
  prefersReducedMotion,
  readLaunchTiming,
} from '../../../src/home/motion-tokens.js';

const fakeDocument = (properties) => ({
  documentElement: {},
  defaultView: {
    getComputedStyle: () => ({ getPropertyValue: (name) => properties[name] ?? '' }),
  },
});

describe('parseDuration', () => {
  it.each([
    ['500ms', 500],
    [' 450ms ', 450],
    ['0.5s', 500],
    ['.25s', 250],
    ['0ms', 0],
  ])('reads %j as %i ms', (value, expected) => {
    expect(parseDuration(value)).toBe(expected);
  });

  it.each(['', 'fast', '-5ms', '5', undefined])('reads %j as no time at all', (value) => {
    expect(parseDuration(value)).toBe(0);
  });
});

describe('readLaunchTiming', () => {
  it('reads the launch duration and easing from the tokens', () => {
    const document = fakeDocument({
      '--duration-launch': ' 500ms',
      '--easing-launch': ' cubic-bezier(0.32, 0.72, 0, 1)',
    });
    expect(readLaunchTiming(document)).toEqual({
      duration: 500,
      easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    });
  });

  it('does not animate when the tokens did not load', () => {
    expect(readLaunchTiming(fakeDocument({}))).toEqual({ duration: 0, easing: 'linear' });
  });
});

describe('prefersReducedMotion', () => {
  it('follows the media query, and assumes motion is fine without matchMedia', () => {
    expect(prefersReducedMotion({ matchMedia: () => ({ matches: true }) })).toBe(true);
    expect(prefersReducedMotion({ matchMedia: () => ({ matches: false }) })).toBe(false);
    expect(prefersReducedMotion({})).toBe(false);
  });
});
