import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawMoats } from '../../../src/render/scene/moats.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

// Bug: the Angkor moat's water was a tile of its own laid over the breach, purple swells over a
// cold blue under a line of bright glints, so it read as a strip of another lake set into the one
// painted behind it. The breach now shows that painted moat itself, and all that is drawn in it is
// the light on its ripples along the waterline: the lake's own glints, flashing and fading
const { glints } = PAINTED_THEMES.angkorWat.ambient;
const SPAN = { from: 200, to: 244, level: 190 };
const CAMERA_X = 100;
const TICKS = 900;

function drawnAt(tick) {
  const { context, log } = createRecordingContext(null);

  drawMoats(createPainter(context), {
    water: [SPAN],
    cameraX: CAMERA_X,
    tick,
    glints,
    summons: [],
  });

  return log;
}

// every dash of light laid over the moat, in the world's columns, with the color it was laid in
function lightOver(log) {
  let color = null;

  return log.flatMap((call) => {
    if (call.startsWith('fillStyle=')) {
      color = call.slice('fillStyle='.length);
    }

    if (!call.startsWith('fillRect(')) {
      return [];
    }

    const [x, y, width] = call.slice(9, -1).split(',').map(Number);

    return [{ from: x + CAMERA_X, to: x + CAMERA_X + width, y, color }];
  });
}

const allTicks = Array.from({ length: TICKS }, (_, tick) => tick);

describe('the water in the Angkor moat’s breach', () => {
  it('lays no water of its own over the painted moat', () => {
    for (const tick of allTicks) {
      expect(drawnAt(tick).filter((call) => call.startsWith('drawImage('))).toEqual([]);
    }
  });

  it('lights its ripples with the lake’s own glints, along the waterline', () => {
    const dashes = allTicks.flatMap((tick) => lightOver(drawnAt(tick)));

    expect(dashes.length).toBeGreaterThan(0);
    for (const dash of dashes) {
      expect(glints).toContain(dash.color);
      expect(dash.y).toBeGreaterThanOrEqual(SPAN.level - 2);
      expect(dash.y).toBeLessThanOrEqual(SPAN.level + 6);
    }
  });

  it('keeps its light inside the breach, cut off at the banks', () => {
    const [clip] = drawnAt(0).filter((call) => call.startsWith('rect('));
    const [x, , width] = clip.slice(5, -1).split(',').map(Number);

    expect([x, x + width]).toEqual([SPAN.from, SPAN.to]);
    expect(drawnAt(0)).toContain('clip()');
  });
});
