import { describe, expect, it } from 'vitest';
import { TITLE_SCENE_COLORS } from '../../../../src/art/title-scene.js';
import { drawSunGlow, sunBreath } from '../../../../src/render/title/sun-glow.js';
import { drawSunRays, rayLight } from '../../../../src/render/title/sun-rays.js';
import { createPainter } from '../../../../src/render/painter.js';
import { createRecordingContext, RecordingCanvas } from '../../../support/recording-canvas.js';
import { drawnRects, record, ticksUpTo } from './title-recorder.js';

const SUN = { x: 120, y: 60, radius: 12 };
const GLOW = { kind: 'sunGlow', ...SUN };
const RAYS = { kind: 'sunRays', ...SUN, alpha: 0.15 };
const colors = TITLE_SCENE_COLORS;
const glowAt = (tick) => record((painter) => drawSunGlow(painter, { effect: GLOW, tick, colors }));
const raysAt = (tick) => record((painter) => drawSunRays(painter, { effect: RAYS, tick, colors }));
const alphas = (log) =>
  log.filter((entry) => entry.startsWith('globalAlpha=')).map((entry) => Number(entry.slice(12)));
// the light it was drawn with, without the full alpha it hands back at the end
const lights = (log) => alphas(log).filter((alpha) => alpha < 1);
// the tick of the breath's low and its high
const LOW = 0;
const HIGH = Math.round(Math.PI / 0.011);

describe('the sun breathing', () => {
  it('breathes in and out over about ten seconds', () => {
    expect(sunBreath(LOW)).toBe(0);
    expect(sunBreath(HIGH)).toBeCloseTo(1, 3);
    const breaths = ticksUpTo(1200, 1).map(sunBreath);
    expect(breaths.every((breath) => breath >= 0 && breath <= 1)).toBe(true);
  });

  it('glows in halos round the sun, brighter and wider at the top of a breath', () => {
    const low = drawnRects(glowAt(LOW).log);
    const high = drawnRects(glowAt(HIGH).log);
    const reach = (rects) => Math.max(...rects.map((rect) => rect.y + rect.height - SUN.y));
    expect(reach(high)).toBeGreaterThan(reach(low));
    expect(Math.max(...lights(glowAt(HIGH).log))).toBeGreaterThan(
      Math.max(...lights(glowAt(LOW).log)),
    );
    for (const rect of high) {
      expect(rect.x + rect.width / 2).toBeCloseTo(SUN.x + 0.5, 0);
      expect(colors.sun).toContain(rect.color);
    }
  });

  it('adds its light and leaves the canvas as it found it', () => {
    const { log, context } = glowAt(HIGH);
    expect(log).toContain('globalCompositeOperation=lighter');
    expect(context.globalCompositeOperation).toBe('source-over');
    expect(context.globalAlpha).toBe(1);
    expect(alphas(log).every((alpha) => alpha > 0 && alpha <= 1)).toBe(true);
  });
});

describe('the sun glow on stamps', () => {
  it('lays each halo down as one disc, cut once for every size and color it breathes through', () => {
    const { context, log } = createRecordingContext(null);
    const made = [];
    const painter = createPainter(context, () => {
      made.push(new RecordingCanvas());
      return made.at(-1);
    });
    const ticks = ticksUpTo(1200, 1);
    for (const tick of ticks) {
      drawSunGlow(painter, { effect: GLOW, tick, colors });
    }
    // five halos, each at the three sizes of a breath
    expect(made.length).toBeLessThanOrEqual(15);
    expect(log.some((call) => call.startsWith('fillRect('))).toBe(false);
    expect(log.filter((call) => call.startsWith('drawImage('))).toHaveLength(5 * ticks.length);
  });
});

describe('the sun rays', () => {
  it('fan up into the sky from the sun, never below it', () => {
    for (const tick of ticksUpTo(1200, 97)) {
      const rects = drawnRects(raysAt(tick).log);
      expect(rects.length).toBeGreaterThan(0);
      for (const rect of rects) {
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeLessThanOrEqual(SUN.y - SUN.radius);
        expect(rect.height).toBe(1);
      }
    }
  });

  it('are faint, fade as they reach up and leave the canvas as they found it', () => {
    const { log, context } = raysAt(300);
    const seen = lights(log);
    expect(Math.max(...seen)).toBeLessThanOrEqual(RAYS.alpha);
    expect(Math.min(...seen)).toBeLessThan(RAYS.alpha / 2);
    expect(context.globalCompositeOperation).toBe('source-over');
    expect(context.globalAlpha).toBe(1);
  });

  it('each brighten and dim on a beat of their own', () => {
    const together = ticksUpTo(1200, 10).filter(
      (tick) => Math.abs(rayLight(0, tick) - rayLight(1, tick)) < 0.1,
    );
    expect(together.length).toBeLessThan(40);
  });
});
