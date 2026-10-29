import { describe, expect, it, vi } from 'vitest';
import {
  enterNextMission,
  playFromStart,
  restartRun,
  resumeCheckpoint,
  startPlay,
} from '../../../src/sim/stage/flow.js';
import { createTestGame } from '../../support/test-game.js';

function gameWithTickets(settings) {
  const runStarted = vi.fn();
  return { runStarted, game: createTestGame({ settings, io: { runStarted } }) };
}

describe('a run asking for its online ticket', () => {
  it('asks as a run starts from nothing, from the title, again or from a restarted mission', () => {
    const { game, runStarted } = gameWithTickets();
    startPlay(game);
    playFromStart(game);
    game.playTime = 900;
    restartRun(game);
    expect(runStarted).toHaveBeenCalledTimes(3);
  });

  it('does not ask as the run goes on to the next mission', () => {
    const { game, runStarted } = gameWithTickets();
    startPlay(game);
    game.playTime = 900;
    enterNextMission(game);
    expect(runStarted).toHaveBeenCalledTimes(1);
  });

  it('does not ask for a saved run picked up again, which has its own', () => {
    const { game, runStarted } = gameWithTickets();
    game.checkpoint = {
      mission: 3,
      score: 5000,
      coins: 2,
      playTime: 9000,
      continues: 0,
      lives: 2,
      ultMeter: 0,
    };
    resumeCheckpoint(game);
    startPlay(game);
    expect(runStarted).not.toHaveBeenCalled();
  });

  it('does not ask for a training run, which never goes on a board', () => {
    const { game, runStarted } = gameWithTickets({ training: true });
    startPlay(game);
    expect(runStarted).not.toHaveBeenCalled();
  });
});
