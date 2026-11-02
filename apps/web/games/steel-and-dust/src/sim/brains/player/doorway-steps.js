import { RUN_SPEED } from '../../../config.js';
import { startRun } from '../../fighters/actions.js';
import { REVEAL_FRAMES } from '../../stage/stage-clear.js';

const PICK_UP = 0.15;
// past this far beyond a doorway's edge the hero, its weapon and its scarf are all on one side of it
const HERO_REACH = 20;
// coming out, the hero walks: a step at a time out of the dark, not a run
const WALK_OUT_PACE = 1.3;

// going in, the hero runs on into a door's dark front first, or into a fence's opening and on
// behind its far side
export const goingInAt = ({ dark, left }) => (dark ? left - HERO_REACH : left);
export const goneAt = ({ dark, left, right }) => (dark ? left : right) + HERO_REACH;

// coming out, the hero starts out of sight in the dark or behind the near side of the opening, and
// is out once all of it has left the dark, or once it is in the middle of the opening
export const unseenAt = ({ dark, left, right }) => (dark ? right : left) - HERO_REACH;
const outAt = ({ dark, left, right }) => (dark ? right + HERO_REACH : (left + right) / 2);

export function runToward(player, direction, pace = RUN_SPEED) {
  player.facing = direction;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx += (direction * pace - player.vx) * PICK_UP;
}

// unseen in the last road's doorway while the next road opens out of the wipe, then out of it and
// on to the spot a road starts on, where the controls are handed over
export function comeIn(game, player, run) {
  if (run.phase === 'wait') {
    if (++run.time >= REVEAL_FRAMES) {
      run.phase = 'emerge';
    }

    return;
  }

  if (run.phase === 'emerge') {
    runToward(player, 1, WALK_OUT_PACE);

    if (player.x >= outAt(run.doorway)) {
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
