import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { drawCrownCover } from '../../../src/render/scene/crown-cover.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

// Bug: a raider letting go of a crown had the crown laid back over its body down to the row its feet
// stand on but not that row, so for the ticks it fell through the leaves its soles hung in them, two
// black dashes in the middle of the tree. The cover reaches down through its feet now
const image = (name, width) => ({ width, height: 216, recordingId: () => `img(${name})` });
const BACKDROP = {
  layers: [
    { name: 'back', image: image('back', 320), parallax: 0.08, ready: true },
    { name: 'near', image: image('near', 768), parallax: 0.45, ready: true },
  ],
};
const PERCH = { kind: 'crown', layer: 'near', parallax: 0.45, from: 615, to: 753 };
const HID_AT = 76;

function lowestCoveredRow(feet) {
  const mark = {
    kind: 'dropMark',
    x: 682,
    time: DROP.warn + 2,
    perch: { ...PERCH, top: 8, bottom: 120, x: 682, y: HID_AT, shift: 0, layerX: 682 },
    raider: { x: 682, y: feet },
  };
  const { context, log } = createRecordingContext(null);
  const setLayer = Object.assign(() => {}, { shake: { x: 0, y: 0 } });

  drawCrownCover({ context }, setLayer, {
    game: { projectiles: [mark] },
    backdrop: BACKDROP,
    cameraX: 0,
  });

  const rows = log
    .filter((entry) => entry.startsWith('drawImage(img(near)'))
    .map((entry) => entry.slice(0, -1).split(',').map(Number))
    .map((args) => args[6] + args[8] - 1);

  return Math.max(...rows);
}

describe('a raider falling out of a crown', () => {
  it('has the leaves over its feet too while they are still in them', () => {
    for (const feet of [HID_AT, HID_AT + 3, HID_AT + 9]) {
      expect(lowestCoveredRow(feet), `feet at ${feet}`).toBeGreaterThanOrEqual(feet);
    }
  });
});
