import { describe, expect, it } from 'vitest';
import { flightOver, legAt, pointOnLeg, progressOnLeg } from '../../../src/sim/summons/flight.js';

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

  it('arcs a leg into a point with a hop, highest halfway and back on the line at both ends', () => {
    const hops = [
      [0, 0, 100],
      [20, 100, 100, 40],
    ];
    expect(pointOnLeg(hops, 0, 0)).toEqual([0, 100]);
    expect(pointOnLeg(hops, 0, 5)).toEqual([25, 70]);
    expect(pointOnLeg(hops, 0, 10)).toEqual([50, 60]);
    expect(pointOnLeg(hops, 0, 20)).toEqual([100, 100]);
  });

  it('says how far along its leg it is, from 0 to 1', () => {
    expect(progressOnLeg(FLIGHT, 0, 0)).toBe(0);
    expect(progressOnLeg(FLIGHT, 1, 15)).toBe(0.5);
    expect(progressOnLeg(FLIGHT, 1, 40)).toBe(1);
  });

  it('holds its last point and is over once the last tick comes', () => {
    expect(pointOnLeg(FLIGHT, 1, 40)).toEqual([100, 100]);
    expect(flightOver(FLIGHT, 19)).toBe(false);
    expect(flightOver(FLIGHT, 20)).toBe(true);
  });
});
