import { describe, expect, it } from 'vitest';
import { createInput } from '../../../src/sim/input/create-input.js';
import { ageBuffer, expireBuffer, readInput } from '../../../src/sim/input/read-input.js';

function gameAt(tickCount) {
  return { tickCount, input: createInput() };
}

describe('readInput', () => {
  it('buffers the latest press, so up and heavy together is a launcher', () => {
    const game = gameAt(10);
    Object.assign(game.input.pressed, { up: true, heavy: true });
    game.input.held.up = true;
    readInput(game);
    expect(game.input.buffer).toMatchObject({ action: 'heavy', up: true, ttl: 8 });
  });

  it('turns a double tap into a dash that way', () => {
    const game = gameAt(10);
    game.input.pressed.left = true;
    readInput(game);
    game.input.pressed.left = true;
    game.tickCount = 20;
    readInput(game);
    expect(game.input.buffer).toMatchObject({ action: 'dash', direction: -1 });
  });

  it('ignores two taps that are too far apart', () => {
    const game = gameAt(10);
    game.input.pressed.right = true;
    readInput(game);
    game.tickCount = 40;
    readInput(game);
    expect(game.input.buffer.action).toBeNull();
  });

  it('marks a fresh push of up', () => {
    const game = gameAt(10);
    game.input.held.up = true;
    readInput(game);
    game.tickCount = 15;
    game.input.pressed.light = true;
    readInput(game);
    expect(game.input.buffer.upNew).toBe(true);
  });

  it('forgets a buffered press after eight ticks', () => {
    const buffer = { action: 'light', ttl: 2 };
    expireBuffer(buffer);
    expect(buffer.action).toBe('light');
    expireBuffer(buffer);
    expect(buffer.action).toBeNull();
  });

  it('holds a press while the hero is frozen in a hit', () => {
    const game = { input: createInput(), player: { hitstop: 9 } };
    Object.assign(game.input.buffer, { action: 'light', ttl: 1 });

    ageBuffer(game);
    expect(game.input.buffer).toMatchObject({ action: 'light', ttl: 1 });
  });

  it('ages a press again once the hero can act', () => {
    const game = { input: createInput(), player: { hitstop: 0 } };
    Object.assign(game.input.buffer, { action: 'light', ttl: 1 });

    ageBuffer(game);
    expect(game.input.buffer.action).toBeNull();
  });
});
