import { TICKS_PER_SECOND, UI_SCALE, WORLD_VIEW } from '../../src/config.js';
import * as CAMERA from '../../src/render/camera.js';
import { rowAt, scaleAt } from '../../src/render/camera/lens.js';
import { createEffects, updateEffects } from '../../src/render/effects/index.js';
import { drainEvents } from '../../src/sim/events.js';
import { tick } from '../../src/sim/tick.js';

// Watches the live camera through a real match, as the app steps it (the sim, then the camera,
// then the effects that shake it), and counts what makes a view tiring to watch: how fast it pans,
// how often it turns round, how sharply it speeds up or slows down, how much it tilts. Speeds are
// the world's canvas pixels a tick: along at the row the camera looks at, in depth the rows the
// ground slides by. The world is drawn UI_SCALE times as fine as the view the eye was measured
// in, so what an eye sees is UI_SCALE times as many of its pixels.

// a turn between pans of a view's pixel a tick (60 a second) each way is one an eye sees
const SEEN_SPEED = UI_SCALE;
// further than this in a tick is a cut to a new shot, not a pan
const CUT = 40 * UI_SCALE;
const OWNER_TURN_TICKS = 45;

const viewAt = (camera) => ({
  along: camera.along.value * scaleAt(camera.lens, camera.depth.value),
  depth: rowAt(camera.lens, camera.depth.value),
});

const axisWatch = () => ({ speeds: [], heading: 0, turns: 0, travel: 0 });

function watchAxis(axis, speed) {
  const heading = Math.abs(speed) > SEEN_SPEED ? Math.sign(speed) : 0;

  axis.speeds.push(Math.abs(speed));
  axis.travel += Math.abs(speed);

  if (heading !== 0 && heading === -axis.heading) {
    axis.turns += 1;
  }

  axis.heading = heading || axis.heading;
}

function turnAfterOwnerChange(turn, speed, ticks) {
  const heading = Math.abs(speed) > SEEN_SPEED ? Math.sign(speed) : 0;

  if (ticks > turn.until || heading === 0) {
    return ticks > turn.until ? 'over' : 'open';
  }

  if (turn.heading === 0) {
    turn.heading = heading;
  }

  return heading === -turn.heading ? 'turned' : 'open';
}

function watchOwner(watch, match, speed) {
  const { owner } = watch;
  const state = owner.turn ? turnAfterOwnerChange(owner.turn, speed, watch.ticks) : 'open';

  owner.turned += state === 'turned' ? 1 : 0;
  owner.turn = state === 'open' ? owner.turn : null;

  if (match.phase === 'play' && match.ball.owner !== null && match.ball.owner !== owner.last) {
    const isChange = owner.last !== null;

    owner.changes += isChange ? 1 : 0;
    owner.turn = isChange
      ? { heading: Math.sign(speed), until: watch.ticks + OWNER_TURN_TICKS }
      : null;
    owner.last = match.ball.owner;
  }
}

const isLive = (watch, camera, match) =>
  !['duel', 'halfTime'].includes(match.phase) && !watch.wasPanning && !camera.pan;

const isCut = (speed) => Math.abs(speed.along) > CUT || Math.abs(speed.depth) > CUT;

// how much the pace changed since the tick before, when that tick was live and no cut
function watchAcceleration(watch, speed) {
  if (watch.lastSpeed) {
    watch.accelerations.push(
      Math.hypot(speed.along - watch.lastSpeed.along, speed.depth - watch.lastSpeed.depth),
    );
  }

  watch.lastSpeed = speed;
}

function watchTick(watch, camera, match) {
  const now = viewAt(camera);
  const speed = { along: now.along - watch.at.along, depth: now.depth - watch.at.depth };

  watch.at = now;

  if (!isLive(watch, camera, match)) {
    watch.lastSpeed = null;

    return;
  }

  watch.check?.(camera, match);

  if (isCut(speed)) {
    watch.lastSpeed = null;

    return;
  }

  watchAcceleration(watch, speed);
  watch.ticks += 1;
  watchAxis(watch.along, speed.along);
  watchAxis(watch.depth, speed.depth);
  watchOwner(watch, match, speed.along);
  watch.play.ticks += match.phase === 'play' ? 1 : 0;
  watch.play.depth += match.phase === 'play' ? Math.abs(speed.depth) : 0;
  watch.shaken += camera.shake.x !== 0 || camera.shake.y !== 0 ? 1 : 0;
}

const percentile = (list, share) =>
  [...list].sort((first, second) => first - second)[Math.floor((list.length - 1) * share)] ?? 0;

function summaryOf(watch) {
  const minutes = watch.ticks / (TICKS_PER_SECOND * 60);

  return {
    minutes,
    turnsPerMinute: { along: watch.along.turns / minutes, depth: watch.depth.turns / minutes },
    fastAlong: percentile(watch.along.speeds, 0.95),
    depthPerSecondInPlay: (watch.play.depth / watch.play.ticks) * TICKS_PER_SECOND,
    ownerTurnShare: watch.owner.turned / Math.max(1, watch.owner.changes),
    shakenShare: watch.shaken / watch.ticks,
    sharpChange: percentile(watch.accelerations, 0.99),
    sharpestChange: Math.max(0, ...watch.accelerations),
  };
}

// plays `match` out (or for `most` ticks) with `step(match)` before each tick, for a human's
// keys; `check(camera, match)` runs on each tick the camera is live (not in a cinematic pan, a
// duel's cut-in or half time). `api` is the camera to watch.
export function watchCamera(match, { step = () => {}, check, most = Infinity, api = CAMERA } = {}) {
  const camera = api.createCamera(match);
  const effects = createEffects();
  const watch = {
    at: viewAt(camera),
    ticks: 0,
    along: axisWatch(),
    depth: axisWatch(),
    owner: { last: null, changes: 0, turned: 0, turn: null },
    play: { ticks: 0, depth: 0 },
    shaken: 0,
    accelerations: [],
    lastSpeed: null,
    check,
  };

  for (let i = 0; i < most && match.phase !== 'over'; i += 1) {
    step(match);
    watch.wasPanning = Boolean(camera.pan);
    tick(match);
    api.updateCamera(camera, match);
    updateEffects(effects, match, { camera });
    watchTick(watch, camera, match);
    drainEvents(match);
  }

  return summaryOf(watch);
}

// in the world's canvas pixels, `margin` in the view's
export const isOnView = (point, margin = 0) =>
  point.x >= margin * UI_SCALE &&
  point.x <= WORLD_VIEW.width - margin * UI_SCALE &&
  point.y >= margin * UI_SCALE &&
  point.y <= WORLD_VIEW.height - margin * UI_SCALE;
