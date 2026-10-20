import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import {
  cliffSteps,
  drawCliffFaces,
  roundedShoulders,
} from '../../../src/render/scene/cliff-faces.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { drawTerrainGround, surfaceRuns } from '../../../src/render/scene/terrain-ground.js';
import { createRecordingContext } from '../../support/recording-canvas.js';
import { drawnRects } from './ambient/ambient-recorder.js';

const colors = scenePalette('pineRidge').ground;
const picture = (name, width, height) => ({ width, height, recordingId: () => `img(${name})` });
const texture = { image: picture('ground.png', 128, 64), ready: true, top: 7 };
const cliff = {
  image: picture('cliff.png', 12, 64),
  mirrored: picture('mirrored', 12, 64),
  ready: true,
};
// a 20px bank from x=200 to x=300: a face up at 200 (high on the right) and down at 300
const bank = (x) => (x >= 200 && x < 300 ? GROUND_Y - 20 : GROUND_Y);

function record(draw) {
  const { context, log } = createRecordingContext(null);
  draw(createPainter(context));
  return log;
}

const imageDraws = (log, name) =>
  log
    .filter((call) => call.startsWith(`drawImage(img(${name})`))
    .map((call) => call.slice(10, -1).split(',').slice(1).map(Number));

function facesOf(surfaceAt) {
  const runs = surfaceRuns(surfaceAt, 100, 400);
  return record((painter) => drawCliffFaces(painter, runs, { texture, cliff, colors }));
}

describe('sheer steps', () => {
  it('are found where the road jumps three pixels or more, with the side the high ground is on', () => {
    const runs = surfaceRuns(bank, 100, 400);
    expect(cliffSteps(runs)).toEqual([
      { x: 200, top: GROUND_Y - 20, foot: GROUND_Y, highOnLeft: false },
      { x: 300, top: GROUND_Y - 20, foot: GROUND_Y, highOnLeft: true },
    ]);
  });

  it('are not found on slopes', () => {
    const slope = (x) => GROUND_Y - Math.max(0, Math.min(30, Math.round((x - 150) / 2)));
    expect(cliffSteps(surfaceRuns(slope, 100, 400))).toEqual([]);
  });
});

describe('rounded shoulders', () => {
  const drawn = roundedShoulders(bank);

  it('roll the turf down over the last columns before each face', () => {
    expect([296, 297, 298, 299].map((x) => drawn(x) - bank(x))).toEqual([1, 1, 2, 4]);
    expect([200, 201, 202, 203].map((x) => drawn(x) - bank(x))).toEqual([4, 2, 1, 1]);
  });

  it('leave level ground, the low side and gentle slopes alone', () => {
    for (const x of [150, 199, 250, 300, 305]) {
      expect(drawn(x), `at ${x}`).toBe(bank(x));
    }
    const slope = (x) => GROUND_Y - Math.round(x / 3);
    expect(roundedShoulders(slope)(90)).toBe(slope(90));
  });

  it('round a low step less than a tall one', () => {
    const step = (x) => (x < 100 ? GROUND_Y - 6 : GROUND_Y);
    expect(roundedShoulders(step)(99) - step(99)).toBe(2);
  });
});

describe('cliff faces', () => {
  it('hang the cliff picture from the lip, cut off at the low ground', () => {
    const [face] = imageDraws(facesOf(bank), 'cliff.png');
    expect(face).toEqual([0, 0, 12, 20, 300 + 2 - 12, GROUND_Y - 20, 12, 20]);
  });

  it('turn the picture round for a face whose high ground is on the right', () => {
    const [face] = imageDraws(facesOf(bank), 'mirrored');
    expect(face).toEqual([0, 0, 12, 20, 200 - 2, GROUND_Y - 20, 12, 20]);
  });

  it('let the turf of the high side hang over the face, from its own columns', () => {
    const lips = imageDraws(facesOf(bank), 'ground.png').filter((draw) => draw[5] < GROUND_Y - 20);
    const right = lips.filter((draw) => draw[4] >= 300);
    expect(right.map((draw) => draw[4])).toEqual([300, 302]);
    expect(right[0]).toEqual([300 % 128, 0, 2, 7 + 4, 300, GROUND_Y - 20 - 7, 2, 7 + 4]);
    expect(right[1][5]).toBe(GROUND_Y - 20 - 7 + 1);
    const left = lips.filter((draw) => draw[4] < 200);
    expect(left.map((draw) => draw[4] + draw[6])).toEqual([200, 198]);
  });

  it('stand the face in the low side turf, with a soft shadow at its foot', () => {
    const log = facesOf(bank);
    const feet = imageDraws(log, 'ground.png').filter((draw) => draw[5] === GROUND_Y - 7);
    expect(feet.map((draw) => [draw[4], draw[6]])).toEqual([
      [200 - 2, 7],
      [300 - 5, 7],
    ]);
    const shadows = drawnRects(log).filter((rect) => rect.color === colors.shadow);
    expect(shadows.length).toBe(4);
    for (const shadow of shadows) {
      expect(shadow.alpha).toBeLessThan(1);
      expect(shadow.y).toBe(GROUND_Y - 1);
      const lowSide = shadow.x >= 300 || shadow.x + shadow.width <= 200;
      expect(lowSide, `shadow at ${shadow.x}`).toBe(true);
    }
    expect(log.at(-1)).toBe('globalAlpha=1');
  });

  it('cost a few picture draws each', () => {
    const draws = facesOf(bank).filter((call) => call.startsWith('drawImage('));
    expect(draws.length).toBeLessThanOrEqual(2 * 5);
  });
});

describe('a painted road with a cliff picture', () => {
  function road(withCliff) {
    return record((painter) =>
      drawTerrainGround(painter, {
        cameraX: 100,
        colors,
        tick: 0,
        surfaceAt: bank,
        texture,
        cliff: withCliff,
      }),
    );
  }

  it('draws its sheer steps as cliffs with rounded shoulders', () => {
    const log = road(cliff);
    expect(imageDraws(log, 'cliff.png')).toHaveLength(1);
    expect(imageDraws(log, 'mirrored')).toHaveLength(1);
    const tops = imageDraws(log, 'ground.png')
      .filter((draw) => draw[3] === 64)
      .map((draw) => [draw[4], draw[5] + 7]);
    expect(tops).toContainEqual([299, GROUND_Y - 20 + 4]);
  });

  it('keeps the earth line on its steps until the cliff picture has loaded', () => {
    const log = road({ ...cliff, ready: false });
    expect(imageDraws(log, 'cliff.png')).toEqual([]);
    const faces = drawnRects(log).filter((rect) => rect.color === colors.rut && rect.width === 2);
    expect(faces).toHaveLength(2);
  });
});
