import { describe, expect, it } from 'vitest';
import { flightOver, legAt, pointOnLeg } from '../../../src/sim/summons/flight.js';

const FLIGHT = [
  [0, 0, 100],
  [10, 50, 60],
  [20, 100, 100],
];

describe('a flight of points', () => {
  it('moves along the leg it is on, in a straight line between its points', () => {
    expect(legAt(FLIGHT, 0)).toBe(0);
    expect(legAt(FLIGHT, 9)).toBe(0);
    expect(legAt(FLIGHT, 10)).toBe(1);
    expect(legAt(FLIGHT, 99)).toBe(1);
    expect(pointOnLeg(FLIGHT, 0, 5)).toEqual([25, 80]);
    expect(pointOnLeg(FLIGHT, 1, 15)).toEqual([75, 80]);
  });

  it('holds its last point and is over once the last tick comes', () => {
    expect(pointOnLeg(FLIGHT, 1, 40)).toEqual([100, 100]);
    expect(flightOver(FLIGHT, 19)).toBe(false);
    expect(flightOver(FLIGHT, 20)).toBe(true);
  });
});
