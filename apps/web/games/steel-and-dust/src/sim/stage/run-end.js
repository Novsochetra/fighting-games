import { DIFFICULTIES, difficultyOf } from '../../data/difficulty.js';
import { rankRun } from '../../data/leaderboard.js';

function runEntry(game, cleared) {
  const { score, missionIndex, playTime, settings } = game;
  return {
    score,
    mission: missionIndex + 1,
    hero: settings.hero,
    difficulty: DIFFICULTIES.indexOf(difficultyOf(settings)),
    time: playTime,
    cleared,
    at: game.io.now(),
  };
}

// a run ends at its last fall or with the last boss: nothing is left to continue, and its score
// goes on the leaderboard; training tools can fill the ULT bar at will, so their runs stay off it
export function endRun(game, cleared) {
  game.checkpoint = null;
  game.io.saveRun(null);
  game.lastRun = null;
  if (game.score <= 0 || game.settings.training) {
    return;
  }
  game.lastRun = runEntry(game, cleared);
  game.leaderboard = rankRun(game.leaderboard, game.lastRun);
  game.io.saveLeaderboard(game.leaderboard);
}
