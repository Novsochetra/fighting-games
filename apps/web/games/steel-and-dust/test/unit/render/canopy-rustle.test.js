import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { drawCanopyRustle, rustlePatch } from '../../../src/render/scene/canopy-rustle.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const waiting = (time) => ({ time, raider: null });
const dropped = (time) => ({ time: DROP.warn + time, raider: {} });
// sunk under the raider's weight, the most the trees over it are moved while it waits; tipped
// aside as it lands
const SUNK = 14;
const TIPPED = 8;

function image(name, width) {
  return { width, height: 216, recordingId: () => `img(${name})` };
}

const CANOPY = { layer: 'near', foot: 72, fade: 12, trunks: [[300, 340]] };
const BACKDROP = {
  canopy: CANOPY,
  layers: [
    { name: 'back', image: image('back', 320), parallax: 0.08, ready: true },
    { name: 'near', image: image('near', 384), parallax: 0.45, ready: true },
  ],
};
const CROWN = { kind: 'crown', layer: 'near', parallax: 0.45, from: 100, to: 160, top: 20 };
const crowned = (fields) => ({
  kind: 'dropMark',
  x: 230,
  perch: { ...CROWN, bottom: 90, x: 130, y: 60, shift: 0, layerX: 130 },
  ...waiting(TIPPED),
  ...fields,
});
const canopied = (fields) => ({ kind: 'dropMark', x: 250, ...waiting(SUNK), ...fields });
const piecesOf = (log, name) =>
  log
    .filter((entry) => entry.startsWith(`drawImage(img(${name})`))
    .map((entry) => entry.split(',').slice(1).map(Number));

function rustled({ backdrop = BACKDROP, projectiles }) {
  const { context, log } = createRecordingContext(null);
  const transforms = [];
  const setLayer = Object.assign((offsetX, shaken) => transforms.push(shaken), {
    shake: { x: 2, y: 1 },
  });

  drawCanopyRustle({ context }, setLayer, { game: { projectiles }, backdrop, cameraX: 100 });

  return { log, transforms };
}

describe('drawing the trees over a raider about to drop', () => {
  it('draws nothing at all on a road without a canopy, or with no raider waiting in it', () => {
    expect(
      rustled({ backdrop: { ...BACKDROP, canopy: null }, projectiles: [canopied()] }).log,
    ).toEqual([]);
    expect(rustled({ projectiles: [] }).log).toEqual([]);
  });

  it('draws nothing as the raider comes, nor once the trees have come to rest', () => {
    expect(rustled({ projectiles: [canopied(waiting(1))] }).log).toEqual([]);
    expect(rustled({ projectiles: [canopied(dropped(30))] }).log).toEqual([]);
  });

  it("lays the road's own layers back over the moved trees, on the still screen", () => {
    const { log, transforms } = rustled({ projectiles: [canopied()] });
    const near = piecesOf(log, 'near');

    expect(piecesOf(log, 'back').length).toBeGreaterThan(0);
    expect(near.length).toBeGreaterThan(0);
    expect(transforms).toEqual([false, true]);
  });

  it('sways only the trees round the spot, down to the foot of the canopy', () => {
    const spotX = 250 - 100;
    const near = piecesOf(rustled({ projectiles: [canopied()] }).log, 'near');

    expect(near.every(([, , width, , x]) => x >= spotX - 44 && x + width <= spotX + 44)).toBe(true);
    expect(near.every(([, , , height, , y]) => y + height <= CANOPY.foot)).toBe(true);
  });

  it('shakes the trees over two raiders as one patch, so where they overlap nothing tears', () => {
    const patch = rustlePatch(
      { projectiles: [canopied(), canopied({ x: 294, ...waiting(40) })] },
      { backdrop: BACKDROP, cameraX: 100 },
    );

    expect(patch.sources).toHaveLength(2);
    expect([patch.left, patch.right]).toEqual([150 - 44, 194 + 44]);
  });
});

describe('a crown a raider hides in', () => {
  it('moves only that crown, in its own layer, laying the far plate back still under it', () => {
    const { log } = rustled({ projectiles: [crowned()] });
    const near = piecesOf(log, 'near');
    const back = piecesOf(log, 'back');
    const cameraShift = Math.round(-100 * 0.45);
    // a piece left where it was is taken from where the shake put the layer, 2 pixels over
    const moved = near.filter(([sourceX, , , , x]) => sourceX !== x - cameraShift - 2);

    expect(near.length).toBeGreaterThan(0);
    expect(near.every(([, , , , x]) => x >= 100 + cameraShift - 4)).toBe(true);
    expect(near.every(([, , width, , x]) => x + width <= 160 + cameraShift + 4)).toBe(true);
    const area = (pieces) => pieces.reduce((sum, piece) => sum + piece[6] * piece[7], 0);

    expect(moved.length).toBeGreaterThan(0);
    expect(area(back)).toBe(area(near));
    expect(back.length).toBeLessThanOrEqual(near.length);
  });

  it('leaves a ledge still: a raider climbing onto stone or iron does not sway it', () => {
    const ledge = crowned({ perch: { kind: 'ledge', layer: 'near', parallax: 0.45, y: 90 } });

    expect(rustled({ projectiles: [ledge] }).log).toEqual([]);
  });
});
