import { describe, expect, it } from 'vitest';
import { CARD_STAGGER } from '../../../src/data/mission-handoff.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// every sound and call the game sends out, with the tick it went on
function listenedGame(missionIndex) {
  const heard = [];
  const io = {
    sfx: (key) => heard.push({ tick: game.tickCount, mission: game.missionIndex, key }),
    announce: (call) => heard.push({ tick: game.tickCount, mission: game.missionIndex, call }),
  };
  const game = createTestGame({ io });
  selectMission(game, missionIndex);
  startPlay(game);
  runTicks(game, 200);
  heard.length = 0;
  return { game, heard };
}

function clearAndWalkOn(missionIndex) {
  const { game, heard } = listenedGame(missionIndex);
  stageClear(game);
  runTicks(game, 600);
  return heard;
}

const ofMission = (heard, mission) => heard.filter((sound) => sound.mission === mission);
const stampTicks = (heard) =>
  heard.filter((sound) => sound.key === 'stamp').map((sound) => sound.tick);
const gaps = (ticks) => ticks.slice(1).map((tick, i) => tick - ticks[i]);

describe('the sounds of the hand-off between two missions', () => {
  const heard = clearAndWalkOn(0);
  const cleared = ofMission(heard, 0);
  const next = ofMission(heard, 1);

  it('calls the cleared mission as the boss falls, then stamps each letter of its card', () => {
    const calls = cleared.filter((sound) => sound.call);
    expect(calls.map((sound) => sound.call)).toEqual(['mission-01-complete']);
    const stamps = stampTicks(cleared);
    expect(stamps).toHaveLength('MISSIONCOMPLETE'.length);
    expect(stamps[0]).toBeGreaterThan(calls[0].tick);
  });

  it('stamps the letters one after another, in step with them dropping in', () => {
    const steps = new Set(gaps(stampTicks(cleared)));
    expect([...steps].every((gap) => gap >= CARD_STAGGER)).toBe(true);
  });

  it('rushes the wipe in once, after the card and before the next mission', () => {
    const wipes = cleared.filter((sound) => sound.key === 'wipe');
    expect(wipes).toHaveLength(1);
    expect(wipes[0].tick).toBeGreaterThan(stampTicks(cleared).at(-1));
  });

  // the call runs about two and a half seconds, its hall included
  it('leaves the clear call time to be said before the wipe rushes in', () => {
    const call = cleared.find((sound) => sound.call);
    const wipe = cleared.find((sound) => sound.key === 'wipe');
    expect(wipe.tick - call.tick).toBeGreaterThan(2.3 * 60);
  });

  it('opens the next mission with its rush, its call and a stamp for each letter', () => {
    expect(next[0].key).toBe('reveal');
    expect(next.filter((sound) => sound.call).map((sound) => sound.call)).toEqual([
      'mission-02-start',
    ]);
    expect(stampTicks(next)).toHaveLength('MISSION2'.length);
  });

  it('calls the whole game clear on the last mission, with no wipe to a next one', () => {
    const last = clearAndWalkOn(MISSIONS.length - 1);
    expect(last.filter((sound) => sound.call).map((sound) => sound.call)).toEqual([
      'mission-12-complete',
    ]);
    expect(last.some((sound) => sound.key === 'wipe')).toBe(false);
    expect(stampTicks(last)).toHaveLength('ALLCLEAR'.length);
  });
});
