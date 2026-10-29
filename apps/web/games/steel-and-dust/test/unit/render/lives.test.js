import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../src/art/colors.js';
import { HUD_COLORS } from '../../../src/art/hud-colors.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawLives } from '../../../src/render/hud/lives.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const FULL = `fillStyle=${COLORS.red}`;
const LOST = `fillStyle=${HUD_COLORS.barTrough}`;

// the color of each heart's top left lobe, one entry per heart from the left
function heartColors(lives) {
  const { context, log } = createRecordingContext(null);
  drawLives(createPainter(context), { lives, x: 6, y: 47 });
  return [0, 1, 2, 3, 4].map((i) => log[log.indexOf(`fillRect(${7 + i * 9},47,2,1)`) - 1]);
}

describe('the lives on the HUD', () => {
  it('draws a full heart for every life still to come and a dark one for every life lost', () => {
    expect(heartColors(4)).toEqual([FULL, FULL, FULL, LOST, LOST]);
    expect(heartColors(6)).toEqual([FULL, FULL, FULL, FULL, FULL]);
  });

  it('draws every heart dark on the last life and once it is gone', () => {
    expect(heartColors(1)).toEqual([LOST, LOST, LOST, LOST, LOST]);
    expect(heartColors(0)).toEqual([LOST, LOST, LOST, LOST, LOST]);
  });
});
