import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { drawScore } from '../../../src/render/hud/score.js';
import { createPainter } from '../../../src/render/painter.js';
import { createRecordingContext } from '../../support/recording-canvas.js';
import { createPlayingGame } from '../../support/test-game.js';

// Bug: on a phone with a notch on its right, the touch pause button sat over the score. The score
// plaque was flush with the top right corner of the canvas, and the button keeps clear of the notch
// by moving in from the screen's edge, onto the canvas: about the last 20 pixels of the view.
const PAUSE_CORNER = 40;

function rightmostScorePixel(game) {
  const { context, log } = createRecordingContext(null);
  const view = { shownScore: game.score, hudFrames: { images: {}, ready: {} } };
  drawScore(createPainter(context), game, view);
  const rights = log
    .map((call) => call.match(/^fillRect\((-?[\d.]+),[^,]+,([\d.]+),/))
    .filter(Boolean)
    .map(([, x, width]) => Number(x) + Number(width));
  return Math.max(...rights);
}

describe('the score beside the touch pause button', () => {
  it('leaves the top right corner clear, even with every record on show', () => {
    const game = createPlayingGame({ records: { bestCombo: 120 } });
    game.arena = { left: 0, right: VIEW_WIDTH };
    game.stage.waveIndex = 0;
    game.score = 9999999;
    game.playTime = 59 * 3600;
    expect(rightmostScorePixel(game)).toBeLessThanOrEqual(VIEW_WIDTH - PAUSE_CORNER);
  });
});
