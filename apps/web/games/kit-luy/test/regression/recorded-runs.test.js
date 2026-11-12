import { describe, expect, it } from 'vitest';
import { playRecorded } from '../support/bot.js';

// Each run is played by the same bot from the same seed, and must come out question for question,
// event for event as it was recorded. A change to the levels, the scoring or the clock changes
// these on purpose: record them again with `npm run test:regression -- -u` and read the diff.
const RUNS = {
  'every-sum': { seed: 2026, ops: ['add', 'sub', 'mul', 'div'], missEvery: 7, thinkMs: 900 },
  'quick-adder': { seed: 77, ops: ['add'], missEvery: 23, thinkMs: 300 },
  'careless-shopper': { seed: 1234, ops: ['sub', 'mul'], missEvery: 3, thinkMs: 1500 },
};

describe('recorded runs', () => {
  for (const [name, bot] of Object.entries(RUNS)) {
    it(`replays the ${name} run as it was recorded`, async () => {
      const recording = `${JSON.stringify(playRecorded(bot), null, 2)}\n`;

      await expect(recording).toMatchFileSnapshot(`./fixtures/run-${name}.json`);
    });
  }

  it('ends every recorded run, as the clock gives less back on each level', () => {
    for (const bot of Object.values(RUNS)) {
      const { result } = playRecorded(bot);

      expect(result.elapsed).toBeLessThan(15 * 60 * 1000);
      expect(result.correct).toBeGreaterThan(0);
    }
  });
});
