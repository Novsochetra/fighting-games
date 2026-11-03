import { describe, expect, it } from 'vitest';
import { LOOK_ART } from '../../../../src/art/duel/looks.js';
import { EFFECT_SHAPES } from '../../../../src/data/move-effects.js';
import { AURA_SHAPES } from '../../../../src/render/effects/auras/index.js';
import { IMPACT_SHAPES } from '../../../../src/render/effects/impacts/index.js';
import { resample } from '../../../../src/render/effects/path.js';
import { TRAIL_SHAPES } from '../../../../src/render/effects/trails/index.js';
import { createCamera } from '../../../../src/render/camera.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

const ART = LOOK_ART.naga;
const CAMERA = createCamera(fixtureMatch());

function rectsOf(draw) {
  const { context, calls } = createRecordingContext();

  context.globalAlpha = 1;
  draw(context);

  return calls.filter((call) => call.name === 'fillRect').map((call) => call.args);
}

const isWhole = (rect) => rect.every(Number.isInteger);
const reach = (rects, centre) =>
  Math.max(...rects.map(([x, y]) => Math.hypot(x - centre.x, y - centre.y)));

// a ball's path drawn left to right or right to left, rising a little
function trailGoing(way) {
  const path = Array.from({ length: 16 }, (_, i) => ({ x: 400 + way * i * 14, y: 300 - i * 2 }));
  const { samples, step } = resample(path, { most: 24 });

  return {
    samples,
    step,
    head: path.at(-1),
    flip: way < 0,
    art: ART,
    tick: 77,
    age: 12,
    alpha: 1,
    seed: 5,
    river: [{ x: 330, y: 320 }, ...path.slice(0, 1)],
    bake: createPixelCanvas,
  };
}

describe('the shapes a move draws on the pitch', () => {
  it('has a drawing for every shape move-effects.js names', () => {
    expect([...Object.keys(TRAIL_SHAPES), 'afterimage'].sort()).toEqual(
      [...EFFECT_SHAPES.trail].sort(),
    );
    expect(Object.keys(AURA_SHAPES).sort()).toEqual([...EFFECT_SHAPES.aura].sort());
    expect(Object.keys(IMPACT_SHAPES).sort()).toEqual([...EFFECT_SHAPES.impact].sort());
  });

  it.each(Object.keys(TRAIL_SHAPES))('draws the %s trail on whole pixels, either way', (shape) => {
    for (const way of [1, -1]) {
      const trail = trailGoing(way);
      const rects = rectsOf((context) => TRAIL_SHAPES[shape](context, trail));

      expect(rects.length, shape).toBeGreaterThan(8);
      expect(rects.every(isWhole), shape).toBe(true);
      expect(
        rectsOf((context) => TRAIL_SHAPES[shape](context, { ...trail, bake: null })).length,
      ).toBeGreaterThanOrEqual(rects.length);
      expect(reach(rects, trail.head), shape).toBeLessThan(300);
      expect(rects.length, shape).toBeLessThan(200);
    }
  });

  it.each(Object.keys(AURA_SHAPES))('wraps the %s aura round its player', (shape) => {
    const foot = { x: 500, y: 400 };
    const rects = rectsOf((context) =>
      AURA_SHAPES[shape](context, { foot, height: 56, art: ART, tick: 40, strength: 1, seed: 3 }),
    );

    expect(rects.length).toBeGreaterThan(8);
    expect(rects.length).toBeLessThan(120);
    expect(rects.every(isWhole)).toBe(true);
    expect(reach(rects, { x: foot.x, y: foot.y - 28 })).toBeLessThan(60);
  });

  it.each(Object.keys(IMPACT_SHAPES))('bursts the %s impact where it lands', (shape) => {
    for (const age of [1, 8, 20]) {
      const at = { x: 600, y: 380 };
      const rects = rectsOf((context) =>
        IMPACT_SHAPES[shape](context, {
          camera: CAMERA,
          art: ART,
          age,
          share: age / 24,
          scale: 1,
          seed: 9,
          at,
          ground: { x: 600, y: 400 },
          place: { x: 900, y: 600 },
        }),
      );

      expect(rects.every(isWhole), `${shape} ${age}`).toBe(true);
      expect(rects.length, `${shape} ${age}`).toBeLessThan(140);
    }
  });
});
