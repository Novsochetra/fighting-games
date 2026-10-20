import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawForeground } from '../../../src/render/scene/foreground/index.js';
import { drawSpikes } from '../../../src/render/scene/foreground/spikes.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { drawnRects } from './ambient/ambient-recorder.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const fortress = scenePalette('wardenFortress').rubble;

function rectsOf(draw) {
  const { context, log } = createRecordingContext(null);
  draw(createPainter(context));
  return drawnRects(log);
}

const clump = (hash, tick = 0) =>
  rectsOf((painter) => drawSpikes(painter, 100, { hash, colors: fortress, tick }));

describe('the iron stakes in front of the fighters on the fortress road', () => {
  it('are what the fortress road puts in the foreground', () => {
    expect(fortress.kind).toBe('spikes');
    const colors = new Set(
      rectsOf((painter) => drawForeground(painter, 900, fortress, 0)).map((rect) => rect.color),
    );
    for (const key of ['spike', 'spikeLight', 'chain']) {
      expect(colors.has(fortress[key]), key).toBe(true);
    }
  });

  it('stand on the bottom of the view and stay below the fighters’ feet', () => {
    for (let hash = 0; hash < 64; hash++) {
      for (const rect of clump(hash * 977)) {
        expect(rect.y + rect.height).toBeLessThanOrEqual(VIEW_HEIGHT + 1);
        expect(rect.y).toBeGreaterThan(VIEW_HEIGHT - 28);
      }
    }
  });

  it('vary from clump to clump, some crowned with a skull', () => {
    const shapes = new Set();
    let skulls = 0;
    for (let hash = 0; hash < 32; hash++) {
      const rects = clump(hash * 7919);
      shapes.add(rects.map((rect) => `${rect.x},${rect.y},${rect.height}`).join('|'));
      skulls += rects.some((rect) => rect.color === fortress.bone) ? 1 : 0;
    }
    expect(shapes.size).toBeGreaterThan(20);
    expect(skulls).toBeGreaterThan(4);
    expect(skulls).toBeLessThan(28);
  });

  it('swing their chain in the wind while the stakes stay put', () => {
    const chainOf = (tick) => clump(12345, tick).filter((rect) => rect.color === fortress.chain);
    const stakesOf = (tick) => clump(12345, tick).filter((rect) => rect.color !== fortress.chain);
    expect(chainOf(0)).not.toEqual(chainOf(60));
    expect(stakesOf(0)).toEqual(stakesOf(60));
  });
});
