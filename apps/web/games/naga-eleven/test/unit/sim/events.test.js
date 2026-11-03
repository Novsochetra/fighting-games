import { describe, expect, it } from 'vitest';
import { drainEvents, pushEvent } from '../../../src/sim/events.js';

describe('the match’s events', () => {
  it('are handed over once and then gone', () => {
    const match = { events: [] };

    pushEvent(match, { type: 'pass', player: 3 });
    pushEvent(match, { type: 'shot', player: 3, power: 1, move: null });

    expect(drainEvents(match).map((event) => event.type)).toEqual(['pass', 'shot']);
    expect(drainEvents(match)).toEqual([]);
  });

  it('keep only the latest when nobody drains them', () => {
    const match = { events: [] };

    for (let i = 0; i < 1000; i += 1) {
      pushEvent(match, { type: 'pass', player: i });
    }

    expect(match.events.length).toBeLessThan(1000);
    expect(match.events.at(-1).player).toBe(999);
  });
});
