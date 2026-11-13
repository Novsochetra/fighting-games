import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setBakeCanvas } from '../../../../dev/camera-lab/src/naga-shot/draw/bake.js';
import { layerKey, NAGA_LAYERS } from '../../../../dev/camera-lab/src/naga-shot/layers.js';
import { STAGE_IDS } from '../../../../dev/camera-lab/src/naga-shot/sequence.js';
import { ENDINGS } from '../../../../dev/camera-lab/src/naga-shot/world.js';
import { DEFAULT_SETTINGS } from '../../../../dev/camera-lab/src/options.js';
import { createPlayer, seek } from '../../../../dev/camera-lab/src/player.js';
import { createScene } from '../../../../dev/camera-lab/src/scenes.js';
import { createActorArt } from '../../../../src/render/actors/index.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { painted, strictContext } from '../../render/duel/strict-context.js';

const actors = createActorArt({ createCanvas: createPixelCanvas });

const playerFor = (changes = {}) => {
  const settings = { ...DEFAULT_SETTINGS, scene: 'naga', ...changes };

  return createPlayer(() => createScene(settings));
};

function drawnAt(player, frame) {
  const { canvas, context, bad } = strictContext();

  seek(player, frame);
  player.scene.draw(context, { tick: frame, lang: 'en', actors });

  return { canvas, bad };
}

const stageFrom = (player, stage) => player.stages.find((entry) => entry.stage === stage).from + 1;

const CASES = ENDINGS.flatMap((ending) =>
  ['full', 'short', 'off'].map((camera) => [`${ending} on ${camera}`, { ending, camera }]),
);

beforeEach(() => setBakeCanvas(createPixelCanvas));

afterEach(() => setBakeCanvas(null));

describe('the camera lab plays the Naga Shot', { timeout: 60000 }, () => {
  it('opens on it', () => {
    expect(DEFAULT_SETTINGS.scene).toBe('naga');
  });

  it.each(CASES)('in its eight beats, drawn from start to end (%s)', (_, changes) => {
    const player = playerFor(changes);
    const bad = [];

    expect(player.stages.map((entry) => entry.stage)).toEqual(STAGE_IDS);

    for (let frame = 0; frame <= player.total; frame += 7) {
      bad.push(...drawnAt(player, frame).bad);
    }

    expect(bad).toEqual([]);
  });

  it('plays the build-up short once seen', () => {
    expect(playerFor({ repeat: true }).total).toBeLessThan(playerFor().total);
  });

  it('draws a frame the same however it was reached', () => {
    const player = playerFor({ ending: 'punch' });
    const frame = stageFrom(player, 'collision') + 4;
    const straight = drawnAt(player, frame).canvas.data.join();

    seek(player, player.total);

    expect(drawnAt(player, frame).canvas.data.join()).toBe(straight);
  });

  it.each(NAGA_LAYERS.filter((layer) => !['shake', 'bars', 'titles'].includes(layer)))(
    'draws less with the %s hidden, at a frame it shows in',
    (layer) => {
      const frames = { naga: 'manifest', trail: 'flight', keeper: 'keeper', flash: 'collision' };
      const at = (player) => stageFrom(player, frames[layer] ?? 'impact') + 10;
      const shown = playerFor();
      const hidden = playerFor({ [layerKey(layer)]: false });

      expect(drawnAt(hidden, at(hidden)).canvas.data.join()).not.toBe(
        drawnAt(shown, at(shown)).canvas.data.join(),
      );
    },
  );

  it('still draws its world with every layer hidden, and with nothing to bake on', () => {
    const hideAll = Object.fromEntries(NAGA_LAYERS.map((layer) => [layerKey(layer), false]));
    const player = playerFor(hideAll);

    setBakeCanvas(null);

    const { canvas, bad } = drawnAt(player, stageFrom(player, 'manifest') + 40);

    expect(painted(canvas)).toBe(true);
    expect(bad).toEqual([]);
  });
});
