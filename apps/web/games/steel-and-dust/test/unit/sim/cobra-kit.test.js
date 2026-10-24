import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COBRA_KIT } from '../../../src/data/enemies/boss-kits/cobra.js';
import { ENEMY_MOVES } from '../../../src/data/enemies/enemy-moves.js';
import { meetsGaze } from '../../../src/sim/bosses/hypnotic-gaze.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spitVenom } from '../../../src/sim/hazards/venom-globs.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function cobraAt(distance, { missionIndex = 3, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'cobra', 1);
  const cobra = game.fighters.find((fighter) => fighter.kind === 'cobra');
  Object.assign(cobra, { entering: false, x: 120 + distance, facing: -1 });
  cobra.ai.cooldown = 0;
  cobra.hp = share * cobra.maxHp;
  return { game, cobra };
}

const think = (game, cobra) =>
  thinkKitBoss(game, cobra, { kit: COBRA_KIT, distance: Math.abs(cobra.x - game.player.x) });

describe("the Cobra Matriarch's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('slithers back from a hero who crowds her while she gathers herself', () => {
    const { game, cobra } = cobraAt(60);
    cobra.ai.cooldown = 20;
    think(game, cobra);
    expect(cobra.walkDirection).toBe(-1);
  });

  it('lashes her tail at a hero a little off, and spits at one further away', () => {
    const near = cobraAt(80);
    think(near.game, near.cobra);
    expect(near.cobra.move.id).toBe('coilLash');
    const far = cobraAt(200);
    think(far.game, far.cobra);
    expect(far.cobra.move.id).toBe('venomSpit');
  });

  it('spits five globs below half health', () => {
    const { game, cobra } = cobraAt(200, { share: 0.44 });
    think(game, cobra);
    expect(cobra.move.id).toBe('venomSpray');
    expect(cobra.move.globs.count).toBe(5);
  });

  it('turns her gaze on the hero below 40% on her own road, and not as a mid-boss', () => {
    const own = cobraAt(150, { share: 0.36 });
    think(own.game, own.cobra);
    expect(own.cobra.move.id).toBe('hypnoticGaze');
    const mid = cobraAt(150, { missionIndex: 8, share: 0.36 });
    think(mid.game, mid.cobra);
    expect(mid.cobra.move.id).not.toBe('hypnoticGaze');
  });
});

describe('her spit', () => {
  it('lands its globs spread round the hero, the middle one on the hero', () => {
    const { game, cobra } = cobraAt(150);
    spitVenom(game, cobra, ENEMY_MOVES.venomSpit.globs);
    const globs = game.projectiles.filter((shot) => shot.kind === 'glob');
    expect(globs).toHaveLength(3);
    const landings = globs.map((glob) => {
      const shot = { ...glob };
      while (shot.y < glob.floor) {
        shot.x += shot.direction * shot.speed;
        shot.y += shot.vy;
        shot.vy += 0.16;
      }
      return shot.x;
    });
    expect(landings[1]).toBeCloseTo(game.player.x, -1);
    expect(landings[0] - landings[1]).toBeCloseTo(26, -1);
  });
});

describe('her gaze', () => {
  it('holds a hero who faces her within reach, and not one who looks away', () => {
    const { game, cobra } = cobraAt(150);
    const hero = game.player;
    hero.facing = 1;
    expect(meetsGaze(cobra, hero, 260)).toBe(true);
    hero.facing = -1;
    expect(meetsGaze(cobra, hero, 260)).toBe(false);
  });

  it('misses a hero out of reach, in the air or getting up', () => {
    const { game, cobra } = cobraAt(300);
    const hero = game.player;
    hero.facing = 1;
    expect(meetsGaze(cobra, hero, 260)).toBe(false);
    cobra.x = hero.x + 100;
    hero.airborne = true;
    expect(meetsGaze(cobra, hero, 260)).toBe(false);
    hero.airborne = false;
    hero.state = 'getup';
    expect(meetsGaze(cobra, hero, 260)).toBe(false);
  });
});
