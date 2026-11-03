import { describe, expect, it } from 'vitest';
import { PHASE_TICKS } from '../../../src/data/tuning.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { countDown, endHalf, halfTimeTick, minuteOf } from '../../../src/sim/halves.js';

describe('the clock of a match', () => {
  it('shows the football minute, to 90 in 11 v 11 and 40 in 7 v 7', () => {
    const eleven = createMatch({ seed: 1 });
    const seven = createMatch({ seed: 1, format: '7' });

    expect(minuteOf(eleven)).toBe(0);

    eleven.clock = eleven.halfTicks / 2;
    expect(minuteOf(eleven)).toBe(22);

    Object.assign(eleven, { half: 2, clock: 0 });
    expect(minuteOf(eleven)).toBe(90);

    Object.assign(seven, { half: 2, clock: 0 });
    expect(minuteOf(seven)).toBe(40);
  });

  it('runs down and blows for half time, then full time', () => {
    const match = createMatch({ seed: 1 });

    match.clock = 1;
    countDown(match);

    expect(match.phase).toBe('halfTime');
    expect(match.events.at(-1)).toEqual({ type: 'whistle', kind: 'halfTime', half: 1 });

    match.half = 2;
    endHalf(match);

    expect(match.phase).toBe('over');
    expect(match.events.at(-1)).toEqual({ type: 'whistle', kind: 'fullTime', half: 2 });
  });
});

describe('half time', () => {
  it('pauses, then the other side kicks off the second half on a full clock', () => {
    const match = createMatch({ seed: 1 });

    endHalf(match);
    match.clock = 0;

    for (let i = 0; i < PHASE_TICKS.halfTime; i += 1) {
      match.phaseTicks += 1;
      halfTimeTick(match);
    }

    expect(match).toMatchObject({ phase: 'kickoff', half: 2, kickoffTeam: 1 });
    expect(match.clock).toBe(match.halfTicks);
  });
});
