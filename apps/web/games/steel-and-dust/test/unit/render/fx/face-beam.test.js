import { afterEach, describe, expect, it, vi } from 'vitest';
import { COLORS } from '../../../../src/art/colors.js';
import { FX_COLORS } from '../../../../src/art/fx-colors.js';
import { arcPoints } from '../../../../src/render/fx/beam-flares.js';
import { beamProfile, drawFaceBeam } from '../../../../src/render/fx/face-beam.js';
import { gatherShare, moteDistances } from '../../../../src/render/fx/mouth-gather.js';
import { drawStoneFaceLight } from '../../../../src/render/fx/stone-face-draw.js';
import { FACE_TIMES, beamLength, mouthOf } from '../../../../src/sim/hazards/stone-faces.js';
import { drawnRects, offGrid, recordingPainter } from './fx-recorder.js';

const faceAt = (time) => ({ x: 26, y: 220, floor: 184, direction: 1, reach: 200, time });

function beamRects(time) {
  const { painter, log } = recordingPainter();
  drawFaceBeam(painter, faceAt(time));
  return drawnRects(log);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("a stone face's beam", () => {
  it('has a white-hot core inside its gold body inside its glow, narrowing to its tip', () => {
    const face = faceAt(FACE_TIMES.fire + 8);
    const length = beamLength(face);
    for (const run of [0, 40, 120, length - 10]) {
      const { core, body, glow } = beamProfile(face, run, length);
      expect(core).toBeLessThan(body);
      expect(body).toBeLessThan(glow);
    }
    expect(beamProfile(face, length - 2, length).body).toBeLessThan(
      beamProfile(face, 100, length).body,
    );
  });

  it('dies down to nothing over its last ticks', () => {
    const face = faceAt(FACE_TIMES.sink - 1);
    const length = beamLength(face);
    const dying = beamProfile(face, 60, length);
    const full = beamProfile(faceAt(FACE_TIMES.fire + 8), 60, length);
    expect(dying.body).toBeLessThan(full.body / 2);
  });

  it('is banded deep amber, ember, gold, pale gold and white from its edge in', () => {
    const rects = beamRects(FACE_TIMES.fire + 8);
    expect(offGrid(rects)).toEqual([]);
    const solid = rects.filter((rect) => !rect.light && rect.alpha === 1);
    const order = [
      FX_COLORS.gazeDeep,
      FX_COLORS.gazeEmber,
      FX_COLORS.gazeGold,
      FX_COLORS.gazeWhite,
      COLORS.white,
    ];
    const firsts = order.map((color) => solid.findIndex((rect) => rect.color === color));
    expect(firsts.every((index) => index >= 0)).toBe(true);
    expect([...firsts].sort((first, second) => first - second)).toEqual(firsts);
    const column = solid.filter((rect) => rect.x <= 100 && rect.x + rect.width > 100);
    const height = (color) => column.find((rect) => rect.color === color).height;
    for (let i = 1; i < order.length; i++) {
      expect(height(order[i])).toBeLessThanOrEqual(height(order[i - 1]));
    }
  });

  it('draws the same frame twice without Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    expect(beamRects(FACE_TIMES.fire + 3)).toEqual(beamRects(FACE_TIMES.fire + 3));
    expect(random).not.toHaveBeenCalled();
  });
});

describe('the lightning round the beam', () => {
  const beam = (time) => {
    const face = faceAt(time);
    return { face, mouth: mouthOf(face), length: beamLength(face) };
  };

  it('wanders either side of the beam along a stretch of it', () => {
    const { mouth } = beam(FACE_TIMES.fire + 8);
    const points = arcPoints(beam(FACE_TIMES.fire + 8), 0);
    for (const point of points) {
      expect(Math.abs(point.y - mouth.y)).toBeLessThanOrEqual(8);
    }
    expect(points.at(-1).x - points[0].x).toBeCloseTo(46);
    expect(new Set(points.map((point) => Math.sign(point.y - mouth.y))).size).toBeGreaterThan(1);
  });

  it('jumps to a new stretch every couple of ticks', () => {
    const now = arcPoints(beam(FACE_TIMES.fire + 8), 1);
    expect(arcPoints(beam(FACE_TIMES.fire + 9), 1)).toEqual(now);
    expect(arcPoints(beam(FACE_TIMES.fire + 10), 1)).not.toEqual(now);
  });
});

describe('the light a stone face gathers and breathes', () => {
  it('gathers in its mouth over the glare, drawing motes in', () => {
    expect(gatherShare(faceAt(FACE_TIMES.glare))).toBe(0);
    expect(gatherShare(faceAt(FACE_TIMES.fire))).toBe(1);
    const before = moteDistances(faceAt(FACE_TIMES.glare + 2));
    const after = moteDistances(faceAt(FACE_TIMES.glare + 3));
    expect(after[0]).toBeLessThan(before[0]);
    for (const distance of [...before, ...after]) {
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThanOrEqual(1);
    }
  });

  it('is drawn only while it glares and breathes, on the screen-pixel grid', () => {
    const lit = (time) => {
      const { painter, log } = recordingPainter();
      drawStoneFaceLight(painter, faceAt(time));
      return drawnRects(log);
    };
    expect(lit(FACE_TIMES.glare - 1)).toEqual([]);
    expect(lit(FACE_TIMES.sink)).toEqual([]);
    for (const time of [FACE_TIMES.glare + 4, FACE_TIMES.fire, FACE_TIMES.sink - 1]) {
      expect(lit(time).length).toBeGreaterThan(0);
      expect(offGrid(lit(time))).toEqual([]);
    }
  });
});
