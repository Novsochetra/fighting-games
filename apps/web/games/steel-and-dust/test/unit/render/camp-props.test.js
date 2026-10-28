import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { KEG } from '../../../src/data/kegs.js';
import { loadFxSheets } from '../../../src/render/fx/fx-sheets.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawCampfires } from '../../../src/render/scene/campfires.js';
import { drawKegs } from '../../../src/render/scene/kegs.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const sheets = loadFxSheets({
  createImage: () => new FakeImage(),
  createCanvas: () => null,
  baseUrl: '',
});

// the points each sprite was drawn on, its anchor (the foot it stands on) put there
function drawnAt(draw, props) {
  const { context, log } = createRecordingContext(null);

  draw(createPainter(context), sheets, { cameraX: 0, tick: 0, ...props });

  return log
    .filter((call) => call.startsWith('translate('))
    .map((call) => call.slice(10, -1).split(',').map(Number));
}

describe('the Raider Camp props on the road', () => {
  it('draws a keg with its round foot set down into the road grass', () => {
    const [[x, y]] = drawnAt(drawKegs, { kegs: [{ x: 100, y: GROUND_Y }] });

    expect(x).toBe(100);
    expect(y).toBeGreaterThan(GROUND_Y);
    expect(y).toBe(GROUND_Y + KEG.setIn);
  });

  it('draws a campfire with its round ring of stones set down into the road grass', () => {
    const [[x, y]] = drawnAt(drawCampfires, { campfires: [{ x: 100, y: GROUND_Y }] });

    expect(x).toBe(100);
    expect(y).toBeGreaterThan(GROUND_Y);
  });
});
