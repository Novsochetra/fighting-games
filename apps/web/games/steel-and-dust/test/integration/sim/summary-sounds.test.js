import { describe, expect, it } from 'vitest';
import { SUMMARY } from '../../../src/data/mission-summary.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// every sound the clear sends out, with the tick of the clear it went on
function clearWith(taken) {
  const heard = [];
  const io = {
    sfx: (key, big, options = {}) =>
      heard.push({ time: game.clearTime, mission: game.missionIndex, key, rate: options.rate }),
    announce: () => {},
  };
  const game = createTestGame({ io });
  selectMission(game, 0);
  startPlay(game);
  runTicks(game, 200);
  game.missionLoot = taken;
  heard.length = 0;
  stageClear(game);
  runTicks(game, 600);
  return heard.filter((sound) => sound.mission === 0);
}

const keysOf = (heard) => heard.map((sound) => sound.key);
const firstAt = (heard, key) => heard.find((sound) => sound.key === key)?.time;
const LOOT_KEYS = new Set(['tallyOpen', 'coin', 'gem', 'appleBite', 'clink', 'tallyTotal']);

describe('the sounds of the loot summary', () => {
  const heard = clearWith({ coin: 22, gem: 5, apple: 1 });
  const summary = heard.filter((sound) => LOOT_KEYS.has(sound.key));

  it('opens once the card has stamped in, and is over before the wipe rushes in', () => {
    const stamps = heard.filter((sound) => sound.key === 'stamp');
    expect(summary[0]).toMatchObject({ key: 'tallyOpen', time: SUMMARY.openAt });
    expect(summary[0].time).toBeGreaterThan(stamps.at(-1).time);
    expect(summary.at(-1).time).toBeLessThan(firstAt(heard, 'wipe'));
  });

  it('brings each kind in with the sound of taking it, coins, then gems, then the apple', () => {
    const arrivals = keysOf(summary).filter((key) => ['coin', 'gem', 'appleBite'].includes(key));
    expect(arrivals.slice(0, 3)).toEqual(['coin', 'gem', 'appleBite']);
  });

  it('ticks each count up a climbing scale, a step a piece up to a few', () => {
    const clinks = summary.filter((sound) => sound.key === 'clink');
    expect(clinks).toHaveLength(SUMMARY.maxSteps + 5 + 1);
    const coinRun = clinks.slice(0, SUMMARY.maxSteps).map((sound) => sound.rate);
    coinRun.slice(1).forEach((rate, i) => expect(rate).toBeGreaterThan(coinRun[i]));
  });

  it('rolls the take up in coins and lands it on one chord, last of all', () => {
    expect(keysOf(summary).filter((key) => key === 'tallyTotal')).toHaveLength(1);
    expect(summary.at(-1).key).toBe('tallyTotal');
  });

  it('brings in a kind the hero took none of with a dull clink, and no chord for nothing', () => {
    const empty = clearWith({ coin: 0, gem: 0, apple: 0 }).filter((sound) =>
      LOOT_KEYS.has(sound.key),
    );
    expect(keysOf(empty)).toEqual(['tallyOpen', 'clink', 'clink', 'clink']);
    expect(empty.slice(1).every((sound) => sound.rate < 1)).toBe(true);
  });
});
