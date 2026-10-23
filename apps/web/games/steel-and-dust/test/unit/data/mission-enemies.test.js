import { describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import {
  missionEnemyKinds,
  missionEnemySheets,
} from '../../../src/data/missions/mission-enemies.js';

const FIREFLY_HOLLOW = 5;

describe('the enemies a mission can call onto its road', () => {
  it('are its waves, its mid-bosses and boss, its reinforcements and the pack a boss howls in', () => {
    const kinds = missionEnemyKinds(FIREFLY_HOLLOW);
    expect(kinds).toContain('gnoll');
    expect(kinds).toContain('khan');
    for (const kind of MISSIONS[FIREFLY_HOLLOW].reinforcements) {
      expect(kinds).toContain(kind);
    }
    expect(kinds).toContain('hound');
  });

  it('are known enemies, each drawn from a sheet', () => {
    MISSIONS.forEach((mission, index) => {
      for (const kind of missionEnemyKinds(index)) {
        expect(ENEMY_SPRITES[ENEMY_TYPES[kind]?.sprite], `${mission.name} ${kind}`).toBeDefined();
      }
      expect(missionEnemySheets(index), mission.name).toContain(ENEMY_TYPES[mission.boss].sprite);
    });
  });
});
