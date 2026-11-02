import { RUN_SPEED } from '../../../config.js';
import { startRun } from '../../fighters/actions.js';
import { REVEAL_FRAMES } from '../../stage/stage-clear.js';

const PICK_UP = 0.15;
// past this far beyond a doorway's edge the hero, its weapon and its scarf are all on one side of it
const HERO_REACH = 20;
// coming out of a fence's gap, the hero walks: a step at a time, not a run
const WALK_OUT_PACE = 1.3;
// in a door's black hole the hero takes a few slow steps as it fades into the dark, or out of it,
// across the middle of the hole
export const FADE_TICKS = 30;
const FADE_PACE = 0.3;
const FADE_LEAD = (FADE_PACE * FADE_TICKS) / 2;

const middleOf = ({ left, right }) => (left + right) / 2;

// going in, the hero steps into a door's hole just short of its middle, or into a fence's gap at
// its near side and on behind its far side
export const goingInAt = (doorway) => (doorway.dark ? middleOf(doorway) - FADE_LEAD : doorway.left);
const goneAt = ({ right }) => right + HERO_REACH;

// coming out, the hero starts in a door's hole, unseen, or behind the near side of a fence's gap
export const unseenAt = (doorway) =>
  doorway.dark ? middleOf(doorway) - FADE_LEAD : doorway.left - HERO_REACH;

export function runToward(player, direction, pace = RUN_SPEED) {
  player.facing = direction;

  if (player.state !== 'run') {
    startRun(player);
  }

  player.vx += (direction * pace - player.vx) * PICK_UP;
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

// running on through a fence's gap, says when the far side hides the hero
export function runPastGap(player, doorway) {
  runToward(player, 1);

  return player.x > goneAt(doorway);
}

// walking out through a fence's gap, says when the hero is in its middle, in front of the fence
function walkOutOfGap(player, doorway) {
  runToward(player, 1, WALK_OUT_PACE);

  return player.x >= middleOf(doorway);
}

function emerge(player, run) {
  const { doorway } = run;
  const out = doorway.dark
    ? stepInHole(player, run, { comingOut: true })
    : walkOutOfGap(player, doorway);

  if (out) {
    Object.assign(run, { phase: 'run', inDoorway: false, alpha: 1 });
  }
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
    emerge(player, run);
    return;
  }

  if (player.x < run.to) {
    runToward(player, 1);
    return;
  }

  player.state = 'idle';
  game.gateRun = null;
}
