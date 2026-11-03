import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPRITES } from '../../../../src/data/sprites.js';
import {
  createActorArt,
  loadSprites,
  prepareMatchArt,
} from '../../../../src/render/actors/index.js';
import { createCamera, updateCamera } from '../../../../src/render/camera.js';
import { drawFrame } from '../../../../src/render/draw-frame.js';
import { createEffects, updateEffects } from '../../../../src/render/effects/index.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { tick } from '../../../../src/sim/tick.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { decodePng } from '../../../support/png.js';
import { createRecordingContext } from '../../../support/recording-context.js';

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const sprites = await loadSprites(SPRITES, { loadImage });

// a frame as the app draws one: the venue, the real sprites in each kit, the effects and the HUD
function recorder() {
  const recording = createRecordingContext();

  recording.context.measureText = (text) => ({ width: [...text].length * 5 });

  return recording;
}

const numbersOf = (calls) =>
  calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

describe('a match the sim plays, drawn as the app draws it', () => {
  it('draws every so often through every phase it reaches, with no NaN', () => {
    const match = createMatch({ seed: 7, format: '7', humanTeam: 0, halfSeconds: 20 });
    const actors = createActorArt({ sprites, createCanvas: createPixelCanvas });
    const camera = createCamera(match);
    const effects = createEffects();
    const phases = new Set();

    prepareMatchArt(actors, match);

    for (let i = 0; i < 3200 && match.phase !== 'over'; i += 1) {
      tick(match);
      updateCamera(camera, match);
      updateEffects(effects, match, { camera });
      drainEvents(match);

      if (i % 97 === 0 || !phases.has(match.phase)) {
        const { context, calls } = recorder();

        phases.add(match.phase);
        drawFrame(context, match, camera, {
          venue: 'village-field',
          actors,
          effects,
          createCanvas: createPixelCanvas,
        });

        expect(numbersOf(calls).every(Number.isFinite), `${match.tick} ${match.phase}`).toBe(true);
      }
    }

    expect([...phases]).toEqual(expect.arrayContaining(['kickoff', 'play', 'halfTime']));
  });
});
