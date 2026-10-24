import { hasLivesLeft } from './lives.js';
import { endRun } from './run-end.js';

// the run is saved as each mission starts with what it carries in, so closing the game costs at
// most the mission being played, and never hands back points scored on it
export function saveCheckpoint(game) {
  const { missionIndex, score, coins, playTime, continues, lives, ultMeter } = game;
  game.checkpoint = { mission: missionIndex, score, coins, playTime, continues, lives, ultMeter };
  game.io.saveRun(game.checkpoint);
}

// a fall costs the saved run its life too, or closing the game would give the life back
export function saveFall(game) {
  if (!hasLivesLeft(game)) {
    endRun(game, false);
    return;
  }
  if (game.checkpoint) {
    game.checkpoint.lives = game.lives;
    game.io.saveRun(game.checkpoint);
  }
}
