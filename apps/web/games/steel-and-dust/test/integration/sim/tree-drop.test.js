import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { GROUND_Y } from '../../../src/config.js';
import { DROP } from '../../../src/data/ambush.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { enemySpriteFrame } from '../../../src/sim/enemy-animation.js';
import { pendingAmbushes, startAmbush } from '../../../src/sim/stage/ambush.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HERO_X = 180;

function forestArena(theme = 'oldGrove') {
  const sounds = [];
  const game = createPlayingGame({ io: { sfx: (key) => sounds.push(key) } });

  game.missionIndex = MISSIONS.findIndex((mission) => mission.theme === theme);
  game.arena = { left: 0, right: 384 };
  game.player.x = HERO_X;

  return { game, sounds };
}

const markOf = (game) => game.projectiles.find((shot) => shot.kind === 'dropMark');
const raiders = (game) => game.fighters.filter((fighter) => fighter.side === 'enemy');
const particles = (game, kind) => game.particles.filter((particle) => particle.kind === kind);

function tickUntil(game, done, limit = 400) {
  for (let i = 0; i < limit && !done(); i++) {
    runTicks(game, 1);
  }

  return done();
}

describe('a raider dropping out of the trees', () => {
  beforeEach(() => {
    Math.random = seededRandom(3);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('waits in the trees over its shadow, then falls in from above the screen onto it', () => {
    const { game } = forestArena();

    startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 0 });
    const mark = markOf(game);
    expect(mark.x).toBe(HERO_X - DROP.gap);
    runTicks(game, DROP.warn - 1);
    expect(raiders(game)).toHaveLength(0);
    expect(pendingAmbushes(game)).toBe(1);
    runTicks(game, 1);
    const [raider] = raiders(game);
    expect(raider).toMatchObject({ kind: 'grunt', airborne: true, entering: false });
    expect(raider.y).toBeLessThan(0);
    expect(pendingAmbushes(game)).toBe(0);
    expect(tickUntil(game, () => !raider.airborne)).toBe(true);
    expect(Math.abs(raider.x - mark.x)).toBeLessThan(4);
    expect(raider.y).toBe(GROUND_Y);
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('falls with its weapon raised and lands striking, in the strike of its own swing', () => {
    const { game } = forestArena();

    startAmbush(game, { kind: 'jackal', ambush: 'drop', slot: 0 });
    runTicks(game, DROP.warn + 10);
    const [raider] = raiders(game);
    expect(enemySpriteFrame(raider)).toEqual(['attack', 1]);
    tickUntil(game, () => !raider.airborne);
    expect(raider.move.id).toBe('dropSlam');
    expect(raider.dropping).toBe(false);
  });

  it('knocks down a hero who stays on the shadow under it', () => {
    const { game } = forestArena();

    startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 2 });
    expect(markOf(game).x).toBe(HERO_X);
    tickUntil(game, () => game.player.hp < game.player.maxHp, DROP.warn + 120);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(['juggle', 'down']).toContain(game.player.state);
  });

  it('misses a hero who steps off the shadow before it lands', () => {
    const { game } = forestArena();

    startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 2 });
    runTicks(game, DROP.warn - 10);
    game.player.x = HERO_X + 70;
    tickUntil(game, () => raiders(game)[0] && !raiders(game)[0].airborne);
    runTicks(game, 12);
    expect(game.player.hp).toBe(game.player.maxHp);
  });
});

describe('the trees a raider drops out of', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("shake the road's own leaves down over the spot, and throw more as the branch gives way", () => {
    const { game } = forestArena();
    const { leaves } = PAINTED_THEMES.oldGrove.ambient;

    startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 0 });
    runTicks(game, DROP.warn - 1);
    const shaken = particles(game, 'leaf');
    expect(shaken.length).toBeGreaterThan(10);
    expect(shaken.every((leaf) => leaves.includes(leaf.color))).toBe(true);
    expect(shaken.every((leaf) => Math.abs(leaf.x - markOf(game).x) < 24)).toBe(true);
    runTicks(game, 1);
    expect(particles(game, 'leaf').length).toBe(shaken.length + DROP.burst);
  });

  it('let the leaves come to rest on the ground', () => {
    const { game } = forestArena();

    startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 0 });
    runTicks(game, DROP.warn + 120);
    const resting = particles(game, 'leaf').filter((leaf) => leaf.resting);
    expect(resting.length).toBeGreaterThan(0);
    expect(resting.every((leaf) => leaf.y === GROUND_Y - 1)).toBe(true);
  });

  it('startle fireflies out of the branches only on a road that has them', () => {
    const grove = forestArena('oldGrove').game;
    const hollow = forestArena('fireflyHollow').game;
    const { fireflies } = PAINTED_THEMES.fireflyHollow.ambient;

    for (const game of [grove, hollow]) {
      startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 0 });
      runTicks(game, 2);
    }

    expect(particles(grove, 'firefly')).toHaveLength(0);
    expect(particles(hollow, 'firefly')).toHaveLength(DROP.fireflies);
    expect(particles(hollow, 'firefly').every((fly) => fly.color === fireflies[0])).toBe(true);
  });

  it('rustle as the raider settles and as it gets ready, snap as it drops and thud as it lands', () => {
    const { game, sounds } = forestArena();

    startAmbush(game, { kind: 'grunt', ambush: 'drop', slot: 0 });
    runTicks(game, DROP.warn - 1);
    expect(sounds.filter((key) => key === 'rustle')).toHaveLength(2);
    runTicks(game, 1);
    expect(sounds).toContain('branchSnap');
    tickUntil(game, () => !raiders(game)[0].airborne);
    expect(sounds).toContain('blunt');
  });
});
