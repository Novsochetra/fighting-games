import { describe, expect, it } from 'vitest';
import { PASS_COMBO } from '../../../../src/data/combos.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { tick } from '../../../../src/sim/tick.js';

// a whole match the computer plays, with what its combos did and the state between
function playWatchingCombos(seed, format) {
  const match = createMatch({ seed, format });
  const seen = { climbs: [], ends: [], highest: 0, afterRestart: [] };

  while (match.phase !== 'over') {
    tick(match);

    for (const event of drainEvents(match)) {
      if (event.type === 'combo') {
        seen.climbs.push(event);
      } else if (event.type === 'comboEnd') {
        seen.ends.push(event);
      } else if (event.type === 'out' || event.type === 'goal') {
        seen.afterRestart.push(match.combo);
      }
    }

    seen.highest = Math.max(seen.highest, match.combo?.level ?? 0);
  }

  return seen;
}

describe.each(['7', '11'])('pass combos in a whole %s a side match', (format) => {
  const seen = playWatchingCombos(3, format);

  it('climb from x2 on both sides and stop at the top', () => {
    expect(seen.climbs.length).toBeGreaterThan(4);
    expect(new Set(seen.climbs.map((event) => event.team))).toEqual(new Set([0, 1]));
    expect(seen.climbs.every((event) => event.level >= PASS_COMBO.showFrom)).toBe(true);
    expect(seen.highest).toBeLessThanOrEqual(PASS_COMBO.most);
    expect(seen.highest).toBeGreaterThanOrEqual(PASS_COMBO.finisherFrom);
  });

  it('break for each reason the contract gives, and are over at every restart', () => {
    const reasons = new Set(seen.ends.map((event) => event.reason));

    expect(reasons.has('lost')).toBe(true);
    expect(reasons.has('held')).toBe(true);
    expect(
      [...reasons].every((reason) => ['lost', 'held', 'restart', 'shot'].includes(reason)),
    ).toBe(true);
    expect(seen.afterRestart.every((combo) => combo === null)).toBe(true);
  });

  it('reach x3 a few times a side, not on every move', () => {
    const tall = seen.ends.filter((event) => event.level >= 3).length;

    expect(tall).toBeGreaterThanOrEqual(1);
    expect(tall).toBeLessThan(30);
  });
});
