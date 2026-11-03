import { describe, expect, it } from 'vitest';
import { COVERING_GEAR, KIT_FACES, KIT_HAIR } from '../../../src/art/face-kit/index.js';
import { cellAt } from '../../../src/render/portraits/grid.js';
import { SKULL_AT, composeKitFace, kitLayers } from '../../../src/render/portraits/kit/compose.js';
import { facePart, gearPart, hairPart } from '../../../src/render/portraits/kit/parts.js';

// The first kit put the hair on and the hat over it, so a mohawk, a top knot or spikes stood up
// out of a beanie; cut at the hat's columns only, curls still stuck out beside it and hung in
// front of the face below the brim

const HAIR_LETTERS = new Set(['H', 'h', 'g', 'k']);

function hairShowing(grid) {
  const found = [];

  for (let y = 0; y < grid.size; y += 1) {
    for (let x = 0; x < grid.size; x += 1) {
      if (HAIR_LETTERS.has(cellAt(grid, x, y))) {
        found.push({ x, y });
      }
    }
  }

  return found;
}

function brimOf(hat, x) {
  const columns = [...new Set(hat.map((cell) => cell.x))];
  const nearest = columns.reduce((best, column) =>
    Math.abs(column - x) < Math.abs(best - x) ? column : best,
  );

  return Math.max(...hat.filter((cell) => cell.x === nearest).map((cell) => cell.y));
}

const CASES = [...COVERING_GEAR].flatMap((gear) =>
  Object.keys(KIT_FACES).flatMap((face) => Object.keys(KIT_HAIR).map((hair) => [gear, face, hair])),
);

describe('hair under a cap or a beanie', () => {
  it.each(CASES)('stays under the %s on the %s face with %s hair', (gear, face, hair) => {
    const mood = KIT_FACES[face].neutral ? 'neutral' : 'angry';
    const parts = { face: facePart(face, mood), hair: hairPart(hair), gear: gearPart(gear) };
    const hat = kitLayers(parts).gearCells;
    const showing = hairShowing(composeKitFace({ ...parts, covers: true }));

    expect(showing.filter(({ x, y }) => y <= brimOf(hat, x))).toEqual([]);
    expect(showing.filter(({ x }) => x > SKULL_AT.x)).toEqual([]);
  });

  it('shows the hair hanging at the back of the neck under a cap', () => {
    const parts = { face: facePart('hero', 'neutral'), hair: hairPart('long-back') };
    const grid = composeKitFace({ ...parts, gear: gearPart('cap'), covers: true });

    expect(hairShowing(grid).length).toBeGreaterThan(0);
  });
});
