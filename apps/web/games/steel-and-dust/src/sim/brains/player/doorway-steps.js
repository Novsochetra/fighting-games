import { RUN_SPEED, VIEW_WIDTH } from '../../../config.js';
import { jump, startRun } from '../../fighters/actions.js';
import { REVEAL_FRAMES } from '../../stage/stage-clear.js';

const PICK_UP = 0.15;
// past this far beyond the screen's edge the hero, its weapon and its scarf are all off it
const HERO_REACH = 20;
// in a door's black hole the hero takes a few slow steps as it fades into the dark, or out of it,
// across the middle of the hole
export const FADE_TICKS = 30;
const FADE_PACE = 0.3;
const FADE_LEAD = (FADE_PACE * FADE_TICKS) / 2;
// a broken fence is low enough to jump: the hero takes off this far short of its gap and comes
// down well past it
const LEAP = { vy: -5.8, vx: 2.4 };
const LEAP_LEAD = 42;

const middleOf = ({ left, right }) => (left + right) / 2;

// where the hero's way through a doorway starts, going in or coming out: a few steps short of a
// door's hole's middle, or a jump short of a fence's gap
export const startOf = (doorway) =>
  doorway.dark ? middleOf(doorway) - FADE_LEAD : doorway.left - LEAP_LEAD;

export function runToward(player, direction, pace = RUN_SPEED) {
  player.facing = direction;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx += (direction * pace - player.vx) * PICK_UP;
}

export function leapOver(game, player) {
  player.facing = 1;
  jump(game, player, LEAP);
}

// once down past a fence, the hero runs on off the screen; says when it is off it
export function runOffScreen(game, player) {
  if (player.airborne) {
    return false;
  }

  runToward(player, 1);

  return player.x > game.camera.x + VIEW_WIDTH + HERO_REACH;
}

// one slow step in a door's hole, fading out going in or in coming out; says when the fade is done
export function stepInHole(player, run, { comingOut }) {
  run.time++;
  const share = Math.min(1, run.time / FADE_TICKS);

  run.alpha = comingOut ? share : 1 - share;
  player.facing = 1;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx = FADE_PACE;

  return share === 1;
}

// out of sight while the next road opens out of the wipe, then out of the last road's door, or
// over its fence, and on to the spot a road starts on, where the controls are handed over
function leaveCover(game, player, run) {
  if (++run.time < REVEAL_FRAMES) {
    return;
  }

  if (run.doorway.dark) {
    Object.assign(run, { phase: 'emerge', time: 0 });
    return;
  }

  leapOver(game, player);
  Object.assign(run, { phase: 'run', inDoorway: false });
}

export function comeIn(game, player, run) {
  if (run.phase === 'wait') {
    leaveCover(game, player, run);
    return;
  }

  if (run.phase === 'emerge') {
    if (stepInHole(player, run, { comingOut: true })) {
      Object.assign(run, { phase: 'run', inDoorway: false });
    }

    return;
  }

  if (player.x < run.to) {
    runToward(player, 1);
    return;
  }

  player.state = 'idle';
  game.gateRun = null;
}
