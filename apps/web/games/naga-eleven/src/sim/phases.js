import { goalTick } from './goal.js';
import { halfTimeTick, overTick } from './halves.js';
import { kickoffTick } from './kickoff.js';
import { playTick } from './play.js';
import { restartTick } from './restart.js';
import { saveCamTick } from './save-cam.js';

// while a duel plays out the duel module runs the match; with none attached it stands still
function duelTick(match) {
  match.hooks?.duelTick?.(match);
}

export const PHASES = {
  kickoff: kickoffTick,
  play: playTick,
  restart: restartTick,
  duel: duelTick,
  goal: goalTick,
  saveCam: saveCamTick,
  halfTime: halfTimeTick,
  over: overTick,
};

export { setKickoff } from './kickoff.js';
