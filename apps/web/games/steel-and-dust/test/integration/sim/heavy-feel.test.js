import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HEAVY_ART } from '../../../src/art/heavy-fx/index.js';
import { ULT_MAX } from '../../../src/config.js';
import { HEROES } from '../../../src/data/heroes.js';
import { HEAVY_KITS } from '../../../src/sim/fx/heavy/index.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;

function heavyOn(hero) {
  const sounds = [];
  const game = createPlayingGame({ settings: { hero }, io: { sfx: (key) => sounds.push(key) } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 22, hp: 500 });
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  game.ultMeter = ULT_MAX;
  return { game, raider, sounds };
}

// plays the heavy out, noting where the hero stands each tick of it and what it leaves behind
function playHeavy(game) {
  tap(game, 'heavy');
  const xs = [];
  const colors = new Set();
  let striking = false;
  for (let i = 0; i < 60; i++) {
    runTicks(game, 1);
    const { player } = game;
    if (player.state === 'attack') {
      xs.push({ x: player.x, time: player.moveTime, startup: player.move.startup });
      striking ||= player.moveTime >= player.move.startup;
    }
    player.afterimages.forEach((image) => colors.add(image.color));
  }
  return { xs, colors, striking };
}

describe("a Shade's heavy, felt", () => {
  beforeEach(() => {
    Math.random = seededRandom(6);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(HEROES.map((hero) => hero.id))(
    '%s charges with its own sound, lands, lunges and trails its color',
    (hero) => {
      const { game, raider, sounds } = heavyOn(hero);
      const { xs, colors, striking } = playHeavy(game);
      expect(sounds).toContain(`heavy${hero[0].toUpperCase()}${hero.slice(1)}Charge`);
      expect(striking).toBe(true);
      expect(colors.has(HEAVY_ART[hero].trail)).toBe(true);
      const windUp = xs.filter((step) => step.time < step.startup);
      const after = xs.filter((step) => step.time > step.startup);
      expect(after.at(-1).x).toBeGreaterThan(windUp.at(-1).x);
      expect(raider.hp).toBeLessThan(500);
    },
  );

  // Math.random also steers the raiders and the recorded runs; dressing must never change a fight
  it.each(HEROES.map((hero) => hero.id))('%s dresses its heavy without Math.random', (hero) => {
    const { game, raider } = heavyOn(hero);
    tap(game, 'heavy');
    runTicks(game, 4);
    const { player } = game;
    const kit = HEAVY_KITS[hero];
    const hit = {
      attacker: player,
      target: raider,
      move: player.move,
      x: raider.x,
      y: raider.y - 20,
    };
    Math.random = () => {
      throw new Error('a heavy kit used Math.random');
    };
    kit.windup(game, player, player.move);
    for (let time = 0; time < 20; time++) {
      kit.gather(game, player, player.move, time);
      kit.trail(game, player, player.move, time);
    }
    kit.release(game, player, player.move);
    kit.impact(game, hit);
    Math.random = seededRandom(6);
  });

  it('leaves a light move as it was: no charge sound and no colored trail', () => {
    const { game, sounds } = heavyOn('moss');
    tap(game, 'light');
    runTicks(game, 30);
    expect(sounds.filter((key) => key.startsWith('heavy'))).toEqual([]);
    expect(game.player.afterimages.filter((image) => image.color)).toEqual([]);
  });
});
