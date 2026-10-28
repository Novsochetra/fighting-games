import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const art = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/spikeTrap.png'));
const { frameWidth, frameHeight, anchorY } = FX_SPRITES.spikeTrap;
const PHASE = { rest: 0, warn: 1, rise: 2, up: 3, sink: 4 };
// the tile's top face runs from the road line its far edge lies on down to its lit lip
const FAR_EDGE = anchorY;
const NEAR_EDGE = frameHeight - 1;
// the middle column of each slot, and the row its opening starts on
const SLOTS = [18, 29, 39, 50, 61];
const SLOT_TOP = 25;
const SPIKE_HALF = 3;

const pixelAt = (frame, x, y) => {
  const at = frame * frameWidth + x;

  return art.alpha(at, y) ? art.colorKey(at, y) : -1;
};

function topRow(frame) {
  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (pixelAt(frame, x, y) !== -1) {
        return y;
      }
    }
  }

  return frameHeight;
}

// the highest row where something comes up over the resting face
function risenTo(frame) {
  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (pixelAt(frame, x, y) !== pixelAt(PHASE.rest, x, y)) {
        return y;
      }
    }
  }

  return frameHeight;
}

const widthAt = (y) => {
  let count = 0;
  for (let x = 0; x < frameWidth; x++) {
    count += pixelAt(PHASE.rest, x, y) === -1 ? 0 : 1;
  }

  return count;
};

const brightness = (y) =>
  art.rgb(Math.floor(frameWidth / 2), y).reduce((sum, value) => sum + value);

// every pixel of the slot's spike over the face, as one string to compare
function spikeOver(frame, slot) {
  const pixels = [];
  for (let y = 0; y < FAR_EDGE; y++) {
    for (let x = slot - SPIKE_HALF; x <= slot + SPIKE_HALF; x++) {
      pixels.push(pixelAt(frame, x, y));
    }
  }

  return pixels.join(',');
}

describe('a spike trap as drawn', () => {
  it('lies flush in the road: at rest nothing of it stands over the road line', () => {
    expect(topRow(PHASE.rest)).toBe(FAR_EDGE);
  });

  it('shows only its top face, narrower at its dark far edge than at its lit near one', () => {
    expect(widthAt(FAR_EDGE)).toBeLessThan(widthAt(NEAR_EDGE));
    expect(brightness(FAR_EDGE)).toBeLessThan(brightness(NEAR_EDGE));
  });

  it('pushes the same spike up out of every slot', () => {
    const middle = spikeOver(PHASE.up, SLOTS[2]);

    expect(middle).toMatch(/\d{2,}/);
    for (const slot of SLOTS) {
      expect(spikeOver(PHASE.up, slot), `slot at ${slot}`).toBe(middle);
    }
  });

  it('raises its spikes out of the slots as they shoot up, and lowers them as they sink', () => {
    const [rise, up, sink] = [PHASE.rise, PHASE.up, PHASE.sink].map(risenTo);

    expect(rise).toBeLessThan(SLOT_TOP);
    expect(up).toBeLessThan(rise);
    expect(sink).toBeGreaterThan(rise);
  });

  it('puffs its warning dust up off the face', () => {
    expect(topRow(PHASE.warn)).toBeLessThan(FAR_EDGE - 4);
  });
});
