import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { TEMPLE_BOSSES } from '../../../src/data/enemies/types/temple-bosses.js';
import { pngSize } from '../../support/png-size.js';

const DIRECTORY = new URL('../../../assets/sprites/enemies/', import.meta.url);
const sheetSize = (sprite) => pngSize(fileURLToPath(new URL(sprite.file, DIRECTORY)));
const bosses = Object.values(ENEMY_TYPES).filter((type) => type.boss);

describe('the enemy sprite sheets', () => {
  it('hold every strip inside the sheet, and its strike frame inside the strip', () => {
    for (const [id, sprite] of Object.entries(ENEMY_SPRITES)) {
      const { width, height } = sheetSize(sprite);
      for (const [name, strip] of Object.entries(sprite.strips)) {
        expect(strip.frames * sprite.frameWidth, `${id} ${name}`).toBeLessThanOrEqual(width);
        expect((strip.row + 1) * sprite.frameHeight, `${id} ${name}`).toBeLessThanOrEqual(height);
        expect(strip.strike ?? 0, `${id} ${name}`).toBeLessThan(strip.frames);
      }
    }
  });
});

describe('the Naga Raja', () => {
  // drawn new, not recolored from the Cobra Matriarch, and half as big again as the other bosses:
  // her hoods and crown reach high and her coil and slash far ahead
  it('has a sheet of her own, with a row for each move of her own', () => {
    const naga = ENEMY_SPRITES.naga;
    expect({ width: naga.frameWidth, height: naga.frameHeight }).toEqual({
      width: 384,
      height: 240,
    });
    expect(Object.keys(naga.strips)).toEqual([
      'idle',
      'walk',
      'attack',
      'hurt',
      'ko',
      'slam',
      'charge',
      'tidalCoil',
      'sevenHeads',
      'rainbowNaga',
    ]);
  });
});

describe('the temple bosses', () => {
  it('are bosses, each drawn from its own sheet', () => {
    for (const [kind, type] of Object.entries(TEMPLE_BOSSES)) {
      expect(ENEMY_TYPES[kind], kind).toBe(type);
      expect(type.boss, kind).toBe(true);
      expect(ENEMY_SPRITES[type.sprite].file, kind).toBe(`${kind}.png`);
    }
  });

  it('end the game on the Bayon Guardian, the strongest boss of all', () => {
    const others = bosses.filter((type) => type !== TEMPLE_BOSSES.guardian);
    expect(TEMPLE_BOSSES.guardian.hp).toBeGreaterThan(Math.max(...others.map((type) => type.hp)));
  });

  it('make the Naga Raja quicker and tougher than the Cobra Matriarch she is drawn from', () => {
    expect(TEMPLE_BOSSES.naga.speed).toBeGreaterThan(ENEMY_TYPES.cobra.speed);
    expect(TEMPLE_BOSSES.naga.hp).toBeGreaterThan(ENEMY_TYPES.cobra.hp);
  });
});
