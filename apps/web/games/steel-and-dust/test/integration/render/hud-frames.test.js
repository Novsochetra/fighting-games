import { describe, expect, it } from 'vitest';
import { SCORE_BOX } from '../../../src/render/hud/score.js';
import { WEAPON_BOX } from '../../../src/render/hud/top-bar.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const framesDrawn = (log) =>
  ['panel-frame.png', 'score-frame.png'].filter((file) =>
    log.some((call) => call.startsWith(`drawImage(img(${file})`)),
  );

const isHudFrame = (src) => src.includes('assets/ui/hud/');

// a frame of the fight once the road and the Shade are in, with the HUD frames loaded or not; the
// first frame asks for the road
function fightFrame({ hudFrames }) {
  const game = createPlayingGame();
  runTicks(game, 2);
  const { view, images, log } = createLateView();
  renderFrame(game, view);
  images.loadWhere((src) => hudFrames === 'loaded' || !isHudFrame(src));
  log.length = 0;
  renderFrame(game, view);
  return log;
}

describe('the carved frames on the HUD', () => {
  it('frames the player panel and the score in a fight', () => {
    expect(framesDrawn(fightFrame({ hudFrames: 'loaded' }))).toEqual([
      'panel-frame.png',
      'score-frame.png',
    ]);
  });

  it('still draws the panel and the score while their frames are on the way', () => {
    const log = fightFrame({ hudFrames: 'waiting' });
    expect(framesDrawn(log)).toEqual([]);
    for (const { x, width, height } of [WEAPON_BOX, SCORE_BOX]) {
      expect(log).toContain(`fillRect(${x + 2},2,${width - 4},${height - 4})`);
    }
  });
});
