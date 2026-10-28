import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_HEIGHT } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawCliffFaces } from '../../../src/render/scene/cliff-faces.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { drawTerrainGround, surfaceRuns } from '../../../src/render/scene/terrain-ground.js';
import { createRecordingContext } from '../../support/recording-canvas.js';
import { drawnRects } from './ambient/ambient-recorder.js';

const colors = scenePalette('angkorWat').ground;
const picture = (name, width, height) => ({ width, height, recordingId: () => `img(${name})` });
const texture = { image: picture('ground.png', 128, 49), ready: true, top: 10 };
const cliff = {
  image: picture('cliff.png', 12, 26),
  mirrored: picture('cliff-m', 12, 26),
  ready: true,
};
const faces = (name, width) => ({
  image: picture(`${name}.png`, width, VIEW_HEIGHT),
  mirrored: picture(`${name}-m`, width, VIEW_HEIGHT),
  ready: true,
});
// four step faces 11 wide, the two banks of a breach 16 wide
const deep = {
  image: picture('deep.png', 128, VIEW_HEIGHT),
  ready: true,
  from: 20,
  face: faces('face', 44),
  breach: faces('breach', 32),
};
// the body starts this far under the surface: the cross-section's row `from` below its surface row
const UNDER = deep.from - texture.top;
// a 20px bank from x=200 to x=300: a face up at 200 (high on the right) and down at 300
const bank = (x) => (x >= 200 && x < 300 ? GROUND_Y - 20 : GROUND_Y);
// the road's breach from x=250 to x=294, its bed out of sight
const breach = (x) => (x >= 250 && x < 294 ? VIEW_HEIGHT + 128 : GROUND_Y - 16);

function record(draw) {
  const { context, log } = createRecordingContext(null);
  draw(createPainter(context));
  return log;
}

const imageDraws = (log, name) =>
  log
    .filter((call) => call.startsWith(`drawImage(img(${name})`))
    .map((call) => call.slice(10, -1).split(',').slice(1).map(Number));

function road(surfaceAt, body = deep) {
  return record((painter) =>
    drawTerrainGround(painter, { cameraX: 100, colors, tick: 0, surfaceAt, texture, deep: body }),
  );
}

function facesOf(surfaceAt, body = deep) {
  const runs = surfaceRuns(surfaceAt, 100, 400);
  return record((painter) => drawCliffFaces(painter, runs, { texture, cliff, colors, deep: body }));
}

describe('a road built on a level body', () => {
  it('lays only its paving along each run, with no last row run on down under a high step', () => {
    const paving = imageDraws(road(bank), 'ground.png');

    expect(paving.length).toBeGreaterThan(0);
    for (const [, sourceY, , height] of paving) {
      expect([sourceY, height]).toEqual([0, deep.from]);
    }
  });

  it('lays the body at the world rows it stands on, the same under a raised step as beside it', () => {
    const body = imageDraws(road(bank), 'deep.png');
    const tops = body.map(([, sourceY, , , x, y]) => [x, sourceY, y]);

    expect(tops).toContainEqual([100, GROUND_Y + UNDER, GROUND_Y + UNDER]);
    expect(tops).toContainEqual([200, GROUND_Y - 20 + UNDER, GROUND_Y - 20 + UNDER]);
    for (const [, sourceY, , height, , y] of body) {
      expect(sourceY).toBe(y);
      expect(y + height).toBe(VIEW_HEIGHT);
    }
  });

  it('shades the wall just under the paving', () => {
    const log = road(bank);
    const shade = drawnRects(log).filter((rect) => rect.color === colors.shadow);

    expect(shade.map((rect) => rect.y)).toContain(GROUND_Y - 20 + UNDER);
    expect(shade.map((rect) => rect.y)).toContain(GROUND_Y - 20 + UNDER + 1);
    for (const rect of shade) {
      expect(rect.alpha).toBeLessThan(1);
    }
    expect(log.filter((call) => call.startsWith('globalAlpha')).at(-1)).toBe('globalAlpha=1');
  });

  it('runs its cross-section on down as before while the body has not loaded', () => {
    const paving = imageDraws(road(bank, { ...deep, ready: false }), 'ground.png');

    expect(paving.some(([, sourceY, , height]) => sourceY === 48 && height === 1)).toBe(true);
  });
});

describe('the faces of a built step', () => {
  it('end its courses at the world rows, from under the paving down to the low ground', () => {
    const [down] = imageDraws(facesOf(bank), 'face.png');
    const [up] = imageDraws(facesOf(bank), 'face-m');
    const top = GROUND_Y - 20 + UNDER;

    const height = GROUND_Y - top;

    expect(down.slice(1)).toEqual([top, 11, height, 300 - 5, top, 11, height]);
    expect(up.slice(1)).toEqual([top, 11, height, 200 - 11 + 5, top, 11, height]);
  });

  it('pick one of their ends by where the step stands, turned round with the picture', () => {
    const [down] = imageDraws(facesOf(bank), 'face.png');
    const [up] = imageDraws(facesOf(bank), 'face-m');

    expect(down[0]).toBe((Math.floor(300 / 7) % 4) * 11);
    expect(up[0]).toBe((3 - (Math.floor(200 / 7) % 4)) * 11);
  });

  it('are the broken banks of a breach where the cut runs on down out of sight, one each side', () => {
    const log = facesOf(breach);
    const [near] = imageDraws(log, 'breach.png');
    const [far] = imageDraws(log, 'breach-m');

    expect(imageDraws(log, 'face.png')).toEqual([]);
    expect([near[0], near[4], near[5] + near[3]]).toEqual([16, 250 - 6, VIEW_HEIGHT]);
    expect([far[0], far[4], far[5] + far[3]]).toEqual([16, 294 - 16 + 6, VIEW_HEIGHT]);
  });

  it('are left to the cliff picture on a road whose body has no ends drawn', () => {
    const log = facesOf(bank, { ...deep, face: null, breach: null });

    expect(log.filter((call) => /img\((face|breach)/.test(call))).toEqual([]);
    expect(imageDraws(log, 'cliff.png')).toHaveLength(1);
  });
});
