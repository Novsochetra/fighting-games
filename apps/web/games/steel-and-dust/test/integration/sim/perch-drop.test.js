import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { DROP } from '../../../src/data/ambush.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { startAmbush } from '../../../src/sim/stage/ambush.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HERO_X = 180;

function onRoad(theme, cameraX = 0) {
  const sounds = [];
  const game = createPlayingGame({ io: { sfx: (key) => sounds.push(key) } });

  game.missionIndex = MISSIONS.findIndex((mission) => mission.theme === theme);
  game.arena = { left: 0, right: 384 * 20 };
  game.camera.x = cameraX;
  game.player.x = cameraX + HERO_X;

  return { game, sounds };
}

const markOf = (game) => game.projectiles.find((shot) => shot.kind === 'dropMark');
const raiders = (game) => game.fighters.filter((fighter) => fighter.side === 'enemy');
const particles = (game, kind) => game.particles.filter((particle) => particle.kind === kind);

function ambushOn(theme, cameraX) {
  const road = onRoad(theme, cameraX);

  startAmbush(road.game, { kind: 'grunt', ambush: 'drop', slot: 0 });

  return { ...road, mark: markOf(road.game) };
}

describe('a raider dropping out of a tree on the road', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("hides in a pine, shaking the road's own needles down out of its crown", () => {
    const { game, mark } = ambushOn('pineRidge');
    const { debris } = PAINTED_THEMES.pineRidge;

    expect(mark.perch.kind).toBe('crown');
    runTicks(game, DROP.warn - 1);
    const needles = particles(game, 'leaf');
    expect(needles.length).toBeGreaterThan(10);
    expect(needles.every((needle) => debris.includes(needle.color))).toBe(true);
    expect(needles.every((needle) => needle.y >= mark.perch.top)).toBe(true);
    expect(raiders(game)).toHaveLength(0);
  });

  it('drops out of the thick of the crown where it hid', () => {
    const { game, mark } = ambushOn('emberWoods');

    runTicks(game, DROP.warn);
    expect(mark.raider).toMatchObject({ y: mark.perch.y, vy: 0, dropping: true });
    expect(mark.raider.x).toBe(mark.x);
  });
});

describe('a raider dropping off a ledge on the road', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('climbs onto ironwork knocking rust loose, then leaps off it with a clank', () => {
    const { game, sounds, mark } = ambushOn('ironWorks', 4800);

    expect(mark.perch.kind).toBe('ledge');
    runTicks(game, DROP.climb);
    expect(particles(game, 'grit').length).toBeGreaterThan(3);
    expect(sounds).toContain('gritTrickle');
    runTicks(game, DROP.warn - DROP.climb);
    expect(mark.raider.y).toBe(mark.perch.y);
    expect(mark.raider.vy).toBeLessThan(0);
    expect(sounds).toContain('clank');
  });

  it('springs up onto the wall it waited behind before it leaps', () => {
    const { game, sounds, mark } = ambushOn('wardenFortress', 2047);

    expect(mark.perch.wall).toBeLessThan(mark.perch.y);
    runTicks(game, DROP.warn);
    expect(mark.raider.y).toBe(mark.perch.wall);
    expect(sounds).toContain('perchLeap');
  });

  it('knocks loose grit that drops, bounces once off the road and lies there', () => {
    const { game } = ambushOn('bayon', 1657);

    runTicks(game, 3);
    const [grain] = particles(game, 'grit');
    const bounced = [];
    for (let tick = 0; tick < 60 && !grain.resting; tick++) {
      runTicks(game, 1);
      bounced.push(grain.bounced);
    }
    expect(grain.resting).toBe(true);
    expect(bounced.filter(Boolean).length).toBeGreaterThan(0);
  });
});

describe('a raider waiting on a perch as the road scrolls', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('keeps to its tree, its shadow sliding along the road under it', () => {
    const { game, mark } = ambushOn('pineRidge');
    const before = mark.x;

    game.camera.x = 40;
    runTicks(game, 1);
    expect(mark.x - before).toBeCloseTo(40 * (1 - mark.perch.parallax), 5);
  });

  it('walks in as any raider does when nothing it could wait on is in sight', () => {
    const { game, mark } = ambushOn('ironWorks', 1000 / 0.45);

    expect(mark).toBeUndefined();
    expect(
      raiders(game).filter((raider) => raider.kind === 'grunt' && raider.entering),
    ).toHaveLength(1);
  });
});
