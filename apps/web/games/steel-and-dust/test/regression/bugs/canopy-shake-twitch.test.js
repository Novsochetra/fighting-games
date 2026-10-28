import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { OLD_GROVE } from '../../../src/data/backdrops/old-grove.js';
import { drawCanopyRustle } from '../../../src/render/scene/canopy-rustle.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

// The Old Grove's canopy shook over a raider about to drop in 10 by 3 blocks, each jumping by
// whole pixels on its own: the boughs tore into a grid of steps, the vines into staircases, and
// pixels flicked back and forth from one frame to the next. Read from what is drawn alone, every
// pixel of the trees has to move at most a pixel a tick, and never there and straight back.
const NEAR = { name: 'near', width: 384, parallax: 0.45 };
const CAMERA_X = 1368;
const image = (name, width) => ({ width, height: 216, recordingId: () => name });
const BACKDROP = {
  canopy: OLD_GROVE.canopy,
  layers: [
    { name: 'back', image: image('back', 320), parallax: 0.08, ready: true },
    { name: 'near', image: image('near', NEAR.width), parallax: NEAR.parallax, ready: true },
  ],
};
const origin = Math.round(-((CAMERA_X * NEAR.parallax) % NEAR.width));
const wrapped = (value) =>
  ((((value + NEAR.width / 2) % NEAR.width) + NEAR.width) % NEAR.width) - NEAR.width / 2;

// where each pixel of the near layer drawn this tick was taken from, back from where it lies; rows
// laid from one row of the painting stretched (above its top) are taken from that row
function movedPixels(log) {
  const moved = new Map();
  const lay = ([sourceX, sourceY, width, height, x, y, , tall]) => {
    for (let i = 0; i < width * tall; i++) {
      const row = y + Math.floor(i / width);
      const from = sourceY + Math.floor(((row - y) * height) / tall);

      moved.set(`${x + (i % width)},${row}`, `${wrapped(x - origin - sourceX)},${row - from}`);
    }
  };

  log
    .filter((call) => call.startsWith('drawImage(near,'))
    .forEach((call) => lay(call.slice(15, -1).split(',').map(Number)));

  return moved;
}

function playDrop() {
  const mark = { kind: 'dropMark', x: CAMERA_X + 117, time: 0, raider: null };
  const setLayer = Object.assign(() => {}, { shake: { x: 0, y: 0 } });

  return Array.from({ length: DROP.warn + 36 }, (_, tick) => {
    const { context, log } = createRecordingContext(null);

    Object.assign(mark, { time: tick, raider: tick >= DROP.warn ? {} : null });
    drawCanopyRustle({ context }, setLayer, {
      game: { projectiles: [mark] },
      backdrop: BACKDROP,
      cameraX: CAMERA_X,
    });

    return movedPixels(log);
  });
}

const at = (frame, key) => frame.get(key) ?? '0,0';
const apart = (one, other) => {
  const [ax, ay] = one.split(',').map(Number);
  const [bx, by] = other.split(',').map(Number);

  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
};

const keysOf = (...frames) => new Set(frames.flatMap((frame) => [...frame.keys()]));

function biggestStep(frames) {
  let biggest = 0;

  frames.slice(1).forEach((frame, i) => {
    for (const key of keysOf(frame, frames[i])) {
      biggest = Math.max(biggest, apart(at(frame, key), at(frames[i], key)));
    }
  });

  return biggest;
}

// moved somewhere and back again within two ticks
function flicks(frames) {
  const flicked = (i, key) => {
    const before = at(frames[i], key);
    const next = [frames[i + 2], frames[i + 3]];

    return at(frames[i + 1], key) !== before && next.some((on) => at(on, key) === before);
  };

  return frames
    .slice(0, -3)
    .flatMap((frame, i) => [...keysOf(frame, frames[i + 1])].filter((key) => flicked(i, key)));
}

describe('the Old Grove canopy over a raider about to drop', () => {
  const frames = playDrop();

  it('moves every pixel of its trees at most a pixel a tick', () => {
    expect(biggestStep(frames)).toBe(1);
  });

  it('never flicks a pixel there and straight back', () => {
    expect(flicks(frames)).toEqual([]);
  });
});
