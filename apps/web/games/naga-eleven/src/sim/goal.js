import { PHASE_TICKS } from '../data/tuning.js';
import { stepBall } from './ball.js';
import { resetPlay } from './combos/reset.js';
import { pushEvent } from './events.js';
import { endHalf } from './halves.js';
import { setKickoff, walkToKickoff } from './kickoff.js';
import { enter } from './phase-state.js';
import { concedeSpirit } from './spirit.js';

// the last to touch it scores, unless they were of the side it went in against: an own goal; the
// side that let it in has its stars stirred
export function scoreGoal(match, team) {
  const { lastTouch, move } = match.ball;
  const toucher = lastTouch === null ? null : match.players[lastTouch];

  resetPlay(match);
  concedeSpirit(match, 1 - team);
  match.score[team] += 1;
  match.lastScorer = team;
  match.ball.owner = null;
  match.restart = null;
  enter(match, 'goal');
  pushEvent(match, {
    type: 'goal',
    team,
    scorer: toucher?.team === team ? toucher.index : null,
    move: move ?? null,
  });
}

// the players walk back to their places while the ball sits in the net
export function goalTick(match) {
  const kickingTeam = 1 - match.lastScorer;

  walkToKickoff(match, kickingTeam);
  stepBall(match);

  if (match.phaseTicks < PHASE_TICKS.goal) {
    return;
  }

  if (match.clock === 0) {
    endHalf(match);
  } else {
    setKickoff(match, kickingTeam);
  }
}
