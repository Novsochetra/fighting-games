import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IRONHORN_KIT } from '../../../src/data/enemies/boss-kits/ironhorn.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function ironhornAt(distance, { missionIndex = 2, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'ironhorn', 1);
  const ironhorn = game.fighters.find((fighter) => fighter.kind === 'ironhorn');
  Object.assign(ironhorn, { entering: false, x: 120 + distance, facing: -1 });
  ironhorn.ai.cooldown = 0;
  ironhorn.hp = hp ?? ironhorn.maxHp;
  return { game, ironhorn };
}

const think = (game, ironhorn) =>
  thinkKitBoss(game, ironhorn, {
    kit: IRONHORN_KIT,
    distance: Math.abs(ironhorn.x - game.player.x),
  });

describe("Ironhorn's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('keeps room to run: backs off a hero who comes close while he gathers himself', () => {
    const { game, ironhorn } = ironhornAt(50);
    ironhorn.ai.cooldown = 20;
    think(game, ironhorn);
    expect(ironhorn.walkDirection).toBe(-1);
  });

  it('rushes a hero with room between them', () => {
    const { game, ironhorn } = ironhornAt(150);
    think(game, ironhorn);
    expect(ironhorn.move.id).toBe('hornRush');
  });

  it('uppercuts a hero who jumps at him, and swings at one on the ground', () => {
    const jumping = ironhornAt(40);
    jumping.game.player.airborne = true;
    think(jumping.game, jumping.ironhorn);
    expect(jumping.ironhorn.move.id).toBe('uppercut');
    const standing = ironhornAt(40);
    think(standing.game, standing.ironhorn);
    expect(IRONHORN_KIT.close.moves).toContain(standing.ironhorn.move.id);
  });

  it('stampedes below 40% on his own road, and not as a mid-boss', () => {
    const own = ironhornAt(150, { hp: 90 });
    think(own.game, own.ironhorn);
    expect(own.ironhorn.move.id).toBe('stampede');
    const mid = ironhornAt(150, { missionIndex: 9, hp: 90 });
    think(mid.game, mid.ironhorn);
    expect(mid.ironhorn.move.id).toBe('hornRush');
  });
});
