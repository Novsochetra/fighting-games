import { describe, expect, it } from 'vitest';
import { playRecorded } from '../support/bot.js';

const ALL = ['add', 'sub', 'mul', 'div'];
const MOST_PLAY_MS = 12 * 60 * 1000;

const BOTS = {
  'careful-beginner': { seed: 11, ops: ALL, thinkMs: 4500, tapMs: 700, missEvery: 6 },
  'steady-player': { seed: 2026, ops: ALL, thinkMs: 2200, tapMs: 450, missEvery: 11 },
  // slow enough that some customers walk off unpaid
  'slow-number-pad': {
    seed: 31,
    ops: ALL,
    mode: 'keypad',
    thinkMs: 9500,
    tapMs: 450,
    missEvery: 3,
  },
  'fast-change-and-times': {
    seed: 7,
    ops: ['sub', 'mul'],
    thinkMs: 900,
    tapMs: 220,
    missEvery: 25,
  },
};

const lines = (list) => list.map((item) => `  ${JSON.stringify(item)}`).join(',\n');

// one question or event a line, so a change of rules shows as the lines it moved
const written = ({ result, asked, events }) =>
  [
    '{',
    ` "result": ${JSON.stringify(result)},`,
    ` "asked": [\n${lines(asked)}\n ],`,
    ` "events": [\n${lines(events)}\n ]`,
    '}\n',
  ].join('\n');

// The fixtures are whole days at the stall as the rules played them. Run
// `npm run test:regression -- -u` only when a change of rules or tuning is meant, and review the diff.
describe('recorded runs', () => {
  for (const [name, bot] of Object.entries(BOTS)) {
    it(`replays the ${name} run event for event`, async () => {
      await expect(written(playRecorded(bot))).toMatchFileSnapshot(`./fixtures/run-${name}.json`);
    });
  }

  it.each(Object.entries(BOTS))('closes the stall on the %s in good time', (_name, bot) => {
    const { result, events } = playRecorded(bot);

    expect(events[events.length - 1].type).toBe('closed');
    expect(result.elapsed).toBeLessThanOrEqual(MOST_PLAY_MS);
    expect(result.served).toBeGreaterThan(2);
  });

  // the bill the stall closed on may have been a miss not yet given
  it.each(Object.entries(BOTS))('makes every mistake the %s plans', (_name, bot) => {
    const { result } = playRecorded(bot);
    const planned = Math.floor(result.bills / bot.missEvery);

    expect(result.wrongs).toBeGreaterThanOrEqual(planned - 1);
    expect(result.wrongs).toBeLessThanOrEqual(planned);
  });
});
