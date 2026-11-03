import { describe, expect, it } from 'vitest';
import { createActorArt } from '../../../../src/render/actors/index.js';
import { UI_SCALE } from '../../../../src/config.js';
import { createCamera, project, viewOf } from '../../../../src/render/camera.js';
import { groundAtRow } from '../../../../src/render/camera/lens.js';
import { drawFrame } from '../../../../src/render/draw-frame.js';
import { createEffects, updateEffects } from '../../../../src/render/effects/index.js';
import { planOf } from '../../../../src/render/effects/move-plan.js';
import { drawOverHeads } from '../../../../src/render/hud/index.js';
import { hudBoxes } from '../../../../src/render/hud/layout.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { attackingMatch } from '../actors/match-fixture.js';

const ART = createActorArt({ createCanvas: createPixelCanvas });

function recorder() {
  const recording = createRecordingContext();

  recording.context.measureText = (text) => ({ width: [...text].length * 5 });
  recording.context.globalAlpha = 1;

  return recording;
}

// the steered side three passes in, a midfielder's Apsara Curl just played
function comboMatch() {
  const match = attackingMatch('11');
  const camera = createCamera(match);
  const effects = createEffects();
  const tickWith = (events) => {
    match.tick += 1;
    match.events = events;
    updateEffects(effects, match, { camera });
    match.events = [];
  };

  match.combo = { team: 0, level: 3, holder: match.controlled, since: match.tick, passer: 7 };
  tickWith([
    { type: 'combo', team: 0, level: 3, player: 7 },
    { type: 'skill', player: 7, move: 'apsara-curl' },
  ]);

  return { match, camera, effects, tickWith };
}

const overlaps = ([left, top, width, height], box) =>
  left < box.x + box.width &&
  left + width > box.x &&
  top < box.y + box.height &&
  top + height > box.y;

// where a player's feet go for his head to stand at a point of the view
function feetUnder(camera, head) {
  const view = viewOf(camera);
  const row = head.y * UI_SCALE + ART.standHeight - view.top;
  const y = groundAtRow(camera.lens, row);
  const scale = project(camera, 0, y).scale;

  return { x: view.x + (head.x * UI_SCALE - view.left) / scale, y };
}

const textsOf = (calls) =>
  calls.filter((call) => call.name === 'fillText').map((call) => call.args[0]);

function frameCalls({ match, camera, effects }, lang = 'en') {
  const { context, calls } = recorder();

  drawFrame(context, match, camera, {
    effects,
    actors: ART,
    createCanvas: createPixelCanvas,
    lang,
  });

  return calls;
}

describe('the combo counter and the skill pop-up over a frame', () => {
  it('show the level, COMBO, the finisher and its key, and the skill named over its player', () => {
    const texts = textsOf(frameCalls(comboMatch()));

    expect(texts).toEqual(expect.arrayContaining(['COMBO', 'FINISHER', 'SHOOT', 'APSARA CURL']));
  });

  it('say COMBO, FINISHER and the Khmer name of the skill in Khmer', () => {
    const texts = textsOf(frameCalls(comboMatch(), 'km'));

    expect(texts).toEqual(expect.arrayContaining(['ខមបូ', 'ទាត់បញ្ចប់', 'កោងអប្សរា']));
  });

  it('draw every effect before the HUD, so none is over its boxes', () => {
    const state = comboMatch();
    const calls = frameCalls(state);
    const look = new Set(planOf('apsara-curl').art.body);
    const hudFrom = calls.findIndex((call) => call.name === 'fillText' && call.args[0] === '0-0');
    const lastLook = calls.findLastIndex(
      (call) => call.name === 'fillStyle' && look.has(call.args[0]),
    );

    expect(hudFrom).toBeGreaterThan(0);
    expect(lastLook).toBeGreaterThan(0);
    expect(lastLook).toBeLessThan(hudFrom);
  });

  it('keep the pop-ups off the HUD boxes when their player runs up under them', () => {
    const state = comboMatch();
    const passer = state.match.players[7];
    const boxes = hudBoxes(state.match);
    const { context, calls } = recorder();

    for (const head of [
      { x: 40, y: 30 },
      { x: 384, y: 380 },
      { x: 700, y: 40 },
    ]) {
      Object.assign(passer, feetUnder(state.camera, head));
      calls.length = 0;
      drawOverHeads(context, state.effects, {
        match: state.match,
        camera: state.camera,
        lang: 'en',
        standHeight: ART.standHeight,
      });

      const rects = calls.filter((call) => call.name === 'fillRect').map((call) => call.args);

      expect(rects.length).toBeGreaterThan(10);
      expect(rects.filter((rect) => boxes.some((box) => overlaps(rect, box)))).toEqual([]);
    }
  });
});
