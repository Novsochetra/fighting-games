import { describe, expect, it } from 'vitest';
import { HERO_THEMES } from '../../../src/art/hero-themes.js';
import { ULTIMATES } from '../../../src/data/ultimates/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { raiseSoldier } from '../../../src/sim/summons/soldiers.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

function renderedCalls(game) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  renderFrame(game, view);
  return screen.recording.log;
}

// each soldier is cut out above the ground it rises from
const soldierCuts = (log) => log.flatMap((call, i) => (call === 'clip()' ? [i] : []));

describe('the carved soldiers in the light', () => {
  it("draws a finisher's soldier behind the hero, in the world", () => {
    const game = createPlayingGame({ settings: { hero: 'angkor' } });
    runTicks(game, 2);
    raiseSoldier(game, { x: game.player.x + 30, direction: 1 });
    runTicks(game, 10);
    const log = renderedCalls(game);
    const hero = log.findIndex((call) => call.startsWith('drawImage(img(hero_'));
    expect(soldierCuts(log)).toHaveLength(1);
    expect(soldierCuts(log)[0]).toBeLessThan(hero);
  });

  it("draws the ultimate's ranks over the dimmed world, in the hero's light", () => {
    const game = createPlayingGame({ settings: { hero: 'angkor' } });
    runTicks(game, 30);
    game.ultMeter = 100;
    tap(game, 'ult');
    while (game.player.stateTime < ULTIMATES.angkor.ranks[0].at + 20) {
      runTicks(game, 1);
    }
    const log = renderedCalls(game);
    const dim = log.indexOf(`fillStyle=${HERO_THEMES.angkor.ult.dim}`);
    expect(dim).toBeGreaterThan(-1);
    expect(soldierCuts(log).length).toBeGreaterThan(4);
    expect(soldierCuts(log).every((cut) => cut > dim)).toBe(true);
  });
});
