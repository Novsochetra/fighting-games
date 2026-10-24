import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GUARDIAN_KIT } from '../../../src/data/enemies/boss-kits/guardian.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function guardianAt(distance, { missionIndex = 11, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'guardian', 1);
  const guardian = game.boss;
  Object.assign(guardian, { entering: false, x: 120 + distance, facing: -1 });
  guardian.ai.cooldown = 0;
  guardian.hp = share * guardian.maxHp;
  return { game, guardian };
}

const think = (game, guardian) =>
  thinkKitBoss(game, guardian, {
    kit: GUARDIAN_KIT,
    distance: Math.abs(guardian.x - game.player.x),
  });

describe("the Bayon Guardian's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('stomps at the hero and never steps back while he gathers himself', () => {
    const { game, guardian } = guardianAt(200);
    guardian.ai.cooldown = 400;
    for (let i = 0; i < 60; i++) {
      think(game, guardian);
      expect(guardian.walkDirection).toBe(1);
    }
  });

  it('pounds the ground up close, and swats a hero who jumps in with his punch', () => {
    const grounded = guardianAt(30);
    think(grounded.game, grounded.guardian);
    expect(grounded.guardian.move.id).toBe('slam');
    const jumping = guardianAt(30);
    jumping.game.player.airborne = true;
    think(jumping.game, jumping.guardian);
    expect(jumping.guardian.move.id).toBe('swipe');
  });

  it('turns his gaze on a hero far off and drives his roots at one nearer', () => {
    const far = guardianAt(260);
    think(far.game, far.guardian);
    expect(far.guardian.move.id).toBe('stoneGaze');
    const near = guardianAt(60);
    think(near.game, near.guardian);
    expect(near.guardian.move.id).toBe('figRoots');
  });

  it('crumbles and reforms once as he falls below half health, then glares and grows thickets', () => {
    const { game, guardian } = guardianAt(260, { share: 0.47 });
    think(game, guardian);
    expect(guardian.move.id).toBe('crumble');
    Object.assign(guardian, { state: 'idle', move: null });
    think(game, guardian);
    expect(guardian.move.id).toBe('stoneGlare');
    const near = guardianAt(60, { share: 0.47 });
    near.guardian.ai.kit = { readyAt: {}, ultReadyAt: 0, chain: null, opened: true };
    think(near.game, near.guardian);
    expect(near.guardian.move.id).toBe('figThicket');
  });

  it('raises the four faces below 40%, on his own road only', () => {
    const own = guardianAt(150, { share: 0.39 });
    own.guardian.ai.kit = { readyAt: {}, ultReadyAt: 0, chain: null, opened: true };
    think(own.game, own.guardian);
    expect(own.guardian.move.id).toBe('fourFaces');
    const elsewhere = guardianAt(150, { share: 0.39, missionIndex: 4 });
    elsewhere.guardian.ai.kit = { readyAt: {}, ultReadyAt: 0, chain: null, opened: true };
    think(elsewhere.game, elsewhere.guardian);
    expect(elsewhere.guardian.move.id).not.toBe('fourFaces');
  });
});
