import { afterEach, describe, expect, it, vi } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import {
  drawDialogueOverlay,
  drawScene,
  setDialogueCanvasFactory,
} from '../../../../src/render/dialogue/index.js';
import { LETTERBOX, overlayLayout, sceneLayout } from '../../../../src/render/dialogue/layout.js';
import { SKIP_ASKING_LABEL, SKIP_LABEL } from '../../../../src/render/dialogue/skip-tag.js';
import { drawPortrait } from '../../../../src/render/portraits/index.js';
import { createScene, isSceneDone, updateScene } from '../../../../src/story/index.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { LEGEND_SCENE, VILLAGE_SCENE, idle, press } from '../../../support/story-fixtures.js';

vi.mock('../../../../src/render/portraits/index.js', async (importOriginal) => {
  const real = await importOriginal();

  return { ...real, drawPortrait: vi.fn(real.drawPortrait) };
});

afterEach(() => {
  drawPortrait.mockClear();
  setDialogueCanvasFactory(null);
});

// a pixel canvas that also keeps every call made on it and the font each text was set in
function spiedCanvas() {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);
  const context = canvas.getContext('2d');
  const calls = [];
  const spy = new Proxy(context, {
    get(target, name) {
      const value = target[name];

      if (typeof value !== 'function') {
        return value;
      }

      return (...args) => {
        calls.push({ name, args, font: target.font });

        return value(...args);
      };
    },
    set(target, name, value) {
      target[name] = value;

      return true;
    },
  });

  return { canvas, context: spy, calls };
}

// the skip tag's word is set at the dialogue's size too, but stands apart from the box
const SKIP_WORDS = new Set([...Object.values(SKIP_LABEL), ...Object.values(SKIP_ASKING_LABEL)]);

const texts = (calls, size) =>
  calls.filter(
    (call) =>
      call.name === 'fillText' &&
      call.font.includes(`400 ${size}px`) &&
      !SKIP_WORDS.has(call.args[0]),
  );

// the scene at the given line, typed to its end
function sceneAt(scene, index, options) {
  const state = createScene(scene, options);

  idle(state, 1);

  while (state.index < index) {
    press(state);
  }

  idle(state, 600);

  return state;
}

const pixelAt = (canvas, x, y) => [
  ...canvas.data.subarray((y * canvas.width + x) * 4, (y * canvas.width + x) * 4 + 3),
];

// the software canvas paints a whole scene frame in about 40 ms, so two whole scenes run past
// vitest's 5 s when every test of the arcade runs at once
const WHOLE_SCENES_TIMEOUT = 20_000;

describe('drawing a story scene', () => {
  it(
    'draws every line of a scene, as it types and once typed, with no point lost to NaN',
    () => {
      const { context, calls } = spiedCanvas();

      for (const scene of [LEGEND_SCENE, VILLAGE_SCENE]) {
        const state = createScene(scene);

        for (let tick = 0; !isSceneDone(state) && tick < 3000; tick += 1) {
          if (tick % 24 === 0) {
            drawScene(context, state, { tick });
            drawDialogueOverlay(context, state, { tick });
          }

          updateScene(state, { confirm: tick % 40 === 39 });
        }

        expect(isSceneDone(state)).toBe(true);
      }

      const numbers = calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

      expect(calls.length).toBeGreaterThan(1000);
      expect(numbers.every(Number.isFinite)).toBe(true);
    },
    WHOLE_SCENES_TIMEOUT,
  );

  it('keeps a long English line inside the box', () => {
    const { context, canvas, calls } = spiedCanvas();
    const area = sceneLayout('left').text;

    drawScene(context, sceneAt(LEGEND_SCENE, 1));

    const rows = texts(calls, 16);

    expect(rows.length).toBeGreaterThanOrEqual(6);

    for (const { args } of rows) {
      const [text, x, y] = args;
      const width = context.measureText(text).width;

      expect(x).toBeGreaterThanOrEqual(area.x);
      expect(x + width).toBeLessThanOrEqual(area.x + area.width + 1);
      expect(y).toBeGreaterThanOrEqual(area.y);
      expect(y + 16).toBeLessThanOrEqual(area.y + area.height + 1);
    }

    expect(canvas.data.some((value) => Number.isNaN(value))).toBe(false);
  });

  it('sets a Khmer line in the larger Khmer face', () => {
    const { context, calls } = spiedCanvas();

    drawScene(context, sceneAt(LEGEND_SCENE, 2, { lang: 'km' }), { lang: 'km' });

    const khmer = texts(calls, 20);

    expect(khmer.length).toBeGreaterThan(0);
    expect(khmer.every((call) => call.font.includes('Khmer'))).toBe(true);
  });

  it('stands each speaker on their side, the one on the right turned to face the left', () => {
    const { context } = spiedCanvas();

    drawScene(context, sceneAt(LEGEND_SCENE, 2, { heroAge: 'child' }));

    const [left, right] = drawPortrait.mock.calls.map(([, options]) => options);

    expect(left).toMatchObject({ character: 'ta-sok', flip: false, scale: 2, age: 'adult' });
    expect(right).toMatchObject({ character: 'sochetra', flip: true, scale: 2, age: 'child' });
    expect(left.x).toBe(sceneLayout('left').portrait.x);
    expect(right.x).toBe(sceneLayout('right').portrait.x);
    expect(left.y).toBeGreaterThan(right.y);
  });

  it('slides a speaker in from their side as they first talk', () => {
    const state = createScene(VILLAGE_SCENE);
    const xs = [];

    for (let tick = 0; tick < 16; tick += 1) {
      drawScene(spiedCanvas().context, state);
      xs.push(drawPortrait.mock.calls.at(-1)[1].x);
      updateScene(state, {});
    }

    expect(xs[0]).toBeLessThan(sceneLayout('left').portrait.x);
    expect(xs).toEqual([...xs].sort((first, second) => first - second));
    expect(xs.at(-1)).toBe(sceneLayout('left').portrait.x);
    expect(xs.every((x) => x % 2 === 0)).toBe(true);
  });

  it('shows narration as a caption, with no portrait and no name', () => {
    const { context, calls } = spiedCanvas();

    drawScene(context, sceneAt(LEGEND_SCENE, 0));

    expect(drawPortrait).not.toHaveBeenCalled();
    expect(calls.some((call) => call.name === 'fillText' && call.font.includes('700'))).toBe(false);
    expect(texts(calls, 16).length).toBeGreaterThan(0);
  });

  it('opens out of black between closing bars', () => {
    const state = createScene(LEGEND_SCENE);
    const first = spiedCanvas();

    drawScene(first.context, state);
    expect(pixelAt(first.canvas, 384, 200)).toEqual([0, 0, 0]);

    idle(state, 40);

    const later = spiedCanvas();

    drawScene(later.context, state);
    expect(pixelAt(later.canvas, 384, LETTERBOX - 1)).toEqual([0, 0, 0]);
    expect(pixelAt(later.canvas, 384, 200)).not.toEqual([0, 0, 0]);
  });

  it('lays a frame drawn once just as it draws one straight on', () => {
    const state = sceneAt(VILLAGE_SCENE, 2);
    const straight = spiedCanvas();

    drawScene(straight.context, state);
    setDialogueCanvasFactory((width, height) => createPixelCanvas(width, height));

    for (let i = 0; i < 2; i += 1) {
      const stamped = spiedCanvas();

      drawScene(stamped.context, state);

      const most = stamped.canvas.data.reduce(
        (worst, value, at) => Math.max(worst, Math.abs(value - straight.canvas.data[at])),
        0,
      );

      expect(most).toBeLessThanOrEqual(2);
      expect(stamped.calls.some((call) => call.name === 'drawImage')).toBe(true);
    }
  });
});

describe('drawing a scene over a match', () => {
  const PITCH = '#3f8f3a';

  function overPitch(state) {
    const spied = spiedCanvas();

    spied.context.fillStyle = PITCH;
    spied.context.fillRect(0, 0, VIEW.width, VIEW.height);
    drawDialogueOverlay(spied.context, state);

    return spied;
  }

  it('leaves the match above the box as it was', () => {
    const { canvas } = overPitch(sceneAt(VILLAGE_SCENE, 2));
    const { box } = overlayLayout('left');

    expect(pixelAt(canvas, 384, 100)).toEqual([0x3f, 0x8f, 0x3a]);
    expect(pixelAt(canvas, 384, box.y - 30)).toEqual([0x3f, 0x8f, 0x3a]);
    expect(pixelAt(canvas, 384, box.y + box.height / 2)).not.toEqual([0x3f, 0x8f, 0x3a]);
  });

  it('shows the speaker small inside the box, and the words beside them', () => {
    const { calls } = overPitch(sceneAt(VILLAGE_SCENE, 3));
    const layout = overlayLayout('right');
    const [options] = drawPortrait.mock.calls.map(([, each]) => each);

    expect(drawPortrait).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({
      character: 'rithy',
      scale: 1,
      flip: true,
      x: layout.portrait.x,
    });

    for (const { args } of texts(calls, 16)) {
      expect(args[1]).toBeGreaterThanOrEqual(layout.text.x);
      expect(args[1]).toBeLessThan(layout.portrait.x);
    }
  });

  it('rises into place as it opens', () => {
    const state = createScene(VILLAGE_SCENE);
    const rows = [];

    for (let tick = 0; tick < 14; tick += 1) {
      const { canvas } = overPitch(state);

      rows.push(pixelAt(canvas, 384, overlayLayout('left').box.y + 6));
      updateScene(state, {});
    }

    expect(rows[0]).toEqual([0x3f, 0x8f, 0x3a]);
    expect(rows.at(-1)).not.toEqual([0x3f, 0x8f, 0x3a]);
  });
});
