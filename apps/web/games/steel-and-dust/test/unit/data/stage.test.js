import { describe, expect, it } from 'vitest';
import { WORLD_WIDTH } from '../../../src/config.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { CRATES, PROPS, REINFORCEMENT_KINDS, ZONES } from '../../../src/data/stage.js';

const kindsInZones = new Set(ZONES.flatMap((zone) => zone.waves.flat()));

describe('the stage', () => {
  it('only sends in enemy kinds that exist', () => {
    for (const kind of [...kindsInZones, ...REINFORCEMENT_KINDS]) {
      expect(ENEMY_TYPES[kind], kind).toBeDefined();
    }
  });

  it('meets every enemy type somewhere on the road', () => {
    expect([...kindsInZones].sort()).toEqual(Object.keys(ENEMY_TYPES).sort());
  });

  it('ends with the one final boss, after two mid-bosses', () => {
    const bossZones = ZONES.filter((zone) => zone.boss);
    expect(bossZones).toHaveLength(3);
    const finals = Object.values(ENEMY_TYPES).filter((type) => type.final);
    expect(finals.map((type) => type.name)).toEqual(['Warden Ox']);
    expect(ZONES.at(-1).waves).toEqual([['brute']]);
  });

  it('keeps zones in order and everything inside the world', () => {
    for (let i = 1; i < ZONES.length; i++) {
      expect(ZONES[i].at).toBeGreaterThan(ZONES[i - 1].at);
    }
    for (const thing of [...CRATES, ...PROPS]) {
      expect(thing.x).toBeLessThanOrEqual(WORLD_WIDTH);
    }
    expect(ZONES.at(-1).right).toBeLessThanOrEqual(WORLD_WIDTH);
  });

  it('draws every enemy type from a sprite sheet with the strips it needs', () => {
    for (const type of Object.values(ENEMY_TYPES)) {
      const sprite = ENEMY_SPRITES[type.sprite];
      expect(sprite, type.name).toBeDefined();
      for (const strip of ['idle', 'walk', 'attack', 'hurt', 'ko']) {
        expect(sprite.strips[strip], `${type.name} ${strip}`).toBeDefined();
      }
      expect(sprite.strips.ko.frames, type.name).toBeGreaterThanOrEqual(9);
    }
  });

  it('gives every boss a slam and a charge strip', () => {
    for (const type of Object.values(ENEMY_TYPES).filter((entry) => entry.boss)) {
      expect(ENEMY_SPRITES[type.sprite].strips.slam, type.name).toBeDefined();
      expect(ENEMY_SPRITES[type.sprite].strips.charge, type.name).toBeDefined();
    }
  });
});
