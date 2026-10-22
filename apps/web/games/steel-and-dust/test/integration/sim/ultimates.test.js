import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { ULTIMATES } from '../../../src/data/ultimates/index.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { heapAt } from '../../../src/sim/ultimates/lion-pride.js';
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

  it('Bokator: a slam, a bare-handed rush of echoes that strike again, then they rise and pounce', () => {
    const game = startUltimate('bokator');
    const startX = game.player.x;
    const echoes = new Set();
    const lions = new Set();
    const bursts = [];
    const seen = watchUltimate(game, (current) => {
      for (const summon of current.summons) {
        if (summon.kind === 'echo') {
          echoes.add(summon);
        }
        if (summon.kind === 'lion') {
          lions.add(summon);
        }
        if (summon.kind === 'burst' && !bursts.includes(summon)) {
          bursts.push(summon);
        }
      }
    });
    expect(seen.kinds).toEqual(new Set(['echo', 'lion', 'burst']));
    const { slam, blow, echo, pounce, rush, pride } = ULTIMATES.bokator;
    // a gold echo for every blow of the rush, and a lion rising where each one stood
    expect(echoes.size).toBe(rush.length);
    expect(lions.size).toBe(pride.length);
    const echoXs = [...echoes].map((summon) => summon.x);
    [...lions].forEach((lion) => expect(echoXs).toContain(lion.flight[0][1]));
    // he rushes every raider, from either side, and they are all on the field together
    raiders(game).forEach((raider) => {
      expect(echoXs.some((x) => Math.abs(x - raider.x) < 120)).toBe(true);
    });
    expect(new Set([...echoes].map((summon) => summon.direction))).toEqual(new Set([1, -1]));
    const sprites = bursts.map((burst) => burst.sprite);
    expect(sprites.filter((sprite) => sprite === 'strike').length).toBeGreaterThanOrEqual(
      rush.length * 2,
    );
    expect(sprites.filter((sprite) => sprite === 'awaken')).toHaveLength(rush.length);
    expect(bursts.find((burst) => burst.sprite === 'gather').behind).toBe(true);
    // the ground breaks under his slam, then bigger where the pride lands ahead of him
    const [slamImpact, pounceImpact] = bursts.filter((burst) => burst.sprite === 'pounce');
    expect(Math.abs(slamImpact.x - startX)).toBeLessThan(30);
    expect(pounceImpact.x).toBe(heapAt(game.player.x, game.player.facing));
    expect(pounceImpact.scale).toBeGreaterThan(slamImpact.scale);
    raiders(game).forEach((raider) => {
      const least = slam.damage + blow.damage + echo.damage + pounce.damage;
      expect(raider.maxHp - raider.hp).toBeGreaterThanOrEqual(least);
    });
    // back where the rush started, on his feet, every echo woken
    expect(game.summons.filter((summon) => summon.kind === 'echo')).toEqual([]);
    expect(game.player.x).toBe(startX);
    expect(game.player).toMatchObject({ state: 'idle', invincible: 40, rush: null });
  });

  it('Angkor: cuts through every raider, leaving cuts and carvings, then every cut lands at once', () => {
    const game = startUltimate('angkor');
    const standing = game.player.y;
    const cuts = new Set();
    const carvings = new Set();
    let hpBeforeRelease = null;
    const seen = watchUltimate(game, (current, watched) => {
      for (const summon of current.summons) {
        if (summon.kind === 'hangingCut') {
          cuts.add(summon);
        }
        if (summon.kind === 'carving') {
          carvings.add(summon);
        }
      }
      if (current.player.stateTime === ULTIMATES.angkor.releaseAt - 1 && !hpBeforeRelease) {
        hpBeforeRelease = raiders(current).map((raider) => raider.hp);
      }
      watched.cutsHanging = Math.max(
        watched.cutsHanging ?? 0,
        current.summons.filter((summon) => summon.kind === 'hangingCut').length,
      );
    });
    expect(seen.kinds).toEqual(new Set(['hangingCut', 'carving', 'burst']));
    const { passes, cut, sever, split, leapHeight } = ULTIMATES.angkor;
    // a cut hangs on a raider for every pass, all of them at once before they land
    expect(cuts.size).toBe(passes.length);
    expect(seen.cutsHanging).toBe(passes.length);
    expect(new Set([...cuts].map((hanging) => hanging.target))).toEqual(new Set(raiders(game)));
    // his shape is left carved where he stopped after every pass but the last, facing both ways
    expect(carvings.size).toBe(passes.length - 1);
    expect(new Set([...carvings].map((carving) => carving.direction))).toEqual(new Set([1, -1]));
    raiders(game).forEach((raider, i) => {
      const made = [...cuts].filter((hanging) => hanging.target === raider).length;
      expect(raider.maxHp - hpBeforeRelease[i]).toBe(cut.damage * made);
      expect(raider.maxHp - raider.hp).toBeGreaterThanOrEqual(
        (cut.damage + sever.damage) * made + split.damage,
      );
    });
    expect(seen.lowest).toBe(standing - leapHeight);
    expect(game.summons.filter((summon) => summon.kind !== 'burst')).toEqual([]);
    expect(game.player).toMatchObject({ state: 'idle', invincible: 40, y: standing, cuts: null });
  });

  it('Angkor: the cuts land together, one great slash across the field, and every carving swings', () => {
    const game = startUltimate('angkor');
    const { releaseAt } = ULTIMATES.angkor;
    while (game.player.stateTime < releaseAt) {
      runTicks(game, 1);
    }
    const severed = game.summons.filter((summon) => summon.kind === 'hangingCut');
    expect(severed.length).toBeGreaterThan(0);
    expect(severed.every((hanging) => hanging.severedAt !== null)).toBe(true);
    expect(game.summons.filter((summon) => summon.sprite === 'sever')).toHaveLength(severed.length);
    const carvings = game.summons.filter((summon) => summon.kind === 'carving');
    expect(carvings.every((carving) => carving.swungAt !== null)).toBe(true);
    const [slash] = game.effects.filter((effect) => effect.kind === 'screenCut');
    // across the middle of the field (the camera may have eased on a pixel since)
    expect(Math.abs(slash.x - (game.camera.x + VIEW_WIDTH / 2))).toBeLessThan(4);
    expect(game.slashBandTime).toBe(0);
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
