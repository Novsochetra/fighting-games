import { describe, expect, it } from 'vitest';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

function recordedView() {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  return { view, log: screen.recording.log };
}

const imagesDrawn = (log) =>
  new Set(
    log.filter((call) => call.startsWith('drawImage(img(')).map((call) => call.split(',')[0]),
  );

describe('drawing from the sprite sheets', () => {
  it("draws a raider from its own sheet and the hero from the chosen Shade's strips", () => {
    const game = createPlayingGame({ settings: { hero: 'firefly' } });
    spawnEnemy(game, 'grunt', 1);
    runTicks(game, 2);
    const { view, log } = recordedView();
    renderFrame(game, view);
    const drawn = imagesDrawn(log);
    expect(drawn).toContain('drawImage(img(raider.png)');
    expect(drawn).toContain('drawImage(img(hero_idle.png)');
    expect(Object.keys(view.heroSheets)).toEqual(['moss', 'firefly']);
  });

  it('loads only the Moss Shade until another Shade is picked', () => {
    const { view } = recordedView();
    expect(Object.keys(view.heroSheets)).toEqual(['moss']);
  });
});
