import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const art = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/spikeTrap.png'));
const { frameWidth, frameHeight, anchorY } = FX_SPRITES.spikeTrap;
const PHASE = { rest: 0, warn: 1, rise: 2, up: 3, sink: 4 };
// the top row of the grate itself, and the middle column of each of its slots
const GRATE_TOP = anchorY + 1;
const SLOTS = [8, 19, 29, 40, 51];
const SPIKE_HALF = 3;

function topRow(frame, from = 0, to = frameWidth) {
  for (let y = 0; y < frameHeight; y++) {
    for (let x = from; x < to; x++) {
      if (art.alpha(frame * frameWidth + x, y)) {
        return y;
      }
    }
  }

  return frameHeight;
}

// every pixel of the slot's spike over the grate, as one string to compare
function spikeColumns(frame, slot) {
  const pixels = [];
  for (let y = 0; y < GRATE_TOP; y++) {
    for (let x = slot - SPIKE_HALF; x <= slot + SPIKE_HALF; x++) {
      const at = frame * frameWidth + x;
      pixels.push(art.alpha(at, y) ? art.colorKey(at, y) : -1);
    }
  }

  return pixels.join(',');
}

describe('a spike trap as drawn', () => {
  it('is a flat grate set into the road, nothing of it standing over the road line at rest', () => {
    expect(topRow(PHASE.rest)).toBe(GRATE_TOP);
    expect(topRow(PHASE.sink)).toBeGreaterThanOrEqual(GRATE_TOP);
  });

  it('is let into the road: narrower at its far edge, which is dark, than at its lit near edge', () => {
    const nearEdge = frameHeight - 1;
    const width = (y) => {
      let count = 0;
      for (let x = 0; x < frameWidth; x++) {
        count += art.alpha(x, y) ? 1 : 0;
      }

      return count;
    };
    const brightness = (y) =>
      art.rgb(Math.floor(frameWidth / 2), y).reduce((sum, value) => sum + value);

    expect(width(GRATE_TOP)).toBeLessThan(width(nearEdge));
    expect(width(nearEdge)).toBe(frameWidth);
    expect(brightness(GRATE_TOP)).toBeLessThan(brightness(nearEdge));
  });

  it('pushes the same spike up out of every slot', () => {
    const middle = spikeColumns(PHASE.up, SLOTS[2]);

    expect(middle).toMatch(/\d{2,}/);
    for (const slot of SLOTS) {
      expect(spikeColumns(PHASE.up, slot), `slot at ${slot}`).toBe(middle);
    }
  });

  it('raises its spikes higher as they shoot up, and lower again as they sink back', () => {
    const tips = [PHASE.rise, PHASE.up, PHASE.sink].map((frame) => topRow(frame));

    expect(tips[1]).toBeLessThan(tips[0]);
    expect(tips[0]).toBeLessThan(GRATE_TOP);
    expect(tips[2]).toBeGreaterThan(tips[0]);
  });

  it('puffs its warning dust up off the grate', () => {
    expect(topRow(PHASE.warn)).toBeLessThan(GRATE_TOP - 4);
  });
});
