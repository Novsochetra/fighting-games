import { dribble, lineCrossing, stepBall } from './ball.js';
import { watchChains } from './combos/chains.js';
import { watchCombo } from './combos/pass-combo.js';
import { updateControl } from './control.js';
import { scoreGoal } from './goal.js';
import { countDown } from './halves.js';
import { act, intentOf } from './intents.js';
import { moveAll, tickTimers } from './movement.js';
import { meetBall } from './possession.js';
import { startRestart } from './restart-setup.js';
import { saveCamBeforeGoal } from './save-cam.js';
import { throwBlocks } from './skills/block.js';
import { followBurst } from './skills/dribble.js';
import { refillSpirit } from './spirit.js';
import { resolveTackles } from './tackle.js';
import { planTeams } from './team-plan.js';

function moveBall(match) {
  const { ball } = match;

  if (ball.owner === null) {
    return stepBall(match);
  }

  dribble(ball, match.players[ball.owner]);

  return lineCrossing(match);
}

function prepare(match) {
  for (const player of match.players) {
    tickTimers(match, player);
    refillSpirit(player);
  }

  if (match.ball.owner !== null) {
    followBurst(match, match.players[match.ball.owner]);
  }

  updateControl(match);
  planTeams(match);
}

// a skill's shot going in plays the save cam first, when the match is watched
function goalIn(match) {
  if (!saveCamBeforeGoal(match, match.ball.inGoal)) {
    scoreGoal(match, match.ball.inGoal);
  }
}

// what the players chose plays out: a special or a duel may stop the tick part way
function playersAct(match) {
  const intents = match.players.map((player) => intentOf(match, player));

  for (const player of match.players) {
    act(match, player, intents[player.index]);

    if (match.phase !== 'play') {
      return false;
    }
  }

  moveAll(match, intents);

  return !match.hooks?.duel?.(match);
}

export function playTick(match) {
  prepare(match);

  if (!playersAct(match)) {
    return;
  }

  resolveTackles(match);

  const crossing = moveBall(match);

  if (crossing === 'goal') {
    goalIn(match);

    return;
  }

  if (crossing === 'out') {
    startRestart(match);

    return;
  }

  throwBlocks(match);
  meetBall(match);
  watchCombo(match);
  watchChains(match);

  // a save may have stopped play for the save cam: the clock waits with it
  if (match.phase === 'play') {
    countDown(match);
  }
}
