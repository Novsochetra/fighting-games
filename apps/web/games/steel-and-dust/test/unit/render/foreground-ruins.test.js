import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawForeground } from '../../../src/render/scene/foreground/index.js';
import { drawRuins } from '../../../src/render/scene/foreground/ruins.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { drawnRects } from './ambient/ambient-recorder.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const temple = scenePalette('mirageTemple').rubble;

function rectsOf(draw) {
  const { context, log } = createRecordingContext(null);
  draw(createPainter(context));
  return drawnRects(log);
}

const piecesAlong = (tick) =>
  [0, 700, 1500, 3100].flatMap((cameraX) =>
    rectsOf((painter) => drawForeground(painter, cameraX, temple, tick)),
  );

describe('what lies in front of the fighters on the temple road', () => {
  it('is the theme kind, drawn in its own colors and none of the forest ferns', () => {
    expect(temple.kind).toBe('ruins');
    const colors = new Set(piecesAlong(0).map((rect) => rect.color));
    expect(colors.size).toBeGreaterThan(2);
    expect(colors.has(temple.fern)).toBe(false);
  });

  it('mixes toppled blocks, potsherds and dry reeds', () => {
    const colorsAt = (hash) =>
      new Set(
        rectsOf((painter) => drawRuins(painter, 50, { hash, colors: temple, tick: 0 })).map(
          (rect) => rect.color,
        ),
      );
    const kinds = new Set();
    for (let hash = 0; hash < 4 << 12; hash += 1 << 12) {
      const colors = colorsAt(hash);
      const piece = ['block', 'sherd', 'reed'].find((name) => colors.has(temple[name]));
      kinds.add(piece);
    }
    expect(kinds).toEqual(new Set(['block', 'sherd', 'reed']));
  });

  it('stays low at the bottom of the view, under the fighters feet', () => {
    for (const rect of piecesAlong(0)) {
      expect(rect.y).toBeGreaterThan(VIEW_HEIGHT - 20);
      expect(rect.y + rect.height).toBeLessThanOrEqual(VIEW_HEIGHT);
    }
  });

  it('lets only the reeds nod in the wind', () => {
    const reeds = (hash, tick) =>
      rectsOf((painter) => drawRuins(painter, 50, { hash, colors: temple, tick }));
    expect(reeds(1 << 12, 0)).not.toEqual(reeds(1 << 12, 70));
    expect(reeds(0, 0)).toEqual(reeds(0, 70));
  });
});
