import { describe, expect, it } from 'vitest';
import { createMatch } from '../../../src/sim/create-match.js';
import { tick } from '../../../src/sim/tick.js';

describe('a tick', () => {
  it('moves the match on, keeps the minute and forgets this tick’s presses', () => {
    const match = createMatch({ seed: 1 });

    match.input.pressed.pass = true;
    match.clock = match.halfTicks / 3;
    tick(match);

    expect(match.tick).toBe(1);
    expect(match.minute).toBe(30);
    expect(match.input.pressed).toEqual({});
  });
});
