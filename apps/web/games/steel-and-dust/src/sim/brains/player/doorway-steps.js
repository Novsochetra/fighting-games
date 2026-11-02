import { RUN_SPEED } from '../../../config.js';
import { startRun } from '../../fighters/actions.js';
import { REVEAL_FRAMES } from '../../stage/stage-clear.js';

const PICK_UP = 0.15;
// the hero fades out over this many ticks going into a doorway, and in coming out of one, at a
// walk that carries it a few pixels across the doorway's middle
export const DOORWAY_TICKS = 28;
export const DOORWAY_PACE = 0.3;
// so the hero steps into a doorway this far short of its middle, and ends its fade just past it
export const DOORWAY_LEAD = (DOORWAY_PACE * DOORWAY_TICKS) / 2;

export function runToward(player, direction) {
  player.facing = direction;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx += (direction * RUN_SPEED - player.vx) * PICK_UP;
}

// one step through a doorway; says when the hero is all the way in, or all the way out
export function stepThroughDoorway(player, run, { comingOut }) {
  run.time++;
  const share = Math.min(1, run.time / DOORWAY_TICKS);

  run.alpha = comingOut ? share : 1 - share;
  player.facing = 1;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx = DOORWAY_PACE;

  return share === 1;
}

// unseen in the last road's doorway while the next road opens out of the wipe, then out of it and
// on to the spot a road starts on, where the controls are handed over
export function comeIn(game, player, run) {
  if (run.phase === 'wait') {
    if (++run.time >= REVEAL_FRAMES) {
      Object.assign(run, { phase: 'emerge', time: 0 });
    }

    return;
  }

  if (run.phase === 'emerge') {
    if (stepThroughDoorway(player, run, { comingOut: true })) {
      Object.assign(run, { phase: 'run', behind: false, alpha: 1 });
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
