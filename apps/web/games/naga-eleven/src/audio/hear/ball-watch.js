import { cueOf, kickCueOf } from './event-cues.js';

const KICKS = new Set(['pass', 'shot']);
const TOUCHES = new Set(['pass', 'shot', 'save', 'tackle', 'goal', 'duel', 'duelEnd']);

// near enough the goal line, a post or the bar for a turn of the ball to be the frame's
const FRAME_REACH = 16;
const BAR_REACH = 10;

// a ball whose line turns by more than about 25 degrees struck something
const TURNED = 0.9;
const MOVING = 2;

// a ball can shiver on the bar for a tick or two: one ring is enough
const RING_TICKS = 12;

const latestKickOf = (players) =>
  players.reduce((latest, player) => Math.max(latest, player.lastKick ?? -Infinity), -Infinity);

// a kick that pushed no event of its own: a header on, or a clearance
function quietKick(match, ear, events) {
  const kicked = new Set(
    events.filter((event) => KICKS.has(event.type)).map((event) => event.player),
  );
  const heard = ear.heardKick;
  const fresh = match.players.some(
    (player) => (player.lastKick ?? -Infinity) > heard && !kicked.has(player.index),
  );

  ear.heardKick = latestKickOf(match.players);

  if (heard === null || !fresh || match.ball.owner !== null) {
    return [];
  }

  return [cueOf(kickCueOf(match.ball) === 'header' ? 'header' : 'loft')];
}

function frameOf({ ball, pitch, goal }) {
  const line = ball.x > pitch.length / 2 ? pitch.length : 0;
  const across = Math.abs(ball.y - pitch.width / 2);

  if (Math.abs(ball.x - line) > FRAME_REACH) {
    return null;
  }

  if (Math.abs(across - goal.width / 2) < FRAME_REACH && ball.z < goal.height + BAR_REACH) {
    return 'post';
  }

  return Math.abs(ball.z - goal.height) < BAR_REACH && across < goal.width / 2 ? 'bar' : null;
}

function turned(before, ball) {
  const speedBefore = Math.hypot(before.vx, before.vy);
  const speedNow = Math.hypot(ball.vx, ball.vy);

  return (
    speedBefore > MOVING &&
    before.vx * ball.vx + before.vy * ball.vy < TURNED * speedBefore * speedNow
  );
}

// the sim pushes no event for the frame, so the ear hears a loose ball turn by a post or the bar
function frameHit(match, ear, touched) {
  const { ball } = match;
  const before = ear.ball;

  ear.ball = { vx: ball.vx, vy: ball.vy };

  if (!before || touched || ball.owner !== null || (ball.inGoal ?? null) !== null) {
    return [];
  }

  const part = turned(before, ball) ? frameOf(match) : null;

  if (!part || match.tick - ear.rang < RING_TICKS) {
    return [];
  }

  ear.rang = match.tick;

  return [cueOf('post', { bar: part === 'bar' }), cueOf('ooh')];
}

export function watchBall(match, ear, events) {
  const kick = quietKick(match, ear, events);
  const touched = kick.length > 0 || events.some((event) => TOUCHES.has(event.type));

  return [...kick, ...frameHit(match, ear, touched)];
}
