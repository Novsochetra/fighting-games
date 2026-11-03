import { BALL } from '../data/tuning.js';
import { ownGoalLineOf } from './pitch.js';
import { chance, nextRandom } from './random.js';

const PARRY_TICKS = 24;
const TIP = { share: 0.35, least: 2.5, ticks: 6, over: 14 };
// a punch is a parry thrown further, out wide of the goal; a wall stands big and it bounces back
const PUNCH = { back: 0.4, wide: 4, lift: 3 };
const WALL = { back: 0.5, across: 0.2, lift: 2 };

const eitherSide = (match) => (nextRandom(match.random) < 0.5 ? -1 : 1);

function offTheKeeper(match, keeper) {
  match.ball.lastTouch = keeper.index;
  match.ball.kick = null;
  match.ball.move = null;
  keeper.noPickup = PARRY_TICKS;
}

// tipped on over the bar: it clears the crossbar before it reaches the line, for a corner
function tipOver(match, keeper) {
  const { ball, goal } = match;
  const line = ownGoalLineOf(match, keeper.team);
  const sign = Math.sign(line - ball.x) || 1;
  const vx = sign * Math.max(TIP.least, Math.abs(line - ball.x) / TIP.ticks);
  const ticks = Math.max(1, Math.abs(line - ball.x) / Math.abs(vx));

  ball.vx = vx;
  ball.vy *= 0.3;
  ball.vz = (goal.height + TIP.over - ball.z + (BALL.gravity * ticks * (ticks + 1)) / 2) / ticks;
}

// a shot too hot to hold comes off the keeper's gloves, back out and wide, or over the bar
export function parry(match, keeper) {
  const { ball } = match;
  const wide = eitherSide(match);

  if (chance(match.random, TIP.share)) {
    tipOver(match, keeper);
  } else {
    ball.vx = -ball.vx * 0.3;
    ball.vy = wide * (2.5 + Math.abs(ball.vy) * 0.5);
    ball.vz = Math.abs(ball.vz) * 0.5 + 1.5;
  }

  offTheKeeper(match, keeper);
}

export function punchOut(match, keeper) {
  const { ball } = match;
  const wide = eitherSide(match);

  ball.vx = -ball.vx * PUNCH.back;
  ball.vy = wide * (PUNCH.wide + Math.abs(ball.vy) * 0.5);
  ball.vz = PUNCH.lift;
  offTheKeeper(match, keeper);
}

export function bounceBack(match, keeper) {
  const { ball } = match;

  ball.vx = -ball.vx * WALL.back;
  ball.vy = ball.vy * WALL.across + (nextRandom(match.random) - 0.5);
  ball.vz = WALL.lift;
  offTheKeeper(match, keeper);
}
