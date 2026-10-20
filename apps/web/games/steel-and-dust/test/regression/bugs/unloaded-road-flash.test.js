import { describe, expect, it } from 'vitest';
import { renderFrame } from '../../../src/render/render-frame.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: the walk on to the next mission flashed a plain road. The next mission's painted layers
// only started loading on its first frame, and until they came in the renderer drew the bare
// fallback soil under an empty sky, so a "default map" showed between every two missions.
const drawsAnything = (log) => log.some((call) => call.startsWith('drawImage('));

function clearFirstMission() {
  const game = createPlayingGame();
  const late = createLateView();
  renderFrame(game, late.view);
  late.images.loadAll();
  renderFrame(game, late.view);
  stageClear(game);
  while (game.missionIndex === 0) {
    runTicks(game, 1);
  }
  return { game, ...late };
}

describe('the walk on to the next mission', () => {
  it('draws nothing of the next road until its painted layers are in', () => {
    const { game, view, log } = clearFirstMission();
    for (let frame = 0; frame < 30; frame++) {
      log.length = 0;
      renderFrame(game, view);
      expect(drawsAnything(log)).toBe(false);
    }
  });

  it('fades the next road in from night once it is in', () => {
    const { game, view, images, log } = clearFirstMission();
    renderFrame(game, view);
    images.loadAll();
    log.length = 0;
    renderFrame(game, view);
    expect(log.some((call) => call.startsWith('drawImage(img(ground.png)'))).toBe(true);
    expect(game.fadeIn).toBe(23);
  });
});
