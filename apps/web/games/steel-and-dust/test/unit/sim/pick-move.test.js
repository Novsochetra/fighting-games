import { describe, expect, it } from 'vitest';
import { pickAirMove, pickGroundMove } from '../../../src/sim/brains/player/pick-move.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';

const moves = WEAPONS.fists.moves;
const buffer = (action, extra = {}) => ({
  action,
  up: false,
  down: false,
  upNew: false,
  downNew: false,
  ...extra,
});

describe('pickGroundMove', () => {
  it('opens with a jab or a heavy', () => {
    expect(pickGroundMove(buffer('light'), {}, null)).toBe('L1');
    expect(pickGroundMove(buffer('heavy'), {}, null)).toBe('K1');
  });

  it('follows the chain of the current move', () => {
    expect(pickGroundMove(buffer('light'), {}, moves.L1)).toBe('L2');
    expect(pickGroundMove(buffer('heavy'), {}, moves.L2)).toBe('LLK');
    expect(pickGroundMove(buffer('heavy'), {}, moves.K3)).toBeNull();
  });

  it('launches with up or down + heavy, unless already launching', () => {
    expect(pickGroundMove(buffer('heavy', { down: true }), {}, null)).toBe('UK');
    expect(pickGroundMove(buffer('heavy'), { up: true }, null)).toBe('UK');
    expect(pickGroundMove(buffer('heavy', { up: true }), {}, moves.UK)).toBeNull();
  });

  it('needs a fresh push of up or down inside a string', () => {
    expect(pickGroundMove(buffer('light', { down: true }), {}, null)).toBe('DL');
    expect(pickGroundMove(buffer('light', { down: true }), {}, moves.L1)).toBe('L2');
    expect(pickGroundMove(buffer('light', { down: true, downNew: true }), {}, moves.L1)).toBe('DL');
    expect(pickGroundMove(buffer('light', { up: true, upNew: true }), {}, moves.L2)).toBe('UL');
  });
});

describe('pickAirMove', () => {
  it('opens with an air attack', () => {
    expect(pickAirMove(buffer('light'), {}, null)).toBe('AL');
    expect(pickAirMove(buffer('heavy'), {}, null)).toBe('AK');
  });

  it('dives or pogos with down', () => {
    expect(pickAirMove(buffer('heavy'), { down: true }, null)).toBe('ADK');
    expect(pickAirMove(buffer('light', { down: true }), {}, null)).toBe('ADL');
    expect(pickAirMove(buffer('heavy', { down: true }), {}, moves.ADK)).toBeNull();
  });

  it('chains the air string', () => {
    expect(pickAirMove(buffer('light'), {}, moves.AL)).toBe('AL2');
    expect(pickAirMove(buffer('heavy'), {}, moves.AL2)).toBe('AK');
  });
});
