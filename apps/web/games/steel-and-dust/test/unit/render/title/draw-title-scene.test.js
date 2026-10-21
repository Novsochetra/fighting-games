import { afterEach, describe, expect, it, vi } from 'vitest';
import { TITLE_SCENE_COLORS } from '../../../../src/art/title-scene.js';
import { TITLE_SCENES } from '../../../../src/data/title-scene.js';
import { drawTitleScene } from '../../../../src/render/title/draw-title-scene.js';
import { PAINTING, drawnRects, record, ticksUpTo } from './title-recorder.js';

const colors = TITLE_SCENE_COLORS;
const drawAt = (scene, tick, still = false) =>
  record((painter) => drawTitleScene(painter, { scene, painting: PAINTING, tick, colors, still }));
// how far a shared effect may stray past the edge it wraps round
const MARGIN = 16;

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each(Object.entries(TITLE_SCENES))('the %s title scene', (_orientation, scene) => {
  it('paints the painting first, then its life over it', () => {
    const { log } = drawAt(scene, 300);
    expect(log[0]).toBe('drawImage(painting,0,0)');
    expect(log.length).toBeGreaterThan(50);
  });

  it('draws exactly the same frame for the same tick, and moves as the ticks go by', () => {
    const first = drawAt(scene, 1234).log;
    expect(drawAt(scene, 1234).log).toEqual(first);
    expect(drawAt(scene, 1235).log).not.toEqual(first);
  });

  it('never calls Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    for (const tick of ticksUpTo(3000, 61)) {
      drawAt(scene, tick);
    }
    expect(random).not.toHaveBeenCalled();
  });

  it('leaves the canvas as it found it: no shift, full alpha, plain painting', () => {
    for (const tick of ticksUpTo(3000, 97)) {
      const { log, context } = drawAt(scene, tick);
      const shifts = log
        .filter((entry) => entry.startsWith('translate('))
        .map((entry) => Number(entry.slice(10, -1).split(',')[1]));
      expect(shifts.reduce((sum, shift) => sum + shift, 0)).toBe(0);
      expect(context.globalAlpha).toBe(1);
      expect(context.globalCompositeOperation ?? 'source-over').toBe('source-over');
    }
  });

  it('draws every one of its effects at some point', () => {
    for (const effect of scene.effects) {
      const alone = { ...scene, effects: [effect] };
      const draws = ticksUpTo(3000, 50).some((tick) => drawAt(alone, tick).log.length > 1);
      expect(draws, effect.kind).toBe(true);
    }
  });

  it('keeps the shifted air effects on the painting', () => {
    for (const effect of scene.effects.filter((each) => each.shiftY)) {
      const alone = { ...scene, effects: [effect] };
      for (const tick of ticksUpTo(3000, 89)) {
        const rects = drawnRects(drawAt(alone, tick).log).map((rect) => ({
          ...rect,
          y: rect.y + effect.shiftY,
        }));
        for (const rect of rects) {
          expect(rect.y, effect.kind).toBeGreaterThanOrEqual(-MARGIN);
          expect(rect.y + rect.height, effect.kind).toBeLessThanOrEqual(scene.height + MARGIN);
        }
      }
    }
  });

  it('is only the painting when it must hold still', () => {
    expect(drawAt(scene, 300, true).log).toEqual(['drawImage(painting,0,0)']);
  });
});
