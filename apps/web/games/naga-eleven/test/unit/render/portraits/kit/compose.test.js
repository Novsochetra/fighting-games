import { describe, expect, it } from 'vitest';
import { cellAt } from '../../../../../src/render/portraits/grid.js';
import { SKULL_AT, composeKitFace } from '../../../../../src/render/portraits/kit/compose.js';
import { decodePart } from '../../../../../src/render/portraits/kit/decode.js';

const FACE = decodePart('3 3 1 0|abc/aaa/aaa');
const HAIR = decodePart('3 4 1 2|.h/h3/h3/h3');
const HAT = decodePart('3 1 1 0|F3');

const at = (grid, dx, dy) => cellAt(grid, SKULL_AT.x + dx, SKULL_AT.y + dy);

describe('a face from the kit', () => {
  it('stands with the top of its skull on the frame’s point', () => {
    const grid = composeKitFace({ face: FACE });

    expect(at(grid, 0, 0)).toBe('2');
    expect(at(grid, -1, 0)).toBe('1');
    expect(at(grid, 0, -1)).toBeNull();
  });

  it('wears its hair lined up by the same point', () => {
    const grid = composeKitFace({ face: FACE, hair: HAIR });

    expect(at(grid, 0, -2)).toBe('h');
    expect(at(grid, 1, 1)).toBe('h');
    expect(at(grid, 1, 2)).toBe('1');
  });

  it('wears a band over standing hair, which still shows over it', () => {
    const grid = composeKitFace({ face: FACE, hair: HAIR, gear: HAT });

    expect(at(grid, 0, 0)).toBe('F');
    expect(at(grid, 0, -2)).toBe('h');
  });

  it('hides the hair under a hat that covers it', () => {
    const grid = composeKitFace({ face: FACE, hair: HAIR, gear: HAT, covers: true });

    expect(at(grid, 0, -2)).toBeNull();
    expect(at(grid, 0, 0)).toBe('F');
  });
});
