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

// what a drawing painted on a pixel canvas, and how many calls it took to paint it
function paintedOf(draw) {
  const canvas = createPixelCanvas(1200, 800);

  draw(canvas.getContext('2d'));

  const points = [];

  for (let i = 3; i < canvas.data.length; i += 4) {
    if (canvas.data[i] > 0) {
      points.push([((i - 3) / 4) % canvas.width, Math.floor((i - 3) / 4 / canvas.width)]);
    }
  }

  return points;
}

function callsOf(draw) {
  const { context, calls } = createRecordingContext();

  context.globalAlpha = 1;
  draw(context);

  return calls.filter((call) => call.name === 'fillRect' || call.name === 'drawImage');
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
    const aura = { foot, height: 56, art: ART, tick: 40, strength: 1, seed: 3 };
    const draw = (context) => AURA_SHAPES[shape](context, { ...aura, bake: createPixelCanvas });

    expect(paintedOf(draw).length).toBeGreaterThan(30);
    expect(reach(paintedOf(draw), { x: foot.x, y: foot.y - 28 })).toBeLessThan(60);
    expect(callsOf(draw).length).toBeLessThan(120);
    expect(rectsOf(draw).every(isWhole)).toBe(true);
  });

  it.each(Object.keys(IMPACT_SHAPES))('bursts the %s impact where it lands', (shape) => {
    for (const age of [1, 8, 20]) {
      const at = { x: 600, y: 380 };
      const impact = {
        camera: CAMERA,
        art: ART,
        age,
        share: age / 24,
        scale: 1,
        seed: 9,
        at,
        ground: { x: 600, y: 400 },
        place: { x: 900, y: 600 },
        bake: createPixelCanvas,
      };
      const draw = (context) => IMPACT_SHAPES[shape](context, impact);

      expect(rectsOf(draw).every(isWhole), `${shape} ${age}`).toBe(true);
      expect(callsOf(draw).length, `${shape} ${age}`).toBeLessThan(140);
    }
  });

  it.each(['burst', 'ring'])('paints the kit’s %s impact round where it lands', (shape) => {
    const at = { x: 600, y: 380 };
    const painted = paintedOf((context) =>
      IMPACT_SHAPES[shape](context, { art: ART, share: 0.4, at, ground: at, scale: 1 }),
    );

    expect(painted.length).toBeGreaterThan(30);
    expect(reach(painted, at)).toBeLessThan(60);
  });
});
