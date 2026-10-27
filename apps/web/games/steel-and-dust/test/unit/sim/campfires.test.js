import { describe, expect, it } from 'vitest';
import { CAMPFIRE } from '../../../src/data/campfires.js';
import { campfireFrame } from '../../../src/render/scene/campfires.js';
import { createCampfires, updateCampfires } from '../../../src/sim/hazards/campfires.js';
import { createLootGame, spawnEnemy } from '../../support/loot-game.js';

const FIRE = 300;

function campGame() {
  const { game, sounds } = createLootGame();
  game.player.x = FIRE - 100;
  game.campfires = createCampfires([{ x: FIRE, y: game.player.y }]);

  return { game, sounds, fire: game.campfires[0] };
}

const burnOn = (game, fighter) =>
  game.summons.find((summon) => summon.kind === 'burn' && summon.target === fighter);

describe('a campfire', () => {
  it('sets a raider in its flames alight, and keeps it burning while it stays in them', () => {
    const { game } = campGame();
    const raider = spawnEnemy(game, 'grunt', FIRE + 4);
    const clear = spawnEnemy(game, 'grunt', FIRE + 60);

    updateCampfires(game);
    const burn = burnOn(game, raider);
    burn.time = 100;
    updateCampfires(game);

    expect(burn.duration).toBe(100 + CAMPFIRE.burn);
    expect(burnOn(game, clear)).toBeUndefined();
  });

  it('leaves a raider still walking in from off screen alone', () => {
    const { game } = campGame();
    const raider = spawnEnemy(game, 'grunt', FIRE);
    raider.entering = true;

    updateCampfires(game);

    expect(burnOn(game, raider)).toBeUndefined();
  });

  it('singes the hero who walks into it and pushes him back out the way he came', () => {
    const { game } = campGame();
    const hero = game.player;
    Object.assign(hero, { x: FIRE - 6 });
    const before = hero.hp;

    updateCampfires(game);

    expect(hero.hp).toBeLessThan(before);
    expect(hero.hp).toBeGreaterThan(before - 10);
    expect(hero.vx).toBeLessThan(0);
    expect(burnOn(game, hero)).toBeUndefined();
  });

  it('singes the hero once, not on every tick he stands in it', () => {
    const { game, fire } = campGame();
    const hero = game.player;
    hero.x = FIRE + 6;

    updateCampfires(game);
    const once = hero.hp;
    Object.assign(hero, { x: FIRE + 6, invincible: 0 });
    for (let i = 0; i < CAMPFIRE.singeEvery - 2; i++) {
      updateCampfires(game);
    }

    expect(hero.hp).toBe(once);
    expect(fire.singe).toBeGreaterThan(0);
  });

  it('does not reach the hero jumping over it', () => {
    const { game } = campGame();
    Object.assign(game.player, { x: FIRE, y: game.player.y - CAMPFIRE.height - 50 });
    const before = game.player.hp;

    updateCampfires(game);

    expect(game.player.hp).toBe(before);
  });

  it('flickers on its own beat', () => {
    const near = { x: 300 };
    const far = { x: 310 };

    expect(campfireFrame(near, 0)).not.toBe(campfireFrame(far, 0));
    expect(campfireFrame(near, 0)).toBe(campfireFrame(near, 1));
  });
});
