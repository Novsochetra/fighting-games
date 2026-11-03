import { describe, expect, it } from 'vitest';
import { VILLAGE_FIELD } from '../../../../src/art/venues/village-field.js';
import { FORMATS } from '../../../../src/data/formats.js';
import { packAll } from '../../../../src/render/venues/kit/colour.js';
import {
  puddleOf,
  puddleSurface,
  reachOf,
} from '../../../../src/render/venues/village-field/puddle.js';

const layout = { pitch: FORMATS['7'].pitch };
const puddle = puddleOf(layout);

describe('the village puddle’s shape', () => {
  it('is water in the middle of each of its pools', () => {
    for (const pool of puddle.pools) {
      expect(reachOf(puddle, pool.x, pool.y)).toBeLessThan(1);
    }
  });

  it('has a shore that wanders in and out round its main pool', () => {
    const main = puddle.pools[0];
    const reaches = Array.from({ length: 48 }, (_, i) => {
      const turn = (i / 48) * Math.PI * 2;

      return reachOf(
        puddle,
        main.x + Math.cos(turn) * main.radiusX,
        main.y + Math.sin(turn) * main.radiusY,
      );
    });

    expect(Math.max(...reaches) - Math.min(...reaches)).toBeGreaterThan(0.15);
  });

  it('leaves the rest of the field to the grass', () => {
    const surface = puddleSurface(layout, packAll(VILLAGE_FIELD));

    expect(surface(puddle.x + 300, puddle.y, 10, 10)).toBeNull();
    expect(surface(puddle.x, puddle.y - 120, 10, 10)).toBeNull();
    expect(surface(puddle.x, puddle.y, 10, 10)).not.toBeNull();
  });
});
