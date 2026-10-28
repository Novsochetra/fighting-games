import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const ROOT = join(import.meta.dirname, '../../../');
const ROADS = Object.entries(PAINTED_BACKDROPS).filter(([, backdrop]) => backdrop.perches);
// a raider is about this wide and tall where the leaves have to hide it
const BODY = { half: 12, tall: 36 };

function paintingOf(backdrop) {
  const { folder, perches } = backdrop;

  return readPngAlpha(join(ROOT, `assets/backdrops/${folder}/${perches.layer}.png`));
}

const spotsOf = (kind) =>
  ROADS.flatMap(([road, backdrop]) =>
    backdrop.perches.spots
      .filter((spot) => spot.kind === kind)
      .map((spot) => ({ road, spot, painting: paintingOf(backdrop) })),
  );

function hidden(painting, { x, y }) {
  let painted = 0;

  for (let column = x - BODY.half; column < x + BODY.half; column++) {
    for (let row = y - BODY.tall; row < y; row++) {
      painted += painting.alpha(column, row) > 0 ? 1 : 0;
    }
  }

  return painted / (BODY.half * 2 * BODY.tall);
}

function topOf(painting, column) {
  let row = 0;

  while (painting.alpha(column, row) === 0) {
    row++;
  }

  return row;
}

const gapsAlong = (painting, { from, to }, row) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i).filter(
    (column) => painting.alpha(column, row) === 0,
  );

describe('the perches raiders drop from', () => {
  it('are on six roads, in a repeating layer as wide as its painting', () => {
    expect(ROADS.map(([road]) => road).sort()).toEqual(
      ['bayon', 'emberWoods', 'ironWorks', 'pineRidge', 'raiderCamp', 'wardenFortress'].sort(),
    );
    for (const [road, backdrop] of ROADS) {
      const layer = backdrop.layers.find((one) => one.name === backdrop.perches.layer);

      expect(layer?.once, road).toBeFalsy();
      expect(paintingOf(backdrop).width, road).toBe(backdrop.perches.tileWidth);
    }
  });

  it('hide a raider in the painted thick of a crown', () => {
    for (const { road, spot, painting } of spotsOf('crown')) {
      expect(hidden(painting, spot), `${road} ${spot.x}`).toBeGreaterThan(0.8);
      expect(spot.top < spot.y && spot.y < spot.bottom, `${road} ${spot.x}`).toBe(true);
    }
  });

  it('stand a raider on a ledge or a walkway painted all along, never over a gap', () => {
    for (const { road, spot, painting } of spotsOf('ledge')) {
      expect(gapsAlong(painting, spot, spot.y), `${road} ${spot.from}`).toEqual([]);
    }
  });

  it('stand a raider behind a wall, all of whose top is laid back over it, merlons and gaps', () => {
    for (const { road, spot, painting } of spotsOf('ledge').filter((ledge) => ledge.spot.wall)) {
      for (let column = spot.from; column <= spot.to; column++) {
        const top = topOf(painting, column);

        expect(top >= spot.wall && top <= spot.y, `${road} ${column}`).toBe(true);
      }
    }
  });
});
