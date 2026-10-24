import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GNOLL_KIT } from '../../../src/data/enemies/boss-kits/gnoll.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function gnollAt(distance, { missionIndex = 5, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'gnoll', 1);
  const gnoll = game.fighters.find((fighter) => fighter.kind === 'gnoll');
  Object.assign(gnoll, { entering: false, x: 120 + distance, facing: -1 });
  gnoll.ai.cooldown = 0;
  gnoll.hp = share * gnoll.maxHp;
  return { game, gnoll };
}

const think = (game, gnoll) =>
  thinkKitBoss(game, gnoll, { kit: GNOLL_KIT, distance: Math.abs(gnoll.x - game.player.x) });

describe("the Gnoll Packlord's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('darts in and out of reach while he gathers himself', () => {
    const { game, gnoll } = gnollAt(80);
    gnoll.ai.cooldown = 200;
    const directions = new Set();
    for (let i = 0; i < 50; i++) {
      think(game, gnoll);
      directions.add(gnoll.walkDirection);
    }
    expect([...directions].sort()).toEqual([-1, 1]);
  });

  it('pounces on a hero a way off, and howls the pack in when he stands alone', () => {
    const near = gnollAt(150);
    think(near.game, near.gnoll);
    expect(near.gnoll.move.id).toBe('leapingMaul');
    const far = gnollAt(300);
    think(far.game, far.gnoll);
    expect(far.gnoll.move.id).toBe('packCall');
  });

  it('keeps his howl while a raider still stands with him', () => {
    const { game, gnoll } = gnollAt(300);
    spawnEnemy(game, 'grunt', -1);
    think(game, gnoll);
    expect(gnoll.move?.id).not.toBe('packCall');
  });

  it('calls three hounds below half health', () => {
    const { game, gnoll } = gnollAt(300, { share: 0.48 });
    think(game, gnoll);
    expect(gnoll.move.id).toBe('packCallThree');
    expect(gnoll.move.pack).toBe(3);
  });

  it('goes into his frenzy below 40% on his own road, and not on another', () => {
    const own = gnollAt(150, { share: 0.37 });
    think(own.game, own.gnoll);
    expect(own.gnoll.move.id).toBe('bloodFrenzy');
    const other = gnollAt(150, { missionIndex: 0, share: 0.37 });
    think(other.game, other.gnoll);
    expect(other.gnoll.move.id).not.toBe('bloodFrenzy');
  });
});
