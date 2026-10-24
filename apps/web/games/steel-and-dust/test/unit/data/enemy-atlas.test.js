import { describe, expect, it } from 'vitest';
import { ENEMY_ATLAS } from '../../../src/data/enemies/atlas/index.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { packedMismatches } from '../../support/packed-sheets.js';

const SHEETS = new URL('../../../assets/sprites/enemies/', import.meta.url);

function sheetMismatches(id) {
  const sprite = ENEMY_SPRITES[id];
  return packedMismatches({
    gridPath: new URL(sprite.file, SHEETS),
    packedPath: new URL(`packed/${sprite.file}`, SHEETS),
    frameWidth: sprite.frameWidth,
    frameHeight: sprite.frameHeight,
    rows: ENEMY_ATLAS[id],
  });
}

describe('the packed enemy sheets', () => {
  it('have a table of pieces for every enemy sheet', () => {
    expect(Object.keys(ENEMY_ATLAS).sort()).toEqual(Object.keys(ENEMY_SPRITES).sort());
  });

  // a grid sheet changed without running tools/pack_enemy_sheets.py again fails here; a sheet at
  // a time, as every sheet in one test took most of its time limit
  it.each(Object.keys(ENEMY_SPRITES))(
    'hold every frame of the %s grid sheet pixel for pixel, with only empty space cut away',
    (id) => {
      expect(sheetMismatches(id)).toEqual([]);
    },
  );
});
