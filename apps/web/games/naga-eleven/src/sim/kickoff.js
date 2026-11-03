import { PHASE_TICKS } from '../data/tuning.js';
import { createBall } from './ball.js';
import { runTo } from './brains/steering.js';
import { controlNearest, steer } from './control.js';
import { pushEvent } from './events.js';
import { kickerOf, kickoffSpot } from './formation.js';
import { moveAll } from './movement.js';
import { enter } from './phase-state.js';
import { midX, midY } from './pitch.js';
import { take } from './touch.js';

const STILL = {
  vx: 0,
  vy: 0,
  stun: 0,
  tackle: 0,
  recover: 0,
  respite: 0,
  noPickup: 0,
  receiving: 0,
  holding: 0,
  charge: 0,
  charging: null,
  strike: 0,
  flick: 0,
  flickAim: null,
  run: 0,
  spot: null,
  dive: null,
};

export function setKickoff(match, team) {
  enter(match, 'kickoff');
  match.kickoffTeam = team;
  match.ball = createBall(match);
  match.restart = { kind: 'kickoff', team, x: midX(match), y: midY(match) };

  for (const player of match.players) {
    Object.assign(player, kickoffSpot(match, player, team), STILL);
  }

  if (team === match.humanTeam) {
    steer(match, kickerOf(match, team));
  } else {
    controlNearest(match);
  }
}

export function kickoffTick(match) {
  if (match.phaseTicks < PHASE_TICKS.kickoff) {
    return;
  }

  take(match, kickerOf(match, match.kickoffTeam));
  match.restart = null;
  match.lastKickoff = match.tick;
  pushEvent(match, { type: 'whistle', kind: 'kickoff', half: match.half });
  enter(match, 'play');
}

export function walkToKickoff(match, team) {
  moveAll(
    match,
    match.players.map((player) => runTo(player, kickoffSpot(match, player, team))),
  );
}
