import { resetPlay } from './combos/reset.js';
import { controlNearest, steer } from './control.js';
import { pushEvent } from './events.js';
import { kickerOf } from './formation.js';
import { enter } from './phase-state.js';
import { areasOf, attackSign, goalLineOf, midY } from './pitch.js';
import { keeperOf, nearestTo, outfieldOf } from './squad.js';
import { clamp } from './vector.js';

const LINE_MARGIN = 4;

function goalLineRestart(match, touchedBy) {
  const { ball, pitch } = match;
  const defending = ball.x < 0 ? 0 : 1;
  const above = ball.y < midY(match);

  if (touchedBy === defending) {
    return {
      kind: 'corner',
      team: 1 - defending,
      x: ball.x < 0 ? 0 : pitch.length,
      y: above ? 0 : pitch.width,
    };
  }

  const { goalArea } = areasOf(match);
  const x = goalLineOf(match, 1 - defending) + attackSign(defending) * goalArea.depth;

  return {
    kind: 'goalKick',
    team: defending,
    x,
    y: midY(match) + (above ? -1 : 1) * (goalArea.width / 4),
  };
}

// over a touchline the other side throws it in where it went out; over a goal line it is a
// corner when the defending side touched it last, else a goal kick
export function restartOf(match) {
  const { ball, pitch } = match;
  const touch = ball.lastTouch;
  const touchedBy = touch === null ? match.kickoffTeam : match.players[touch].team;

  if (ball.x >= 0 && ball.x <= pitch.length) {
    const x = clamp(ball.x, LINE_MARGIN, pitch.length - LINE_MARGIN);

    return { kind: 'throwIn', team: 1 - touchedBy, x, y: ball.y < 0 ? 0 : pitch.width };
  }

  return goalLineRestart(match, touchedBy);
}

// the keeper takes goal kicks, a midfielder or a wide forward the corners, the nearest player
// the throw-ins
function takerOf(match, restart) {
  if (restart.kind === 'goalKick') {
    return keeperOf(match, restart.team);
  }

  const outfield = outfieldOf(match, restart.team);
  const corner = outfield.filter(
    (player) => player.role !== 'defender' && player !== kickerOf(match, restart.team),
  );

  return nearestTo(restart.kind === 'corner' ? corner : outfield, restart);
}

export function startRestart(match) {
  const restart = restartOf(match);
  const taker = takerOf(match, restart);

  resetPlay(match);
  match.ball.owner = null;
  match.restart = { ...restart, taker: taker.index };
  enter(match, 'restart');

  // a pass that went out is over: nobody runs on after it once the ball is back in play
  for (const player of match.players) {
    player.receiving = 0;
  }

  pushEvent(match, { type: 'out', kind: restart.kind, team: restart.team });

  if (taker.team === match.humanTeam) {
    steer(match, taker);
  } else {
    controlNearest(match, restart);
  }
}
