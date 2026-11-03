import { describe, expect, it } from 'vitest';
import { directionOf, rowFor } from '../../../../src/render/actors/directions.js';
import { FAKE_SPRITES } from '../../../support/fake-sprites.js';

describe('which of eight ways a player faces', () => {
  it('names the way of each facing, south toward the camera', () => {
    expect(directionOf({ x: 0, y: 1 })).toBe('south');
    expect(directionOf({ x: 1, y: 0 })).toBe('east');
    expect(directionOf({ x: 0, y: -1 })).toBe('north');
    expect(directionOf({ x: -1, y: 0 })).toBe('west');
    expect(directionOf({ x: 0.7, y: 0.7 })).toBe('south-east');
    expect(directionOf({ x: -0.7, y: -0.7 })).toBe('north-west');
  });

  it('leans into the next way only past half way to it', () => {
    expect(directionOf({ x: 1, y: 0.4 })).toBe('east');
    expect(directionOf({ x: 1, y: 0.43 })).toBe('south-east');
    expect(directionOf({ x: 0, y: 0 })).toBe('south');
  });
});

describe('the row of a sheet a way is drawn from', () => {
  const { idle, kick } = FAKE_SPRITES.animations;

  it('takes a drawn way as it is, and a mirrored one from the way it mirrors', () => {
    expect(rowFor(idle.rows, 'east')).toEqual({ row: 1, mirror: false, drawn: 'east' });
    expect(rowFor(idle.rows, 'west')).toEqual({ row: 1, mirror: true, drawn: 'east' });
  });

  it('stands in with the nearest way drawn for a way an animation lacks', () => {
    expect(rowFor(idle.rows, 'south-east').drawn).toMatch(/south|east/);
    expect(rowFor(kick.rows, 'north-east')).toEqual({ row: 0, mirror: false, drawn: 'east' });
  });

  it('mirrors a way drawn only for the other side', () => {
    expect(rowFor(kick.rows, 'west')).toEqual({ row: 0, mirror: true, drawn: 'east' });
    expect(rowFor(kick.rows, 'south-west')).toEqual({ row: 0, mirror: true, drawn: 'east' });
  });
});
