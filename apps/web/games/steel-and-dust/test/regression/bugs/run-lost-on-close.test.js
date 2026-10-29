import { describe, expect, it } from 'vitest';
import { loadSaved, persistencePorts } from '../../../src/platform/persistence.js';
import { createGame } from '../../../src/sim/create-game.js';
import { enterNextMission, resumeCheckpoint, startPlay } from '../../../src/sim/stage/flow.js';
import { tick } from '../../../src/sim/tick.js';
import { memoryStorage } from '../../support/memory-storage.js';

// Bug: a run lived only in the page. Closing the game on mission 5 and opening it again started a
// new run on mission 1, with five lives and no score.
function openGame(storage) {
  return createGame({
    ...loadSaved(storage, false),
    device: { coarsePointer: false, touchUsed: false },
    io: persistencePorts(storage),
  });
}

function playToMission(game, number) {
  startPlay(game);
  while (game.missionIndex < number - 1) {
    game.score += 1000;
    game.playTime += 600;
    enterNextMission(game);
  }
}

function fall(game) {
  Object.assign(game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  tick(game);
}

describe('a run closed part way through', () => {
  it('picks up again at the start of the mission it was on', () => {
    const storage = memoryStorage();
    playToMission(openGame(storage), 5);
    const reopened = openGame(storage);
    expect(reopened.checkpoint).toMatchObject({ mission: 4, score: 4000, lives: 6 });
    resumeCheckpoint(reopened);
    startPlay(reopened);
    expect(reopened).toMatchObject({ mode: 'play', missionIndex: 4, score: 4000, playTime: 2400 });
    expect(reopened.banner).toMatchObject({ text: 'Mission 5' });
  });

  it('keeps the lives lost since the mission began', () => {
    const storage = memoryStorage();
    const game = openGame(storage);
    playToMission(game, 3);
    fall(game);
    expect(game.mode).toBe('over');
    expect(openGame(storage).checkpoint).toMatchObject({ mission: 2, lives: 5 });
  });
});
