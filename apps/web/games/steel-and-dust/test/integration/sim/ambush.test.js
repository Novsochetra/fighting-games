import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BURROW } from '../../../src/data/ambush.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { screenEdges } from '../../../src/sim/fighters/arena-bounds.js';
import { pendingAmbushes, startAmbush } from '../../../src/sim/stage/ambush.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HERO_X = 180;

function ambushArena() {
  const game = createPlayingGame();

  game.arena = { left: 0, right: 384 };
  game.player.x = HERO_X;

  return game;
}

const ambushOf = (game, kind) => game.projectiles.find((shot) => shot.kind === kind);
const raiders = (game) => game.fighters.filter((fighter) => fighter.side === 'enemy');

function tickUntil(game, done, limit = 400) {
  for (let i = 0; i < limit && !done(); i++) {
    runTicks(game, 1);
  }

  return done();
}

describe('a raider bursting out of the sand', () => {
  beforeEach(() => {
    Math.random = seededRandom(4);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("digs in at the screen's edge and its mound crawls to the hero, then stops to shake", () => {
    const game = ambushArena();
    startAmbush(game, { kind: 'scorpion', ambush: 'burrow', slot: 0 });
    const mound = ambushOf(game, 'mound');
    expect(mound.x).toBe(BURROW.inset);
    runTicks(game, 20);
    expect(mound.x).toBeGreaterThan(BURROW.inset);
    expect(tickUntil(game, () => mound.haltAt > 0)).toBe(true);
    expect(Math.abs(mound.x - HERO_X)).toBeLessThanOrEqual(BURROW.speed);
    expect(raiders(game)).toHaveLength(0);
    expect(pendingAmbushes(game)).toBe(1);
  });

  it('bursts its raider up out of the mound and throws a hero who stood on it', () => {
    const game = ambushArena();
    startAmbush(game, { kind: 'scorpion', ambush: 'burrow', slot: 1 });
    const mound = ambushOf(game, 'mound');
    tickUntil(game, () => mound.eruptAt > 0);
    const [raider] = raiders(game);
    expect(raider).toMatchObject({ kind: 'scorpion', airborne: true });
    expect(raider.x).toBe(mound.x);
    expect(game.summons.some((summon) => summon.sprite === 'eruption')).toBe(true);
    tickUntil(game, () => game.player.hp < game.player.maxHp, 10);
    expect(game.player.hp).toBe(game.player.maxHp - BURROW.eruptDamage);
    expect(['juggle', 'down']).toContain(game.player.state);
  });

  it('is carried along at the edge of a screen that scrolls on past it, so its raider still comes', () => {
    const game = ambushArena();
    game.arena = { left: 0, right: 384 * 3 };
    startAmbush(game, { kind: 'ghoul', ambush: 'burrow', slot: 0 });
    const mound = ambushOf(game, 'mound');
    tickUntil(game, () => mound.haltAt > 0);
    game.camera.x = 300;
    game.player.x = 500;
    expect(tickUntil(game, () => mound.eruptAt > 0)).toBe(true);
    expect(raiders(game)[0].x).toBeGreaterThanOrEqual(300);
  });
});

// the bot plays on with its health kept up; every ambush it meets is noted as it starts, and the
// zone is watched for moving on while a raider is still in the trees or under the sand. The run is
// long enough for the bot to wade the Sandstorm Pass's quicksand and still leave the ambush's zone
function playRoad(theme) {
  Math.random = seededRandom(9);
  const game = createScenarioGame(
    'moss',
    MISSIONS.findIndex((mission) => mission.theme === theme),
  );
  const driver = createGameDriver(game);
  const bot = createBot(driver, { 1500: ['fill'], 4500: ['fill'] });
  const run = { ambushes: [], perches: [], offScreen: 0, leftEarly: 0, zones: 0 };

  driver.act('play');
  for (let tick = 0; tick < 9000; tick++) {
    const zone = game.stage.zoneIndex;
    const waiting = pendingAmbushes(game);

    bot.step(tick);
    driver.tick();
    driver.afterTick();
    game.player.hp = game.player.maxHp;
    run.leftEarly += waiting && game.stage.zoneIndex !== zone ? 1 : 0;
    const { left, right } = screenEdges(game);

    for (const ambush of game.projectiles.filter((shot) => shot.time === 1 && shot.raiderKind)) {
      run.ambushes.push(ambush.kind);
      run.perches.push(ambush.perch?.kind ?? null);
      run.offScreen += ambush.x < left || ambush.x > right ? 1 : 0;
    }

    run.zones = Math.max(run.zones, game.stage.zoneIndex);
  }

  return run;
}

// how many raiders the road's ambush wave sends
const ambushSize = (theme) =>
  MISSIONS.find((mission) => mission.theme === theme)
    .zones.flatMap((zone) => zone.waves)
    .find((wave) => wave.ambush).kinds.length;

describe('a bot-played run into the ambushes of every road that has one', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('meets every raider of the wave inside the screen and fights on past them', () => {
    for (const [theme, kind] of [
      ['oldGrove', 'dropMark'],
      ['sandstormPass', 'mound'],
    ]) {
      const run = playRoad(theme);
      expect(run.ambushes, theme).toEqual(Array(ambushSize(theme)).fill(kind));
      expect(run.offScreen, theme).toBe(0);
      expect(run.leftEarly, theme).toBe(0);
      expect(run.zones, theme).toBeGreaterThanOrEqual(2);
    }
  });

  // six bot-played roads: about 4 s alone, past the 5 s default when the whole suite shares the
  // machine's cores
  it("meets them waiting on the road's own trees, towers and girders", () => {
    for (const [theme, perch] of [
      ['pineRidge', 'crown'],
      ['raiderCamp', 'ledge'],
      ['ironWorks', 'ledge'],
      ['emberWoods', 'crown'],
      ['wardenFortress', 'ledge'],
      ['bayon', 'ledge'],
    ]) {
      const run = playRoad(theme);
      const size = ambushSize(theme);
      expect(run.ambushes.slice(0, size), theme).toEqual(Array(size).fill('dropMark'));
      expect(run.perches.slice(0, size), theme).toEqual(Array(size).fill(perch));
      expect(run.offScreen, theme).toBe(0);
      expect(run.leftEarly, theme).toBe(0);
    }
  }, 20000);
});
