import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FX_SCALE, FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { tileKind } from '../../../src/render/scene/spike-traps.js';
import { createSpikeTraps } from '../../../src/sim/hazards/spike-traps.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const art = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/spikeTrap.png'));
const { frameWidth, frameHeight, anchorY } = FX_SPRITES.spikeTrap;
const PHASE = { rest: 0, warn: 1, rise: 2, up: 3, sink: 4 };
const PHASES = Object.keys(PHASE).length;
const KINDS = { alone: 0, leftEnd: 1, middle: 2, rightEnd: 3 };
// the first and last columns of a tile's line, the one it shares with the next tile in its row
const LINE = { left: 1, right: 76 };
// the tile's top face runs from the road line its far edge lies on down to its lit lip
const FAR_EDGE = anchorY;
const NEAR_EDGE = frameHeight - 1;
// a row through the back row of slots and one through the front row, and the row the back
// row's openings start on
const BACK_SLOTS = 27;
const FRONT_SLOTS = 38;
const SLOT_TOP = 25;
const SPIKE_HALF = 3;
// how deep the Mirage Temple road's top is, from the road line to where its brick face begins
const ROAD_DEPTH = 13;

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

// the columns inside the face's sloping sides, which are outlined dark too
const INSIDE = { from: 9, to: 70 };

// the middle of each dark run along a row inside the sides: the slots of a row of them, or the
// spikes' tips
function runMiddles(frame, y, isDark) {
  const middles = [];
  let start = null;
  for (let x = INSIDE.from; x <= INSIDE.to; x++) {
    const inRun = x < INSIDE.to && isDark(pixelAt(frame, x, y));
    if (inRun && start === null) {
      start = x;
    } else if (!inRun && start !== null) {
      middles.push(Math.floor((start + x - 1) / 2));
      start = null;
    }
  }

  return middles;
}

const darkSlot = (colour) => colour !== -1 && ((colour >> 16) & 255) < 120;
const painted = (colour) => colour !== -1;

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

  it('covers the road from its far edge to its near one, with a front row of slots', () => {
    const back = runMiddles(PHASE.rest, BACK_SLOTS, darkSlot);
    const front = runMiddles(PHASE.rest, FRONT_SLOTS, darkSlot);

    expect(Math.abs((NEAR_EDGE - FAR_EDGE) * FX_SCALE - ROAD_DEPTH)).toBeLessThanOrEqual(1);
    expect(back).toHaveLength(5);
    expect(front).toHaveLength(5);
    expect(front.at(-1) - front[0]).toBeGreaterThan(back.at(-1) - back[0]);
  });

  it('pushes the same spike up out of every slot', () => {
    const tips = runMiddles(PHASE.up, risenTo(PHASE.up) + 2, painted);
    const first = spikeOver(PHASE.up, tips[0]);

    expect(tips).toHaveLength(5);
    expect(first).toMatch(/\d{2,}/);
    for (const tip of tips) {
      expect(spikeOver(PHASE.up, tip), `spike at ${tip}`).toBe(first);
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

const solidDown = (frame, x) => {
  for (let y = FAR_EDGE; y <= NEAR_EDGE; y++) {
    if (pixelAt(frame, x, y) === -1) {
      return false;
    }
  }

  return true;
};

describe('a row of spike tiles as drawn', () => {
  it('lays its tiles as one strip: the left end, the middle and the right end', () => {
    const row = createSpikeTraps([{ x: 400, y: 184 }]);
    const tile = { x: 400, y: 184 };

    expect(row.map((each) => tileKind(row, each))).toEqual([
      KINDS.leftEnd,
      KINDS.middle,
      KINDS.rightEnd,
    ]);
    expect(tileKind([tile], tile)).toBe(KINDS.alone);
    expect(FX_SPRITES.spikeTrap.frames).toBe(PHASES * Object.keys(KINDS).length);
  });

  it('runs straight down the line two tiles share, and slopes only at the row’s two ends', () => {
    for (let phase = 0; phase < PHASES; phase++) {
      const [leftEnd, middle, rightEnd] = [KINDS.leftEnd, KINDS.middle, KINDS.rightEnd].map(
        (kind) => kind * PHASES + phase,
      );

      expect(solidDown(leftEnd, LINE.right), `phase ${phase}`).toBe(true);
      expect(solidDown(middle, LINE.left) && solidDown(middle, LINE.right)).toBe(true);
      expect(solidDown(rightEnd, LINE.left), `phase ${phase}`).toBe(true);
      expect(solidDown(leftEnd, LINE.left)).toBe(false);
      expect(solidDown(rightEnd, LINE.right)).toBe(false);
    }
  });
});
