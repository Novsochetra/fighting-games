import { describe, expect, it } from 'vitest';
import { ULT_MAX } from '../../../src/config.js';
import { drawPlayerPanel } from '../../../src/render/hud/player-panel.js';
import { drawScore } from '../../../src/render/hud/score.js';
import { TOP_BAR_HEIGHT } from '../../../src/render/hud/top-bar.js';
import { createPainter } from '../../../src/render/painter.js';
import { createRecordingContext } from '../../support/recording-canvas.js';
import { createPlayingGame } from '../../support/test-game.js';

const FILL = /^fillRect\((-?[\d.]+),(-?[\d.]+),([\d.]+),([\d.]+)\)$/;

function filledRects(log) {
  return log
    .map((call) => call.match(FILL))
    .filter(Boolean)
    .map((match) => match.slice(1).map(Number));
}

function drawTopBar(game) {
  const { context, log } = createRecordingContext(null);
  const painter = createPainter(context);
  const view = { shownScore: game.score, hudFrames: { images: {}, ready: {} } };
  drawPlayerPanel(painter, game, view);
  drawScore(painter, game, view);
  return filledRects(log);
}

// a hero with everything on show: a weapon just picked up and nearly spent, a full ULT bar, a
// refused heavy and a long run
function busyGame() {
  const game = createPlayingGame({ records: { bestCombo: 120 } });
  game.player.weapon = { id: 'axe', durability: 3 };
  game.weaponPopup = 30;
  game.ultMeter = ULT_MAX;
  game.heavyRefusedAt = game.tickCount;
  game.score = 9999999;
  game.playTime = 59 * 3600;
  return game;
}

describe('the HUD on the top bar', () => {
  it('draws the hero and the score in two rows along the top', () => {
    for (const game of [createPlayingGame(), busyGame()]) {
      const bottoms = drawTopBar(game).map(([, y, , height]) => y + height);
      expect(Math.max(...bottoms)).toBeLessThanOrEqual(TOP_BAR_HEIGHT);
    }
  });
});
