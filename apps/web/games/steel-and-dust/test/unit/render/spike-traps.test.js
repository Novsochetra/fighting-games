import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { SPIKE_TRAP } from '../../../src/data/spike-traps.js';
import { tileKind } from '../../../src/render/scene/spike-traps.js';
import { createSpikeTraps } from '../../../src/sim/hazards/spike-traps.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const art = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/spikeTrap.png'));
const { frameWidth, anchorX } = FX_SPRITES.spikeTrap;
const PHASES = 5;
const KINDS = { alone: 0, leftEnd: 1, middle: 2, rightEnd: 3 };
// the rows of the slab, from its top outline down to the outline under its face
const SLAB = { top: 16, bottom: 42 };
// a tile's half of the line it shares with the next one, either side of its anchor
const HALF_PITCH = SPIKE_TRAP.pitch * 2 * 0.5;

const solidDown = (frame, x) => {
  for (let y = SLAB.top; y <= SLAB.bottom; y++) {
    if (!art.alpha(frame * frameWidth + x, y)) {
      return false;
    }
  }

  return true;
};

describe('a row of spike tiles as drawn', () => {
  it('joins its tiles into one slab: the left end, the middle and the right end', () => {
    const row = createSpikeTraps([{ x: 400, y: 184 }]);

    expect(row.map((tile) => tileKind(row, tile))).toEqual([
      KINDS.leftEnd,
      KINDS.middle,
      KINDS.rightEnd,
    ]);
  });

  it('draws a tile with no neighbour on its own, sloping off at both ends', () => {
    const tile = { x: 400, y: 184 };
    const far = { x: 400 + SPIKE_TRAP.pitch * 2, y: 184 };

    expect(tileKind([tile, far], tile)).toBe(KINDS.alone);
  });

  it('has no notch where two tiles meet: the slab runs full height to the line they share', () => {
    for (let phase = 0; phase < PHASES; phase++) {
      const leftEnd = KINDS.leftEnd * PHASES + phase;
      const rightEnd = KINDS.rightEnd * PHASES + phase;
      const middle = KINDS.middle * PHASES + phase;

      expect(solidDown(leftEnd, anchorX + HALF_PITCH), `phase ${phase}`).toBe(true);
      expect(solidDown(rightEnd, anchorX - HALF_PITCH), `phase ${phase}`).toBe(true);
      expect(solidDown(middle, anchorX + HALF_PITCH), `phase ${phase}`).toBe(true);
      expect(solidDown(middle, anchorX - HALF_PITCH), `phase ${phase}`).toBe(true);
    }
  });

  it('keeps the sloping ends where a row begins and ends', () => {
    expect(solidDown(KINDS.leftEnd * PHASES, anchorX - HALF_PITCH)).toBe(false);
    expect(solidDown(KINDS.rightEnd * PHASES, anchorX + HALF_PITCH)).toBe(false);
    expect(FX_SPRITES.spikeTrap.frames).toBe(PHASES * Object.keys(KINDS).length);
  });
});
