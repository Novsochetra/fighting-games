import { describe, expect, it } from 'vitest';
import { stairs, terrace } from '../../../src/data/missions/ground-shapes.js';

describe('temple steps', () => {
  const steps = [
    [10, 8],
    [10, 16],
    [40, 24],
  ];

  it('climb like stairs, run along the top and come back down the same steps', () => {
    expect(terrace(100, steps)).toEqual([
      [100, 0],
      [100, 8],
      [110, 8],
      [110, 16],
      [120, 16],
      [120, 24],
      [160, 24],
      [160, 16],
      [170, 16],
      [170, 8],
      [180, 8],
      [180, 0],
    ]);
  });

  it('start the same way stairs do and end back on the road', () => {
    const points = terrace(0, steps);
    expect(points.slice(0, 7)).toEqual(stairs(0, steps).slice(0, 7));
    expect(points.at(-1)).toEqual([80, 0]);
  });

  it('with a single step are a raised block', () => {
    expect(terrace(5, [[30, 6]])).toEqual([
      [5, 0],
      [5, 6],
      [35, 6],
      [35, 0],
    ]);
  });
});
