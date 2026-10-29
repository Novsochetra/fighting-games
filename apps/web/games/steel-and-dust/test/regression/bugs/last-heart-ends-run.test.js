import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../src/art/colors.js';
import { drawLives } from '../../../src/render/hud/lives.js';
import { continueRun } from '../../../src/sim/stage/flow.js';
import { hasLivesLeft } from '../../../src/sim/stage/lives.js';
import { tick } from '../../../src/sim/tick.js';
import { createPlayingGame } from '../../support/test-game.js';

// Bug: the hearts counted the life being played too, so a hero who fell with one heart on show
// lost the run, where a heart reads as a try still to come, as a spare life does in an arcade
function heartsOnShow(game) {
  let full = 0;
  const painter = {
    use(color) {
      full += color === COLORS.red ? 1 : 0;

      return painter;
    },

    rect() {
      return painter;
    },
  };

  drawLives(painter, { lives: game.lives, x: 0, y: 0 });

  return full;
}

function fall(game) {
  Object.assign(game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  tick(game);
}

function fallUntilHeartsShow(game, hearts) {
  while (heartsOnShow(game) > hearts) {
    fall(game);
    continueRun(game);
  }
}

describe('the hearts of a run', () => {
  it('start at five', () => {
    expect(heartsOnShow(createPlayingGame())).toBe(5);
  });

  it('give a hero who falls with one heart left one more try, on no hearts', () => {
    const game = createPlayingGame();

    fallUntilHeartsShow(game, 1);
    fall(game);

    expect(game.mode).toBe('over');
    expect(hasLivesLeft(game)).toBe(true);
    continueRun(game);
    expect(game.mode).toBe('play');
    expect(heartsOnShow(game)).toBe(0);
  });

  it('end the run at the fall made with no hearts left', () => {
    const game = createPlayingGame();

    fallUntilHeartsShow(game, 0);
    fall(game);

    expect(game.mode).toBe('over');
    expect(hasLivesLeft(game)).toBe(false);
  });
});
