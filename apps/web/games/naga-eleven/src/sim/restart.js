import { AI, KICK, PHASE_TICKS } from '../data/tuning.js';
import { rollOut } from './ball.js';
import { runTo, standStill } from './brains/steering.js';
import { countDown } from './halves.js';
import { restartAction } from './human.js';
import { act } from './intents.js';
import { moveAll, tickTimers } from './movement.js';
import { passTargetOf } from './passing.js';
import { enter } from './phase-state.js';
import { midY } from './pitch.js';
import { computerRestart, humanCross } from './restart-choice.js';
import { restartSpotOf, takerSpotOf } from './restart-spots.js';
import { stickOf } from './stick.js';
import { planTeams } from './team-plan.js';
import { directionTo, distance, lengthOf, normalized } from './vector.js';

const SET_GAP = 4;
const THROW_HEIGHT = 34;
// the taker hurries to the ball rather than jog there while everyone waits
const TAKER_HASTE = 1.6;

// a ball boy has it back on the spot once it has rolled away
function placeBall(match) {
  const { restart } = match;

  Object.assign(match.ball, { x: restart.x, y: restart.y, z: 0, vx: 0, vy: 0, vz: 0 });
  Object.assign(match.ball, { owner: null, inGoal: null, kick: null, move: null });
}

function setTaker(match, taker) {
  const isThrow = match.restart.kind === 'throwIn';

  match.ball.owner = taker.index;
  match.ball.z = isThrow ? THROW_HEIGHT : 0;
  match.restart.set = true;
  taker.facing = directionTo(taker, { x: match.restart.x, y: midY(match) });
  taker.holding = 0;
}

// a throw goes to a mate within a throw of the line, along the stick
function humanThrow(match, taker, action) {
  const mate = passTargetOf(match, taker, action.aim);

  return mate && distance(mate, taker) < KICK.throwReach
    ? { ...action, target: mate.index }
    : action;
}

const HUMAN_TAKES = {
  throwIn: humanThrow,
  corner: (match, taker, action) => (action.lofted ? humanCross(match, taker, action) : action),
};

function humanTake(match, taker) {
  const stick = stickOf(match.input);

  if (lengthOf(stick.x, stick.y) > 0) {
    taker.facing = normalized(stick.x, stick.y);
  }

  const action = restartAction(match, taker, stick);
  const shape = HUMAN_TAKES[match.restart.kind];

  return action && shape ? shape(match, taker, action) : action;
}

function takerIntent(match, taker) {
  const spot = takerSpotOf(match);
  const ready = match.phaseTicks > PHASE_TICKS.restartReady && distance(taker, spot) < SET_GAP;

  if (match.ball.owner !== taker.index) {
    if (ready) {
      setTaker(match, taker);
    }

    return { ...runTo(taker, spot, true), haste: TAKER_HASTE };
  }

  // a player who leaves a restart of theirs standing has it taken for them, so the clock cannot
  // be run down from it
  const human = taker.index === match.controlled && taker.holding <= AI.restartIdle;
  const action = human
    ? humanTake(match, taker)
    : taker.holding > AI.restartThink && computerRestart(match, taker);

  return { ...standStill(), action: action || null };
}

// the clock stops while the ball is fetched and the taker gets to it, and runs again once he
// stands over it: a restart costs only the time a side takes over it
export function restartTick(match) {
  const taker = match.players[match.restart.taker];

  if (match.phaseTicks < PHASE_TICKS.outRoll) {
    rollOut(match);
  } else if (match.phaseTicks === PHASE_TICKS.outRoll) {
    placeBall(match);
  }

  match.players.forEach((player) => tickTimers(match, player));
  planTeams(match);

  const intents = match.players.map((player) =>
    player === taker
      ? takerIntent(match, player)
      : runTo(player, restartSpotOf(match, player), true),
  );

  act(match, taker, intents[taker.index]);
  moveAll(match, intents);

  if (match.restart.set && match.ball.owner === null) {
    match.restart = null;
    enter(match, 'play');
  }

  if (!match.restart || match.restart.set) {
    countDown(match);
  }
}
