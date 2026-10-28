import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { drawCrownCover } from '../../../src/render/scene/crown-cover.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const image = (name, width) => ({ width, height: 216, recordingId: () => `img(${name})` });
const BACKDROP = {
  layers: [
    { name: 'back', image: image('back', 320), parallax: 0.08, ready: true },
    { name: 'near', image: image('near', 384), parallax: 0.45, ready: true },
  ],
};
const PERCH = { kind: 'crown', layer: 'near', parallax: 0.45, from: 100, to: 160 };

const leaving = (since, raiderY) => ({
  kind: 'dropMark',
  x: 130,
  time: DROP.warn + since,
  perch: { ...PERCH, top: 20, bottom: 90, x: 130, y: 60, shift: 0, layerX: 130 },
  raider: { x: 130, y: raiderY },
});

function covered(projectiles) {
  const { context, log } = createRecordingContext(null);
  const setLayer = Object.assign(() => {}, { shake: { x: 0, y: 0 } });

  drawCrownCover({ context }, setLayer, { game: { projectiles }, backdrop: BACKDROP, cameraX: 0 });

  return log.filter((entry) => entry.startsWith('drawImage('));
}

describe('a raider dropping out of a crown', () => {
  it('has the crown laid back over it as it lets go, so it comes out of the leaves', () => {
    const pieces = covered([leaving(1, 60)]);

    expect(pieces.length).toBeGreaterThan(0);
    expect(pieces.every((entry) => entry.includes('img(near)'))).toBe(true);
  });

  it('shows once it is below where it hid, and once it has long let go', () => {
    expect(covered([leaving(8, 130)])).toEqual([]);
    expect(covered([leaving(40, 70)])).toEqual([]);
  });

  it('is left alone while it waits, or off a ledge', () => {
    const waiting = { ...leaving(0, 60), raider: null, time: 30 };
    const ledge = { ...leaving(1, 60), perch: { ...leaving(1, 60).perch, kind: 'ledge' } };

    expect(covered([waiting, ledge])).toEqual([]);
  });
});
