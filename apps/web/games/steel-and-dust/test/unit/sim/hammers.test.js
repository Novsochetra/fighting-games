import { describe, expect, it } from 'vitest';
import { HAMMER } from '../../../src/data/hammers.js';
import { HAMMER_BEAT, hammerPhase, headLift } from '../../../src/sim/hazards/hammer-beat.js';
import { createHammers, updateHammers } from '../../../src/sim/hazards/hammers.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const SPOT = 300;
const WARN_AT = HAMMER.rest;
const SLAM_AT = HAMMER.rest + HAMMER.warn + HAMMER.drop;

// the hammer just before the start of its beat, so the first update starts it
function foundryGame() {
  const { game, sounds } = createLootGame();
  game.player.x = SPOT - 120;
  game.hammers = createHammers([{ x: SPOT, y: game.player.y }]);
  game.hammers[0].time = HAMMER_BEAT - 1;

  return { game, sounds, hammer: game.hammers[0] };
}

function runBeat(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateHammers(game);
  }
}

describe("a drop hammer's beat", () => {
  it('rests raised, warns, drops all at once, stays down a moment and climbs back', () => {
    expect(hammerPhase(0)).toEqual({ phase: 'rest', at: 0 });
    expect(hammerPhase(WARN_AT).phase).toBe('warn');
    expect(hammerPhase(SLAM_AT)).toEqual({ phase: 'down', at: 0 });
    expect(headLift(WARN_AT)).toBe(HAMMER.lift);
    expect(headLift(SLAM_AT - 1)).toBe(0);
    expect(headLift(SLAM_AT + HAMMER.down + 1)).toBeLessThan(HAMMER.lift / 2);
    expect(hammerPhase(HAMMER_BEAT)).toEqual({ phase: 'rest', at: 0 });
  });

  it('hangs high enough to walk under between slams', () => {
    expect(HAMMER.lift).toBeGreaterThan(60);
  });

  it('lets two hammers keep their own beats', () => {
    const [first, second] = createHammers([
      { x: 300, y: 184 },
      { x: 370, y: 184 },
    ]);

    expect(first.time).not.toBe(second.time);
  });
});

describe('a drop hammer', () => {
  it('hisses as it warns, and slams once a beat', () => {
    const { game, sounds } = foundryGame();

    runBeat(game, HAMMER_BEAT);

    expect(soundKeys(sounds)).toEqual(['steam', 'hammerSlam']);
  });

  it('crushes the raider under it and leaves the one beside it alone', () => {
    const { game } = foundryGame();
    const under = spawnEnemy(game, 'grunt', SPOT + 6);
    const beside = spawnEnemy(game, 'grunt', SPOT + HAMMER.halfWidth + 24);

    runBeat(game, SLAM_AT);
    expect(under.hp).toBe(under.def.hp);
    runBeat(game, 1);

    expect(under.state).toBe('ko');
    expect(beside.hp).toBe(beside.def.hp);
  });

  it('hurts the hero standing under it, without knocking him out', () => {
    const { game } = foundryGame();
    game.player.x = SPOT;
    const before = game.player.hp;

    runBeat(game, SLAM_AT + 1);

    expect(game.player.hp).toBeLessThan(before);
    expect(game.player.hp).toBeGreaterThan(0);
  });
});
