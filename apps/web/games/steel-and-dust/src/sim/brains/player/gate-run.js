import { RUN_SPEED } from '../../../config.js';
import { startMove } from '../../fighters/actions.js';
import { missionOf } from '../../stage/mission.js';
import { smashWall } from '../../stage/way-out.js';
import { comeIn, leapOver, runOffScreen, runToward, startOf, stepInHole } from './doorway-steps.js';

// the hero stops this far short of the closing wall's face, so the heavy blow lands on it
const SMASH_REACH = 18;

const ON_FOOT = new Set(['idle', 'walk', 'run', 'win']);

// a hero already up against the wall, or standing over its picture, backs off to swing at it
function runToWall(game, player, run) {
  const spot = missionOf(game).wayOut.face - SMASH_REACH;
  const off = spot - player.x;

  if (Math.abs(off) > RUN_SPEED) {
    runToward(player, Math.sign(off));
    return;
  }

  player.facing = 1;
  player.vx = 0;
  startMove(game, player, 'K1');
  run.phase = 'smash';
}

// the wall breaks as the blow lands, and the hero runs on once it is over
function smash(game, player, run) {
  if (player.hitboxActive && !game.wallSmashed) {
    smashWall(game);
  }

  if (player.state === 'attack') {
    return;
  }

  if (!game.wallSmashed) {
    smashWall(game);
  }

  Object.assign(run, { phase: 'through', free: true });
}

// the stride that would carry the hero to the doorway ends where its way through starts: a few
// steps short of a door's hole's middle, so it steps into a narrow hole there, or a jump short of a
// fence's gap, where it takes off
function runToDoorway(game, player, run) {
  const { doorway } = missionOf(game).wayOut;
  const start = startOf(doorway);

  runToward(player, 1);

  if (player.x + player.vx < start) {
    return;
  }

  player.vx = start - player.x;

  if (doorway.dark) {
    Object.assign(run, { phase: 'enter', inDoorway: true, doorway, time: 0 });
    return;
  }

  leapOver(game, player);
  Object.assign(run, { phase: 'leap', doorway });
}

function stopGone(player, run) {
  Object.assign(player, { state: 'idle', vx: 0 });
  run.phase = 'gone';
}

// into a door's hole the hero steps and fades into the dark
function goIn(_game, player, run) {
  if (stepInHole(player, run, { comingOut: false })) {
    stopGone(player, run);
  }
}

// over a fence the hero jumps, and runs on off the screen once down
function leap(game, player, run) {
  if (runOffScreen(game, player)) {
    stopGone(player, run);
  }
}

const WAY_OUT = {
  run: runToWall,
  smash,
  through: runToDoorway,
  enter: goIn,
  leap,
  gone: () => {},
};

// between two roads the hero runs on its own: off the cleared one by smashing its closing wall
// open and going in at its doorway, and onto the next one out of that doorway; a hero still in the
// air or mid-blow lands first, and a charge only ends when its button is let go, which no one
// presses now
export function thinkGateRun(game, player) {
  const run = game.gateRun;

  if (player.state === 'charge') {
    player.state = 'idle';
  }

  const setsOff = run.way === 'in' || run.phase === 'run';

  if (setsOff && !ON_FOOT.has(player.state)) {
    return;
  }

  const think = run.way === 'in' ? comeIn : WAY_OUT[run.phase];

  think(game, player, run);
}
