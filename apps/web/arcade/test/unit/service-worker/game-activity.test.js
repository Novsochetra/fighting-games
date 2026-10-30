import { describe, expect, it } from 'vitest';
import { createGameActivity, QUIET_MS } from '@/service-worker/game-activity.js';

// a clock that moves on only as the activity waits, with a step a test may run at each wait
function startActivity(onWait = () => {}) {
  const clock = { now: 0, waits: [] };
  const activity = createGameActivity({
    now: () => clock.now,
    wait: async (ms) => {
      clock.waits.push(ms);
      clock.now += ms;
      onWait(activity, clock);
    },
  });

  return { activity, clock };
}

describe('createGameActivity', () => {
  it('lets a download go at once for a game that has asked for nothing', async () => {
    const { activity, clock } = startActivity();

    await activity.untilQuiet('steel-and-dust');

    expect(clock.waits).toEqual([]);
  });

  it('holds a download until the game has gone quiet for a while', async () => {
    const { activity, clock } = startActivity();

    activity.asked('steel-and-dust');
    clock.now = 500;
    await activity.untilQuiet('steel-and-dust');

    expect(clock.now).toBe(QUIET_MS);
  });

  it('holds it longer while the game goes on asking', async () => {
    const { activity, clock } = startActivity((running, time) => {
      if (time.waits.length === 1) {
        running.asked('steel-and-dust');
      }
    });

    activity.asked('steel-and-dust');
    await activity.untilQuiet('steel-and-dust');

    expect(clock.now).toBe(2 * QUIET_MS);
  });

  it('never holds one game’s download for another game’s files', async () => {
    const { activity, clock } = startActivity();

    activity.asked('another-game');
    await activity.untilQuiet('steel-and-dust');

    expect(clock.waits).toEqual([]);
  });
});
