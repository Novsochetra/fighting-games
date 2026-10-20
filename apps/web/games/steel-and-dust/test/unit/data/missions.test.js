import { describe, expect, it } from 'vitest';
import { FOREST_THEMES } from '../../../src/art/forest-themes.js';
import { SCENE_THEMES } from '../../../src/art/scene-themes.js';
import { VIEW_WIDTH } from '../../../src/config.js';
import { isPaintedTheme } from '../../../src/data/backdrops.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { WEAPON_IDS } from '../../../src/data/weapons/index.js';

const kindsIn = (mission) =>
  mission.zones.flatMap((zone) => zone.waves.flatMap((wave) => wave.kinds));
const allKinds = new Set(MISSIONS.flatMap(kindsIn));
const bossTypes = Object.entries(ENEMY_TYPES).filter(([, type]) => type.boss);

describe('the twelve missions', () => {
  it('are twelve, each with its own name and a scene theme that exists', () => {
    expect(MISSIONS).toHaveLength(12);
    expect(new Set(MISSIONS.map((mission) => mission.name)).size).toBe(12);
    for (const mission of MISSIONS) {
      expect(
        SCENE_THEMES[mission.theme] ?? FOREST_THEMES[mission.theme],
        mission.name,
      ).toBeDefined();
    }
  });

  it('walk through the six forests from sunrise to night, out into the desert, then to the temples', () => {
    expect(MISSIONS.slice(0, 6).map((mission) => mission.theme)).toEqual([
      'pineRidge',
      'oldGrove',
      'bambooPass',
      'raiderCamp',
      'emberWoods',
      'fireflyHollow',
    ]);
    for (const mission of MISSIONS.slice(6, 10)) {
      expect(SCENE_THEMES[mission.theme], mission.name).toBeDefined();
    }
    expect(MISSIONS.slice(10).map((mission) => mission.theme)).toEqual(['angkorWat', 'bayon']);
    const painted = MISSIONS.filter((mission) => isPaintedTheme(mission.theme));
    expect(painted.map((mission) => mission.number)).toEqual([1, 2, 3, 4, 5, 6, 11, 12]);
  });

  it('close the temple roads with a temple gate and raise sandstone ledges along them', () => {
    for (const mission of MISSIONS.slice(10)) {
      expect(mission.props.at(-1).kind, mission.name).toBe('templeGate');
      expect(mission.terrain.platforms.length, mission.name).toBeGreaterThan(0);
      for (const platform of mission.terrain.platforms) {
        expect(platform.kind, mission.name).toBe('ledge');
      }
    }
  });

  it('only send in enemy kinds that exist', () => {
    for (const mission of MISSIONS) {
      for (const kind of [...kindsIn(mission), ...mission.reinforcements]) {
        expect(ENEMY_TYPES[kind], `${mission.name}: ${kind}`).toBeDefined();
      }
    }
  });

  it('meet every enemy type somewhere on the way', () => {
    expect([...allKinds].sort()).toEqual(Object.keys(ENEMY_TYPES).sort());
  });

  it('each end on their own boss, a different one every mission, the Bayon Guardian last', () => {
    for (const mission of MISSIONS) {
      expect(mission.zones.at(-1).boss, mission.name).toBe(mission.boss);
      expect(ENEMY_TYPES[mission.boss].boss, mission.name).toBe(true);
    }
    expect(new Set(MISSIONS.map((mission) => mission.boss)).size).toBe(bossTypes.length);
    expect(MISSIONS.at(-1).boss).toBe('guardian');
  });

  it('bring the Warden Ox back to guard the road of the finale', () => {
    const finale = MISSIONS.at(-1);
    expect(finale.zones.slice(0, -1).map((zone) => zone.boss)).toContain('brute');
  });

  it('bring back earlier bosses only as mid-bosses, never their own boss twice', () => {
    for (const mission of MISSIONS) {
      const midBosses = mission.zones.slice(0, -1).filter((zone) => zone.boss);
      for (const zone of midBosses) {
        expect(zone.boss, mission.name).not.toBe(mission.boss);
        expect(MISSIONS.findIndex((other) => other.boss === zone.boss)).toBeLessThan(mission.index);
      }
    }
  });

  it('keep zones in order, waves inside their zone, and everything on the road', () => {
    for (const mission of MISSIONS) {
      mission.zones.forEach((zone, i) => {
        expect(zone.left, mission.name).toBeGreaterThan(i ? mission.zones[i - 1].right : 0);
        expect(zone.right - zone.left).toBeGreaterThanOrEqual(VIEW_WIDTH);
        for (const wave of zone.waves) {
          expect(wave.at).toBeGreaterThanOrEqual(zone.left);
          expect(wave.at).toBeLessThan(zone.right);
          expect(wave.kinds.length).toBeLessThanOrEqual(4);
        }
        expect(zone.waves.at(-1).lock).toBe(true);
      });
      for (const thing of [...mission.crates, ...mission.props]) {
        expect(thing.x).toBeGreaterThan(0);
        expect(thing.x).toBeLessThanOrEqual(mission.length);
      }
    }
  });

  it('get longer zones as they go, with wide zones in every mission and the finale longest', () => {
    for (const mission of MISSIONS) {
      expect(
        mission.zones.some((zone) => zone.screens >= 2),
        mission.name,
      ).toBe(true);
    }
    expect(MISSIONS.at(-1).length).toBeGreaterThan(MISSIONS[0].length);
    expect(MISSIONS.at(-1).length).toBe(Math.max(...MISSIONS.map((mission) => mission.length)));
  });

  it('fill their crates with weapons and food that exist', () => {
    for (const mission of MISSIONS) {
      for (const crate of mission.crates) {
        expect([...WEAPON_IDS, 'ration'], mission.name).toContain(crate.item);
      }
    }
  });
});

describe('the enemy sprite sheets', () => {
  it('draw every enemy type with the strips it needs', () => {
    for (const type of Object.values(ENEMY_TYPES)) {
      const sprite = ENEMY_SPRITES[type.sprite];
      expect(sprite, type.name).toBeDefined();
      for (const strip of ['idle', 'walk', 'attack', 'hurt', 'ko']) {
        expect(sprite.strips[strip], `${type.name} ${strip}`).toBeDefined();
      }
      expect(sprite.strips.ko.frames, type.name).toBeGreaterThanOrEqual(9);
    }
  });

  it('give every boss a slam and a charge strip', () => {
    for (const [, type] of bossTypes) {
      expect(ENEMY_SPRITES[type.sprite].strips.slam, type.name).toBeDefined();
      expect(ENEMY_SPRITES[type.sprite].strips.charge, type.name).toBeDefined();
    }
  });
});
