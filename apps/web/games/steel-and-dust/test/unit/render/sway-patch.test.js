import { describe, expect, it } from 'vitest';
import { smoothstep } from '../../../src/lib/math.js';
import { drawSwayPatch, swayBlocks } from '../../../src/render/scene/sway-patch.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

// a raider over the middle of a 60 by 30 patch, its trees easing still toward the sides and foot
const source = (time, middle = 30) => ({
  left: 0,
  right: 60,
  top: 0,
  bottom: 30,
  across: (x) => smoothstep((26 - Math.abs(x - middle)) / 16),
  down: (y) => smoothstep((30 - y) / 20),
  time,
  give: { sway: 1, sag: 1 },
});
const patchOf = (...sources) => ({
  left: 0,
  right: 60,
  top: 0,
  bottom: 30,
  sources,
  moves: (layer) => layer.name === 'near',
});

// every pixel of the patch, with how far it is moved
function offsets(blocks) {
  const grid = Array.from({ length: 30 }, () => new Array(60).fill('0,0'));

  for (const { y, height, runs } of blocks) {
    for (const { x, width, dx, dy } of runs) {
      grid.slice(y, y + height).forEach((row) => row.fill(`${dx},${dy}`, x, x + width));
    }
  }

  return grid.map((row) => row.map((offset) => offset.split(',').map(Number)));
}

function biggestJog(grid) {
  const apart = ([ax, ay], [bx, by]) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));

  return Math.max(
    ...grid.flatMap((row, y) =>
      row.map((at, x) => Math.max(apart(at, row[x + 1] ?? at), apart(at, grid[y + 1]?.[x] ?? at))),
    ),
  );
}

describe('the patch of trees a raider shakes', () => {
  it('moves only the parts that give, in blocks of alike rows laid in one piece', () => {
    const blocks = swayBlocks(patchOf(source(12)));
    const grid = offsets(blocks);

    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.length).toBeLessThan(30);
    expect(blocks.every(({ runs }) => runs.every(({ dx, dy }) => dx || dy))).toBe(true);
    expect(grid[0][30]).not.toEqual([0, 0]);
    expect([grid[0][0], grid[0][59], grid[29][30]]).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
  });

  it('bends its parts, never tears them: neighbouring pixels are never a pixel and more apart', () => {
    for (const time of [8, 14, 30, 60, 70, 74]) {
      expect(biggestJog(offsets(swayBlocks(patchOf(source(time))))), `at ${time}`).toBe(1);
      expect(
        biggestJog(offsets(swayBlocks(patchOf(source(time), source(time - 28, 40))))),
        `two at ${time}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it('keeps its still parts too when asked, to lay the trees back over something', () => {
    const blocks = swayBlocks({ ...patchOf(source(12)), keepStill: true });
    const rows = blocks.reduce((sum, { height }) => sum + height, 0);

    expect(rows).toBe(30);
    expect(blocks.every(({ runs }) => runs.reduce((sum, { width }) => sum + width, 0) === 60)).toBe(
      true,
    );
  });

  it('comes to the same pixels frame after frame, remembered or played from the start', () => {
    const owner = {};

    for (let time = 1; time < 90; time++) {
      const sources = [source(time), source(time - 30, 44)];

      expect(swayBlocks({ ...patchOf(...sources), owner }), `at ${time}`).toEqual(
        swayBlocks(patchOf(...sources)),
      );
    }
  });

  it('lays the far plate back still under each moved part, then the nearer layers, one moved', () => {
    const image = (name) => ({ width: 200, height: 216, recordingId: () => name });
    const layers = [
      { name: 'far', image: image('far'), parallax: 0.1 },
      { name: 'near', image: image('near'), parallax: 0.5 },
      { name: 'front', image: image('front'), parallax: 0.6 },
    ];
    const { context, log } = createRecordingContext(null);
    // below the painting's first rows, so nothing is taken from above its top
    const patch = { ...patchOf(source(12)), top: 5 };
    const [block] = swayBlocks(patch);
    const [run] = block.runs;

    drawSwayPatch(context, patch, { layers, cameraX: 0, shake: { x: 1, y: 0 } });
    const first = (name) => log.find((entry) => entry.startsWith(`drawImage(${name},`));
    const [far, near, front] = ['far', 'near', 'front'].map((name) =>
      first(name).split(',').map(Number),
    );

    expect(log[0].startsWith('drawImage(far,')).toBe(true);
    expect(log.indexOf(first('near'))).toBeLessThan(log.indexOf(first('front')));
    expect(far[1]).toBe(run.x);
    expect(near[1]).toBe(run.x - 1 - run.dx);
    expect(near[2]).toBe(block.y - run.dy);
    expect(front[1]).toBe(run.x - 1);
  });
});
