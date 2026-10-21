import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { ULTIMATES } from '../../../src/data/ultimates/index.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const raiders = (game) => game.fighters.filter((fighter) => fighter.side === 'enemy');

// three raiders spread across the screen, then the bar is filled and ULT pressed
function startUltimate(hero) {
  const game = createPlayingGame({ settings: { hero } });
  runTicks(game, 30);
  for (const [kind, side] of [
    ['grunt', 1],
    ['scrapper', 1],
    ['knife', -1],
  ]) {
    spawnEnemy(game, kind, side);
  }
  raiders(game).forEach((raider, i) => {
    Object.assign(raider, { entering: false, x: game.player.x + [70, 140, -60][i], hp: 400 });
    raider.maxHp = 400;
    raider.ai.cooldown = 999;
  });
  game.ultMeter = 100;
  tap(game, 'ult');
  return game;
}

// watch the ultimate tick by tick until the Shade is back on its feet
function watchUltimate(game, look) {
  const seen = { ticks: 0, kinds: new Set(), lowest: GROUND_Y, frozen: 0 };
  while (game.player.state === 'ult' && seen.ticks < 400) {
    runTicks(game, 1);
    seen.ticks++;
    seen.lowest = Math.min(seen.lowest, game.player.y);
    seen.frozen = Math.max(seen.frozen, raiders(game).filter((raider) => raider.frozen).length);
    game.summons.forEach((summon) => seen.kinds.add(summon.kind));
    look?.(game, seen);
  }
  return seen;
}

function everyRaiderHurt(game) {
  return raiders(game).every((raider) => raider.hp < raider.maxHp);
}

describe("each Shade's ultimate", () => {
  beforeEach(() => {
    Math.random = seededRandom(23);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('Moss: plants the blade and raises brambles that reach every raider, then blooms', () => {
    const game = startUltimate('moss');
    expect(game.ultFreeze).toBe(ULTIMATES.moss.intro);
    const seen = watchUltimate(game);
    expect(seen.kinds).toEqual(new Set(['thorn']));
    expect(everyRaiderHurt(game)).toBe(true);
    expect(game.player).toMatchObject({ state: 'idle', invincible: 40 });
  });

  it('Firefly: rises, looses a swarm that stings every raider and bursts as a nova', () => {
    const game = startUltimate('firefly');
    const seen = watchUltimate(game);
    expect(seen.lowest).toBeLessThan(GROUND_Y - 20);
    expect(seen.kinds).toEqual(new Set(['firefly', 'burst']));
    expect(everyRaiderHurt(game)).toBe(true);
    expect(game.combo.count).toBeGreaterThan(10);
    expect(game.player).toMatchObject({ state: 'idle', y: GROUND_Y, airborne: false });
  });

  it('Antler: herds of spirit stags cross the whole screen from both edges', () => {
    const game = startUltimate('antler');
    const directions = new Set();
    const seen = watchUltimate(game, (current) => {
      current.summons.forEach((summon) => directions.add(summon.direction));
    });
    expect(seen.kinds).toEqual(new Set(['stag']));
    expect(directions).toEqual(new Set([1, -1]));
    expect(everyRaiderHurt(game)).toBe(true);
  });

  it('Blue: cuts and freezes every raider, then shatters all the ice at once', () => {
    const game = startUltimate('blue');
    let hpBeforeShatter = null;
    const seen = watchUltimate(game, (current, watched) => {
      if (watched.ticks === ULTIMATES.blue.shatterAt - 2) {
        hpBeforeShatter = raiders(current).map((raider) => raider.hp);
      }
    });
    expect(seen.frozen).toBe(3);
    expect(seen.kinds).toEqual(new Set(['ice', 'burst']));
    expect(raiders(game).every((raider) => !raider.frozen)).toBe(true);
    raiders(game).forEach((raider, i) => {
      expect(hpBeforeShatter[i] - raider.hp).toBe(ULTIMATES.blue.shatter.damage);
    });
  });

  it('Ember: flames roll out, the phoenix sweeps both ways and dives into an inferno', () => {
    const game = startUltimate('ember');
    const directions = new Set();
    const burning = new Set();
    const seen = watchUltimate(game, (current) => {
      for (const summon of current.summons) {
        if (summon.kind === 'phoenix') {
          directions.add(summon.direction);
        }
        if (summon.kind === 'burn') {
          burning.add(summon.target);
        }
      }
    });
    expect(seen.kinds).toEqual(new Set(['pillar', 'burn', 'phoenix', 'burst']));
    expect(directions).toEqual(new Set([1, -1]));
    expect(burning.size).toBe(3);
    raiders(game).forEach((raider) => {
      expect(raider.maxHp - raider.hp).toBeGreaterThanOrEqual(ULTIMATES.ember.inferno.damage);
    });
    expect(game.player).toMatchObject({ state: 'idle', invincible: 40 });
  });

  it('Bokator: the slam throws every raider up, the lion bounds both ways and pounces', () => {
    const game = startUltimate('bokator');
    const directions = new Set();
    const impacts = new Map();
    const seen = watchUltimate(game, (current) => {
      for (const summon of current.summons) {
        if (summon.kind === 'lion') {
          directions.add(summon.direction);
        }
        if (summon.kind === 'burst' && !impacts.has(summon)) {
          impacts.set(summon, current.camera.x + VIEW_WIDTH / 2);
        }
      }
    });
    expect(seen.kinds).toEqual(new Set(['lion', 'burst']));
    expect(directions).toEqual(new Set([1, -1]));
    // the gold breaks the ground where his sword slams it, then bigger where the lion lands
    const [slamImpact, pounceImpact] = [...impacts.keys()];
    expect([slamImpact.sprite, pounceImpact.sprite]).toEqual(['pounce', 'pounce']);
    expect(Math.abs(slamImpact.x - game.player.x)).toBeLessThan(30);
    expect(pounceImpact.x).toBe(impacts.get(pounceImpact));
    expect(pounceImpact.scale).toBeGreaterThan(slamImpact.scale);
    const { slam, pounce } = ULTIMATES.bokator;
    raiders(game).forEach((raider) => {
      expect(raider.maxHp - raider.hp).toBeGreaterThanOrEqual(slam.damage + pounce.damage);
    });
    expect(game.player).toMatchObject({ state: 'idle', invincible: 40 });
  });

  it('Angkor: a rank of carved soldiers fights each way, then he leaps and splits the ground', () => {
    const game = startUltimate('angkor');
    const directions = new Set();
    const standing = game.player.y;
    const seen = watchUltimate(game, (current) => {
      for (const summon of current.summons) {
        if (summon.kind === 'soldier') {
          directions.add(summon.direction);
        }
      }
    });
    expect(seen.kinds).toEqual(new Set(['soldier', 'burst']));
    expect(directions).toEqual(new Set([1, -1]));
    const { blow, rank, ranks, beats, split, leapHeight } = ULTIMATES.angkor;
    const perRank = blow.damage * (beats.length - 1) + rank.damage;
    raiders(game).forEach((raider) => {
      expect(raider.maxHp - raider.hp).toBeGreaterThanOrEqual(
        perRank * ranks.length + split.damage,
      );
    });
    expect(seen.lowest).toBe(standing - leapHeight);
    expect(game.player).toMatchObject({ state: 'idle', invincible: 40, y: standing });
  });

  it('Angkor: each rank rises in a wave, then all of it strikes in step on every beat', () => {
    const game = startUltimate('angkor');
    const { ranks, beats } = ULTIMATES.angkor;
    runTicks(game, ranks[0].at + 1);
    const rank = game.summons.filter((summon) => summon.kind === 'soldier');
    const waits = new Set(rank.map((soldier) => soldier.wait));
    expect(waits.size).toBeGreaterThan(2);
    expect(rank.every((soldier) => soldier.beats === beats)).toBe(true);
    expect(rank.some((soldier) => Math.abs(soldier.x - game.player.x) < 16)).toBe(false);
  });

  it('Angkor: the chop opens a fissure across the whole screen, a pillar of light under every raider', () => {
    const game = startUltimate('angkor');
    const { chopAt } = ULTIMATES.angkor;
    while (game.player.stateTime < chopAt) {
      runTicks(game, 1);
    }
    const fissure = game.effects.find((effect) => effect.kind === 'fissure');
    const xs = fissure.points.map(([x]) => x);
    expect(Math.min(...xs)).toBeLessThanOrEqual(game.camera.x);
    expect(Math.max(...xs)).toBeGreaterThanOrEqual(game.camera.x + VIEW_WIDTH);
    const pillars = game.summons.filter((summon) => summon.sprite === 'pounce');
    expect(pillars).toHaveLength(raiders(game).length + 1);
  });

  it('lasts as long as its timeline says, for every Shade', () => {
    for (const [hero, ult] of Object.entries(ULTIMATES)) {
      const game = startUltimate(hero);
      const seen = watchUltimate(game);
      // the finale's slow motion stretches the run by two ticks in three while it lasts
      expect(seen.ticks, hero).toBeGreaterThanOrEqual(ult.end - 1);
      expect(seen.ticks, hero).toBeLessThan(ult.end + 80);
    }
  });
});
