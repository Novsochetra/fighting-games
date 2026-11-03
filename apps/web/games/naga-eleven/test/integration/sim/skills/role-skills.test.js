import { describe, expect, it } from 'vitest';
import { MOVES } from '../../../../src/data/moves.js';
import { SKILL_RULES } from '../../../../src/data/skills.js';
import { SPIRIT } from '../../../../src/data/tuning.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { tick } from '../../../../src/sim/tick.js';

// a whole match the computer plays, each skill seen with the gauge of its player before and after
function playWatchingSkills(seed, options = {}) {
  const match = createMatch({ seed, ...options });
  const fired = [];
  let gauges = match.players.map((player) => player.spirit);

  while (match.phase !== 'over') {
    tick(match);

    for (const event of drainEvents(match).filter((each) => each.type === 'skill')) {
      fired.push({
        ...event,
        seed,
        tick: match.tick,
        before: gauges[event.player],
        after: match.players[event.player].spirit,
      });
    }

    gauges = match.players.map((player) => player.spirit);
  }

  return fired;
}

const SEEDS = [1, 2, 3];

describe('role skills in a whole match', () => {
  const fired = SEEDS.flatMap((seed) => playWatchingSkills(seed));

  it('fire on both sides, of every kind a plain side has', () => {
    const plays = new Set(fired.map((event) => MOVES[event.move].play));

    expect([...plays].sort()).toEqual(['block', 'cross', 'pass', 'save', 'shot']);
    expect(new Set(fired.map((event) => (event.player < 11 ? 0 : 1)))).toEqual(new Set([0, 1]));
  });

  // a save or a block fills the gauge a little in the tick the skill is paid in
  it('cost their spirit as they fire', () => {
    const mostGain = Math.max(...Object.values(SPIRIT.gain));

    for (const event of fired) {
      expect(event.before - event.after, event.move).toBeGreaterThanOrEqual(
        MOVES[event.move].cost - mostGain - 1,
      );
    }
  });

  it('come no sooner than the wait after a player’s last', () => {
    const last = {};

    for (const event of fired) {
      const key = `${event.seed}:${event.player}`;

      if (last[key] !== undefined) {
        expect(event.tick - last[key]).toBeGreaterThanOrEqual(SKILL_RULES.cooldown);
      }

      last[key] = event.tick;
    }
  });

  it('give a player none or a couple a match, not one each attack', () => {
    const perPlayer = {};

    for (const event of fired) {
      const key = `${event.seed}:${event.player}`;

      perPlayer[key] = (perPlayer[key] ?? 0) + 1;
    }

    const average =
      Object.values(perPlayer).reduce((sum, count) => sum + count, 0) / (22 * SEEDS.length);

    expect(average).toBeLessThan(2);
    expect(Math.max(...Object.values(perPlayer))).toBeLessThanOrEqual(6);
  });

  it('play none before the story brings them in', () => {
    expect(playWatchingSkills(1, { systems: { roleSkills: false } })).toEqual([]);
  });
});
