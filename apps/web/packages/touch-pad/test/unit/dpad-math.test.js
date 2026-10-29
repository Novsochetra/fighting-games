import { describe, expect, it } from 'vitest';
import { dpadDirections } from '../../src/dpad-math.js';

const pressed = (x, y) =>
  Object.entries(dpadDirections(x, y))
    .filter(([, on]) => on)
    .map(([direction]) => direction);

describe('the d-pad', () => {
  it('presses nothing in its middle third', () => {
    expect(pressed(0, 0)).toEqual([]);
    expect(pressed(0.3, -0.3)).toEqual([]);
  });

  it('presses the direction a thumb is on', () => {
    expect(pressed(0, -0.8)).toEqual(['up']);
    expect(pressed(0.8, 0)).toEqual(['right']);
    expect(pressed(0, 0.8)).toEqual(['down']);
    expect(pressed(-0.8, 0.1)).toEqual(['left']);
  });

  it('presses both directions of a corner', () => {
    expect(pressed(0.7, -0.7)).toEqual(['up', 'right']);
    expect(pressed(-0.7, 0.7)).toEqual(['down', 'left']);
  });

  it('keeps pressing a way for a thumb that slid off that edge', () => {
    expect(pressed(1.6, 0)).toEqual(['right']);
  });
});
