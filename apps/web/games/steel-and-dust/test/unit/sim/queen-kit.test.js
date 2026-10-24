import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QUEEN_KIT } from '../../../src/data/enemies/boss-kits/queen.js';
import { ENEMY_MOVES } from '../../../src/data/enemies/enemy-moves.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { isOutOfReach } from '../../../src/sim/combat/boxes.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { waspAt } from '../../../src/sim/hazards/wasps.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function queenAt(distance, { missionIndex = 4, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'queen', 1);
  const queen = game.fighters.find((fighter) => fighter.kind === 'queen');
  Object.assign(queen, { entering: false, x: 120 + distance, facing: -1 });
  queen.ai.cooldown = 0;
  queen.hp = share * queen.maxHp;
  return { game, queen };
}

const think = (game, queen) =>
  thinkKitBoss(game, queen, { kit: QUEEN_KIT, distance: Math.abs(queen.x - game.player.x) });

describe("the Scorpion Queen's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('scuttles to and fro at the edge of her reach while she gathers herself', () => {
    const { game, queen } = queenAt(100);
    queen.ai.cooldown = 200;
    const directions = new Set();
    for (let i = 0; i < 70; i++) {
      think(game, queen);
      directions.add(queen.walkDirection);
    }
    expect([...directions].sort()).toEqual([-1, 1]);
  });

  it('stings a hero near her and burrows after one who keeps away', () => {
    const near = queenAt(70);
    think(near.game, near.queen);
    expect(near.queen.move.id).toBe('tailSting');
    const far = queenAt(220);
    think(far.game, far.queen);
    expect(far.queen.move.id).toBe('burrow');
  });

  it('goes under twice before surfacing below half health', () => {
    const { game, queen } = queenAt(220, { share: 0.46 });
    think(game, queen);
    expect(queen.move.id).toBe('burrowTwice');
    expect(queen.move.tunnel).toHaveLength(2);
  });

  it('calls up her swarm below 40% on her own road, and not as a mid-boss', () => {
    const own = queenAt(150, { share: 0.38 });
    think(own.game, own.queen);
    expect(own.queen.move.id).toBe('hiveSwarm');
    const mid = queenAt(150, { missionIndex: 9, share: 0.38 });
    think(mid.game, mid.queen);
    expect(mid.queen.move.id).not.toBe('hiveSwarm');
  });
});

describe('her burrow', () => {
  it('takes her out of reach once only her head shows, until she bursts up', () => {
    const { game, queen } = queenAt(200);
    startMove(game, queen, 'burrow');
    queen.moveTime = 10;
    expect(isOutOfReach(queen)).toBe(false);
    queen.moveTime = 60;
    expect(isOutOfReach(queen)).toBe(true);
    startMove(game, queen, 'emerge');
    expect(isOutOfReach(queen)).toBe(false);
  });
});

describe('her swarm', () => {
  it('sends its wasps one at a time, each wave from one side only', () => {
    const move = ENEMY_MOVES.hiveSwarm;
    const released = [];
    for (let time = 0; time < 400; time++) {
      const wasp = waspAt(move, time);
      if (wasp) {
        released.push(wasp);
      }
    }
    expect(released).toHaveLength(6);
    expect(released.slice(0, 3).every(([, from]) => from === 'near')).toBe(true);
    expect(released.slice(3).every(([, from]) => from === 'far')).toBe(true);
    // a wasp takes 130 ticks to cross the screen, so the far wave waits for the near one to pass
    expect(released[3][0] - released[2][0]).toBeGreaterThanOrEqual(130);
  });
});
