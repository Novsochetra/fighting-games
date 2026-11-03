import { KICK, PLAYER } from '../data/tuning.js';
import { speedOf } from './ball.js';
import { noteTouch } from './combos/pass-combo.js';
import { chance, nextRandom, wobble } from './random.js';
import { nearestTo } from './squad.js';
import { touchSpeedOf } from './stats.js';
import { distance } from './vector.js';

const HEAVY_TICKS = 10;

export function take(match, player) {
  noteTouch(match, player);
  Object.assign(match.ball, {
    owner: player.index,
    lastTouch: player.index,
    kick: null,
    move: null,
    skillPass: null,
  });
  Object.assign(player, { holding: 0, charge: 0, charging: null, strike: 0 });

  for (const other of match.players) {
    other.receiving = 0;
  }
}

const isPressed = (match, player) =>
  distance(nearestTo(match.sides[1 - player.team], player), player) < KICK.pressedGap;

// the mate a long ball drops to was waiting for it and kills it on the chest or the thigh: most
// of its pace goes down into the grass, less of it with a man at his back
function cushionOf(match, player) {
  if (player.receiving === 0 || match.ball.z < PLAYER.reachHeight) {
    return 1;
  }

  return isPressed(match, player) ? KICK.pressedCushion : KICK.dropCushion;
}

// a ball that comes too fast for the player's touch runs off them, a shot or a clearance blocked
// anywhere at all, even back the way it came or out of play; a skill pass reaches his feet soft
function heavyTouch(match, player) {
  const { ball } = match;
  const over = speedOf(ball) * cushionOf(match, player) - touchSpeedOf(player);

  if (ball.skillPass?.receiver === player.index) {
    return false;
  }

  if (over <= 0 || !chance(match.random, over * KICK.heavyTouch)) {
    return false;
  }

  const kept = (nextRandom(match.random) - 0.3) * 0.7;
  const spin = wobble(match.random, Math.min(over, 6));

  ball.vx *= kept;
  ball.vy = ball.vy * kept + spin;
  ball.vz = Math.max(ball.vz, 0) * 0.5 + nextRandom(match.random) * over * 0.4;
  ball.lastTouch = player.index;
  ball.kick = null;
  player.noPickup = HEAVY_TICKS;

  return true;
}

export function receive(match, player) {
  if (!heavyTouch(match, player)) {
    take(match, player);
  }
}
