import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import {
  drawCanopyRustle,
  rustleOffset,
  rustleStrength,
} from '../../../src/render/scene/canopy-rustle.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const DEPTH = 72;
const waiting = (time) => ({ time, raider: null });
const dropped = (time) => ({ time: DROP.warn + time, raider: {} });

function image(name, width) {
  return { width, height: 216, recordingId: () => `img(${name})` };
}

const BACKDROP = {
  canopy: DEPTH,
  layers: [
    { image: image('back', 320), parallax: 0.08, ready: true },
    { image: image('near', 384), parallax: 0.45, ready: true },
  ],
};

function rustled({ backdrop = BACKDROP, projectiles }) {
  const { context, log } = createRecordingContext(null);
  const transforms = [];
  const setLayer = Object.assign((offsetX, shaken) => transforms.push(shaken), {
    shake: { x: 2, y: 1 },
  });
  const game = { projectiles };

  drawCanopyRustle({ context }, setLayer, { game, backdrop, cameraX: 100 });

  return { log, transforms };
}

describe('the trees over a raider about to drop', () => {
  it('settle as it climbs on, are restless while it waits and shake harder as it gets ready', () => {
    expect(rustleStrength(waiting(0))).toBe(0);
    expect(rustleStrength(waiting(30))).toBeGreaterThan(0.5);
    expect(rustleStrength(waiting(DROP.warn - 5))).toBe(1);
  });

  it('lurch as it lets go, then spring back still', () => {
    expect(rustleStrength(dropped(0))).toBeGreaterThan(1);
    expect(rustleStrength(dropped(12))).toBeLessThan(rustleStrength(dropped(2)));
    expect(rustleStrength(dropped(40))).toBe(0);
  });

  it('move as one over the spot, so a stalk or a bough is never torn', () => {
    const mark = waiting(DROP.warn - 8);
    const near = [-20, -10, 0, 10].map((x) =>
      rustleOffset(mark, { spotX: 0, x, y: 20, depth: DEPTH }),
    );

    expect(new Set(near.map(({ dx, dy }) => `${dx},${dy}`)).size).toBe(1);
    expect(near[0].dx || near[0].dy).toBeTruthy();
  });

  it('do not move at all at the edges and the foot of the patch, so it never shows', () => {
    const mark = dropped(1);

    expect(rustleOffset(mark, { spotX: 0, x: 40, y: 10, depth: DEPTH })).toEqual({ dx: 0, dy: 0 });
    expect(rustleOffset(mark, { spotX: 0, x: -50, y: 10, depth: DEPTH })).toEqual({ dx: 0, dy: 0 });
    expect(rustleOffset(mark, { spotX: 0, x: 0, y: DEPTH, depth: DEPTH })).toEqual({
      dx: 0,
      dy: 0,
    });
  });
});

describe('drawing the rustle', () => {
  it('draws nothing at all on a road without a canopy, or with no raider waiting in it', () => {
    const mark = { kind: 'dropMark', ...waiting(40) };

    expect(rustled({ backdrop: { ...BACKDROP, canopy: 0 }, projectiles: [mark] }).log).toEqual([]);
    expect(rustled({ projectiles: [] }).log).toEqual([]);
  });

  it("lays the road's own layers back over the patch on the still screen", () => {
    const mark = { kind: 'dropMark', x: 150, ...dropped(1) };
    const { log, transforms } = rustled({ projectiles: [mark] });
    const pieces = log.filter((entry) => entry.startsWith('drawImage('));

    expect(pieces.length).toBeGreaterThan(0);
    expect(pieces.some((entry) => entry.includes('img(back)'))).toBe(true);
    expect(pieces.some((entry) => entry.includes('img(near)'))).toBe(true);
    expect(transforms).toEqual([false, true]);
  });
});
