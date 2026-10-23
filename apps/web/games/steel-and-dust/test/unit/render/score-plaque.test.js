import { describe, expect, it } from 'vitest';
import { scorePlaque, scoreRows } from '../../../src/render/hud/score.js';
import { HERO_PLAQUE, TOP_BAR_HEIGHT } from '../../../src/render/hud/top-bar.js';
import { currentZone } from '../../../src/sim/stage/mission.js';
import { createPlayingGame } from '../../support/test-game.js';

const texts = (rows) => rows.map(({ left, right }) => [left?.text ?? null, right?.text ?? null]);

function fightingWave(game) {
  game.arena = { left: 0, right: 384 };
  game.stage.zoneIndex = 0;
  game.stage.waveIndex = 1;
  return game;
}

describe('the rows on the score plaque', () => {
  it('stacks the score over the clock', () => {
    const game = createPlayingGame();
    game.playTime = 65 * 60;
    expect(texts(scoreRows(game, 4671))).toEqual([
      ['SCORE 0004671', null],
      ['TIME 1:05', null],
    ]);
  });

  it('adds the best combo beside the score and the wave beside the clock', () => {
    const game = fightingWave(createPlayingGame({ records: { bestCombo: 46 } }));
    expect(texts(scoreRows(game, 0))).toEqual([
      ['SCORE 0000000', 'BEST 46 HITS'],
      ['TIME 0:00', `WAVE 2/${currentZone(game).waves.length}`],
    ]);
  });
});

describe('the plaque behind the score', () => {
  const cell = (text) => ({ text, color: 'x' });

  it('follows the hero plaque on the top bar, as tall as it', () => {
    const plaque = scorePlaque([{ left: cell('SCORE 0000000') }, { left: cell('TIME 0:02') }]);
    expect(plaque.x).toBeGreaterThan(HERO_PLAQUE.x + HERO_PLAQUE.width);
    expect(plaque.y).toBe(0);
    expect(plaque.height).toBe(TOP_BAR_HEIGHT);
    expect(plaque.width).toBe(51 + 16);
  });

  it('widens to fit a cell on the right', () => {
    const one = scorePlaque([{ left: cell('SCORE 0000000') }]);
    const two = scorePlaque([{ left: cell('SCORE 0000000'), right: cell('BEST 38 HITS') }]);
    expect(two.width - one.width).toBe(8 + 47);
  });
});
