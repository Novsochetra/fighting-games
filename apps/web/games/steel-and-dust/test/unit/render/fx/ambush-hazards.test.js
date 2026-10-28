import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../../src/art/colors.js';
import { GROUND_Y } from '../../../../src/config.js';
import { DROP } from '../../../../src/data/ambush.js';
import { loadFxSheets } from '../../../../src/render/fx/fx-sheets.js';
import { drawDropMark, drawMound } from '../../../../src/render/fx/ambush-hazards.js';
import { loadEnemySprites } from '../../../../src/render/fighters/enemy-sheets.js';
import { FakeImage } from '../../../support/fake-image.js';
import { RecordingCanvas } from '../../../support/recording-canvas.js';
import { drawnRects, recordingPainter } from './fx-recorder.js';

const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });
const loaders = { createImage: () => new FakeImage(), createCanvas, baseUrl: '' };
const SHEETS = loadFxSheets(loaders);
const ROAD = {
  floorAt: () => GROUND_Y,
  enemySheets: loadEnemySprites(loaders),
  cameraX: 0,
  heroX: 220,
};

function drawn(draw, shot) {
  const { painter, log } = recordingPainter();

  draw(painter, shot, SHEETS, ROAD);

  return log;
}

const mark = (fields) => ({ x: 120, y: GROUND_Y, raiderKind: 'grunt', raider: null, ...fields });
const LEDGE = { kind: 'ledge', from: 90, to: 150, y: 96, parallax: 0.45, layerX: 120 };
const isRed = (log) => drawnRects(log).some((rect) => rect.color === COLORS.red);
const drawsRaider = (log) => log.some((entry) => entry.includes('raider.png'));
const clipTop = (log) => Number(log.find((entry) => entry.startsWith('rect(')).split(',')[1]);
const mound = (fields) => ({ x: 200, y: GROUND_Y, direction: 1, haltAt: 0, eruptAt: 0, ...fields });
const moundDrawnAt = (log) => log.find((entry) => entry.startsWith('translate('));

describe('the spot a raider drops on', () => {
  it('shows only its shadow while the raider waits in the trees, never the red of a danger', () => {
    for (const time of [2, DROP.warn - 1]) {
      const log = drawn(drawDropMark, mark({ time }));

      expect(isRed(log)).toBe(false);
      expect(drawsRaider(log)).toBe(false);
    }
  });

  it('shows the raider too while it climbs onto a ledge in sight, cut off at the ledge', () => {
    const log = drawn(drawDropMark, mark({ time: 30, perch: LEDGE }));

    expect(drawsRaider(log)).toBe(true);
    expect(log).toContain('clip()');
    expect(clipTop(log) + 80).toBe(LEDGE.y);
  });

  it('stops showing it on the ledge once it has leapt', () => {
    const log = drawn(drawDropMark, mark({ time: 70, perch: LEDGE, raider: { x: 120, y: 120 } }));

    expect(drawsRaider(log)).toBe(false);
  });
});

describe('a mound crawling under the sand', () => {
  it('is drawn from the mound strip, and nothing once it has burst', () => {
    expect(drawn(drawMound, mound({ time: 4 })).some((entry) => entry.includes('mound.png'))).toBe(
      true,
    );
    expect(drawn(drawMound, mound({ time: 60, eruptAt: 50 }))).toEqual([]);
  });

  it('shakes from side to side once it stops', () => {
    const crawling = [10, 12].map((time) => moundDrawnAt(drawn(drawMound, mound({ time }))));
    expect(crawling[0]).toBe(crawling[1]);
    const shaking = [10, 12].map((time) =>
      moundDrawnAt(drawn(drawMound, mound({ time, haltAt: 8 }))),
    );
    expect(shaking[0]).not.toBe(shaking[1]);
  });
});
