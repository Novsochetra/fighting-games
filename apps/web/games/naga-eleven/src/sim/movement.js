import { KEEPER, PLAYER, STAMINA } from '../data/tuning.js';
import { burstPaceOf } from './skills/dribble.js';
import { dribblePaceOf, runSpeedOf, sprintSpeedOf, sprintTicksOf } from './stats.js';
import { clamp, distance, lengthOf, normalized } from './vector.js';

const SLIDE_DRAG = 0.94;
const FLOORED_DRAG = 0.8;
const DIVE_DRAG = 0.9;

function topSpeed(player, intent, hasBall) {
  const pace = (intent.sprint ? sprintSpeedOf(player) : runSpeedOf(player)) * (intent.haste ?? 1);

  return hasBall ? pace * dribblePaceOf(player) * burstPaceOf(player, hasBall) : pace;
}

// a sprint drains the legs, the stamina stat sets how fast, and walking or jogging fills them
function spendEnergy(player, intent) {
  const moving = lengthOf(player.vx, player.vy) > 1;
  const change = intent.sprint && moving ? -1 / sprintTicksOf(player) : 1 / STAMINA.refillTicks;

  player.energy = clamp(player.energy + change, 0, 1);
}

function steer(player, intent, hasBall) {
  const top = topSpeed(player, intent, hasBall);
  const { move } = intent;

  player.vx += (move.x * top - player.vx) * PLAYER.turn;
  player.vy += (move.y * top - player.vy) * PLAYER.turn;

  // a player faces the way they run, unless the brain asks them to face something else
  if (intent.face) {
    player.facing = intent.face;
  } else if (lengthOf(move.x, move.y) > 0.1) {
    player.facing = normalized(move.x, move.y);
  }

  spendEnergy(player, intent);
}

function coast(player, drag) {
  player.vx *= drag;
  player.vy *= drag;
}

function moveFreely(player, intent, hasBall) {
  if (player.dive) {
    coast(player, DIVE_DRAG);
  } else if (player.tackle > 0) {
    coast(player, SLIDE_DRAG);
  } else if (player.stun > 0) {
    coast(player, FLOORED_DRAG);
  } else {
    steer(player, intent, hasBall);
  }
}

// players may run a little off the pitch, never far
export function movePlayer(match, player, intent) {
  const { pitch } = match;
  const margin = PLAYER.worldMargin;

  moveFreely(player, intent, match.ball.owner === player.index);
  player.x = clamp(player.x + player.vx, -margin, pitch.length + margin);
  player.y = clamp(player.y + player.vy, -margin, pitch.width + margin);
  player.stride += lengthOf(player.vx, player.vy);
}

function pushApart(first, second) {
  const gap = distance(first, second);
  const overlap = PLAYER.radius * 2 - gap;

  if (overlap <= 0 || gap === 0) {
    return;
  }

  const push = overlap / 2 / gap;
  const dx = (second.x - first.x) * push;
  const dy = (second.y - first.y) * push;

  first.x -= dx;
  first.y -= dy;
  second.x += dx;
  second.y += dy;
}

// players shoulder each other aside rather than stand inside one another
export function separatePlayers(players) {
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      pushApart(players[i], players[j]);
    }
  }
}

export function tickTimers(match, player) {
  player.stun = Math.max(0, player.stun - 1);
  player.tackle = Math.max(0, player.tackle - 1);
  player.recover = Math.max(0, player.recover - 1);
  player.respite = Math.max(0, player.respite - 1);
  player.noPickup = Math.max(0, player.noPickup - 1);
  player.receiving = Math.max(0, player.receiving - 1);
  player.strike = Math.max(0, player.strike - 1);
  player.flick = Math.max(0, player.flick - 1);
  player.run = Math.max(0, player.run - 1);
  player.cooldown = Math.max(0, (player.cooldown ?? 0) - 1);
  player.burst = Math.max(0, (player.burst ?? 0) - 1);
  player.holding = match.ball.owner === player.index ? player.holding + 1 : 0;
  player.still = lengthOf(player.vx, player.vy) < PLAYER.stillSpeed ? player.still + 1 : 0;

  if (player.dive && match.tick - player.dive.tick > KEEPER.diveTicks) {
    player.dive = null;
  }
}

export function moveAll(match, intents) {
  match.players.forEach((player, i) => movePlayer(match, player, intents[i]));
  separatePlayers(match.players);
}
