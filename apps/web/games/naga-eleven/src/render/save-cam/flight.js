import { clamp01, lerp } from '../duel/hash.js';
import { BEATS, contactTick, playTicks } from './timing.js';
import { aimPoint, BALL_SIZE, DEPTH } from './view.js';

const START = { x: 0.15, y: BALL_SIZE, z: DEPTH.strike };

// the share of the way to the line at which the ball reaches the keeper
export const KEEPER_SHARE = (DEPTH.keeper - DEPTH.strike) / (DEPTH.line - DEPTH.strike);

const GRAVITY = 0.006;

// a point on the shot's way, `share` of it from the foot to the goal line; it rises a little in
// the middle of its flight and dips at the end, as a struck ball does
export function shotPoint(aim, share) {
  const to = aimPoint(aim);

  return {
    x: lerp(START.x, to.x, share),
    y: lerp(START.y, to.y, share) + Math.sin(Math.PI * Math.min(1, share)) * 0.35,
    z: lerp(START.z, to.z, share),
  };
}

// the height of a ball thrown up at `speed` after `since` ticks, bouncing on the grass at half
// the speed it came down at
function heightOf(from, speed, since) {
  const landing =
    (speed + Math.sqrt(speed * speed + 2 * GRAVITY * Math.max(0, from - BALL_SIZE))) / GRAVITY;

  if (since <= landing) {
    return from + speed * since - (GRAVITY * since * since) / 2;
  }

  const bounce = (GRAVITY * landing - speed) * 0.5;
  const after = since - landing;

  return Math.max(BALL_SIZE, BALL_SIZE + bounce * after - (GRAVITY * after * after) / 2);
}

// thrown off the keeper or the post: a speed across, up and back, and the drop; past the camera
// it is gone
function thrown(from, { velocity, since }) {
  const depth = from.z + velocity.z * since;

  return {
    x: from.x + velocity.x * since,
    y: heightOf(from.y, velocity.y, since),
    z: depth,
    gone: depth < DEPTH.strike - 0.4,
  };
}

const outward = (moment, at) => (at.x === 0 ? moment.dive || 1 : Math.sign(at.x));

// where the ball goes once it meets the keeper, the post or the net, by what came of it
const AFTER = {
  catch: () => ({ held: true }),
  goal: (moment, since) => {
    if (since < 4) {
      return shotPoint(moment.aim, lerp(KEEPER_SHARE, 1, since / 4));
    }

    const line = shotPoint(moment.aim, 1);
    const into = Math.min(1, (since - 4) / 6);

    // the net holds it a moment and lets it slip down slowly, so it shows over the keeper lying
    // on the grass in front of it
    return {
      x: line.x,
      y: Math.max(BALL_SIZE, line.y - Math.max(0, since - 16) * 0.02),
      z: lerp(DEPTH.line, DEPTH.net - 0.2, into),
    };
  },
  wide: (moment, since) => ({
    ...shotPoint(moment.aim, KEEPER_SHARE + since * 0.03),
    gone: since > 16,
  }),
  post: (moment, since) => {
    if (since < 3) {
      return shotPoint(moment.aim, lerp(KEEPER_SHARE, 1, since / 3));
    }

    const post = shotPoint(moment.aim, 1);

    return thrown(post, {
      velocity: { x: outward(moment, post) * 0.05, y: 0.05, z: -0.16 },
      since: since - 3,
    });
  },
  punch: (moment, since, contact) =>
    thrown(contact, { velocity: { x: outward(moment, contact) * 0.18, y: 0.14, z: 0.03 }, since }),
  parry: (moment, since, contact) =>
    thrown(contact, { velocity: { x: outward(moment, contact) * 0.12, y: 0.04, z: -0.05 }, since }),
  wall: (moment, since, contact) =>
    thrown(contact, { velocity: { x: -contact.x * 0.01, y: 0.035, z: -0.26 }, since }),
};

// the ball at a tick of the show's own clock (playTicks): its place in the world, or `held` in
// the keeper's hands, or `gone` out of the view
export function ballAtPlay(moment, play) {
  if (play < BEATS.strike) {
    return { ...START, gone: true };
  }

  const since = play - contactTick();

  if (since < 0) {
    return shotPoint(moment.aim, clamp01((play - BEATS.strike) / BEATS.flight) * KEEPER_SHARE);
  }

  const contact = shotPoint(moment.aim, KEEPER_SHARE);

  return (AFTER[moment.outcome] ?? AFTER.catch)(moment, since, contact);
}

export const ballAt = (moment, ticks) => ballAtPlay(moment, playTicks(ticks));

// the points the ball passed through, newest last, each with its play tick, while it flew free, up
// to the play tick `until`
export function trailOf(moment, ticks, { count = 12, gap = 1, until = Infinity } = {}) {
  const play = playTicks(ticks);

  return Array.from({ length: count }, (_, i) => play - (count - 1 - i) * gap)
    .filter((tick) => tick >= BEATS.strike && tick <= until)
    .map((tick) => ({ ...ballAtPlay(moment, tick), tick }))
    .filter((at) => !at.held && !at.gone);
}
