import { RUN_SPEED, VIEW_WIDTH } from '../../../config.js';
import { startMove, startRun } from '../../fighters/actions.js';
import { missionOf } from '../../stage/mission.js';
import { smashWall } from '../../stage/way-out.js';

// the hero stops this far short of the closing wall's face, so the heavy blow lands on it
const SMASH_REACH = 18;
// how far past the screen's edge the hero runs before the clear goes on
const OFF_SCREEN = 24;
const PICK_UP = 0.15;

const ON_FOOT = new Set(['idle', 'walk', 'run', 'win']);

function runToward(player, direction) {
  player.facing = direction;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx += (direction * RUN_SPEED - player.vx) * PICK_UP;
}

const runRight = (player) => runToward(player, 1);

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

  run.phase = 'through';
  run.free = true;
}

function runThrough(game, player, run) {
  runRight(player);

  if (player.x > game.camera.x + VIEW_WIDTH + OFF_SCREEN) {
    Object.assign(player, { state: 'idle', vx: 0 });
    run.phase = 'gone';
  }
}

function runIn(game, player, run) {
  if (player.x < run.to) {
    runRight(player);
    return;
  }

  player.state = 'idle';
  game.gateRun = null;
}

const WAY_OUT = { run: runToWall, smash, through: runThrough, gone: () => {} };

// between two roads the hero runs on its own: off the cleared one by smashing its closing wall
// open, and onto the next one through it; a hero still in the air or mid-blow lands first, and a
// charge only ends when its button is let go, which no one presses now
export function thinkGateRun(game, player) {
  const run = game.gateRun;

  if (player.state === 'charge') {
    player.state = 'idle';
  }

  const setsOff = run.way === 'in' || run.phase === 'run';

  if (setsOff && !ON_FOOT.has(player.state)) {
    return;
  }

  const think = run.way === 'in' ? runIn : WAY_OUT[run.phase];

  think(game, player, run);
}
