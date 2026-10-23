import { describe, expect, it } from 'vitest';
import { missionEnemySheets } from '../../../../src/data/missions/mission-enemies.js';
import {
  enemySheetReady,
  keepMissionEnemies,
  loadEnemySprites,
  missionEnemiesSettled,
} from '../../../../src/render/fighters/enemy-sheets.js';
import { createLateImages } from '../../../support/late-images.js';

function lateSheets() {
  const images = createLateImages();
  const sheets = loadEnemySprites({
    createImage: images.createImage,
    createCanvas: () => null,
    baseUrl: '',
  });
  return { sheets, images };
}

// Firefly Hollow brings back Gravel Khan, Pine Ridge's boss, as a mid-boss, but never its scavengers
const PINE_RIDGE = 0;
const FIREFLY_HOLLOW = 5;

describe("a mission's enemy sheets", () => {
  it("load as the mission asks for them, and the next mission's once they are in", () => {
    const { sheets, images } = lateSheets();
    expect(missionEnemiesSettled(sheets, PINE_RIDGE)).toBe(false);
    expect(Object.keys(sheets.images).sort()).toEqual([...missionEnemySheets(PINE_RIDGE)].sort());
    images.loadAll();
    expect(missionEnemiesSettled(sheets, PINE_RIDGE)).toBe(true);
    expect(Object.keys(sheets.images)).toContain('colossus');
  });

  it('let go of a sheet the new mission does not need, even one still on its way', () => {
    const { sheets, images } = lateSheets();
    keepMissionEnemies(sheets, PINE_RIDGE);
    keepMissionEnemies(sheets, FIREFLY_HOLLOW);
    images.loadAll();
    expect(sheets.images.scavenger).toBeUndefined();
    expect(sheets.ready.scavenger).toBeUndefined();
    expect(sheets.ready.khan).toBe(true);
  });

  it('take in a sheet the road does not list the first time it is drawn, until the mission changes', () => {
    const { sheets, images } = lateSheets();
    keepMissionEnemies(sheets, PINE_RIDGE);
    expect(enemySheetReady(sheets, 'naga')).toBe(false);
    images.loadAll();
    expect(enemySheetReady(sheets, 'naga')).toBe(true);
    keepMissionEnemies(sheets, PINE_RIDGE);
    expect(images.waiting()).toEqual([]);
    expect(sheets.ready.naga).toBe(true);
    keepMissionEnemies(sheets, FIREFLY_HOLLOW);
    expect(sheets.images.naga).toBeUndefined();
  });

  it('let the mission start when a sheet fails, but never draw from it', () => {
    const { sheets, images } = lateSheets();
    missionEnemiesSettled(sheets, PINE_RIDGE);
    images.failAll();
    expect(missionEnemiesSettled(sheets, PINE_RIDGE)).toBe(true);
    expect(enemySheetReady(sheets, 'khan')).toBe(false);
    expect(images.waiting().filter((src) => src.endsWith('khan.png'))).toEqual([]);
  });
});
