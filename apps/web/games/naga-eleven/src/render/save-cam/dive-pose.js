import { DIVE_FRAMES } from '../../art/save-cam/keeper-dive/index.js';
import { clamp01, easeIn, easeOut, lerp } from '../duel/hash.js';
import { DIVE_BEATS, diveFrameAt, handsOf, restOf, stretchOf, strideOf } from './dive-frames.js';
import { ballAtPlay, KEEPER_SHARE, shotPoint } from './flight.js';
import { contactTick } from './timing.js';
import { DEPTH, project } from './view.js';

// where he stands: x the middle of the goal, y the grass under him
const SPOT = project({ x: 0, y: 0, z: DEPTH.keeper });

// in metres: the furthest he flies across, how far short of a ball that beats him his gloves stop,
// and the least he goes for it then; in art pixels, how far he slides as he lands, and how far
// short of a ball in the net his gloves come down
const MOST_TRAVEL = 2.4;
const SHORT = 0.7;
const LEAST_BEATEN = 0.6;
const SLIDE = 6;
const CLEAR = 9;

// in art pixels: the most his weight goes over onto his near leg as he loads, and how high off the
// grass his boots are as they leave it
const LOAD_SHIFT = 4;
const LIFT = 3;

const BEATEN = new Set(['goal', 'wide', 'post']);

// how far across his navel flies, the way he dives: his gloves to the ball on a save, short of it
// or the wrong way when beaten. Never back the way he came: a ball closer to him than his stretch
// reaches comes in short of his gloves
export function travelOf(moment, contact, map) {
  const reach = Math.abs(contact.x - SPOT.x) - handsOf(map).x;
  const most = MOST_TRAVEL * SPOT.scale;

  if (BEATEN.has(moment.outcome)) {
    const short = reach - SHORT * SPOT.scale;

    return moment.dive * Math.min(most, Math.max(LEAST_BEATEN * SPOT.scale, short));
  }

  return moment.dive * Math.min(most, Math.max(0, reach));
}

// beaten by a goal he slides on no further than leaves the ball showing in the net past his gloves,
// and never back from where he stretched
function slideOf(moment, { full, landing }) {
  const dive = Math.sign(moment.dive);
  const rest = project(ballAtPlay(moment, contactTick() + DIVE_BEATS.land)).x;

  if (moment.outcome !== 'goal' || Math.sign(rest - SPOT.x) !== dive) {
    return SLIDE;
  }

  return Math.min(SLIDE, Math.max(0, dive * (rest - full.x) - handsOf(landing).x - CLEAR));
}

// his navel crouched on his near leg, its boots on the grass, and as they leave it from where his
// near boot stood: a long spring when the stretch is far enough off for it, else a short hop, both
// smaller the closer the ball, and never past the stretch, so he never comes back the way he went
function springOf({ stretch, full, dive }) {
  const room = dive * (full.x - SPOT.x);
  const hop = room < LOAD_SHIFT + strideOf(stretch, DIVE_FRAMES.takeoff[stretch]);
  const takeoff = DIVE_FRAMES[hop ? 'hop' : 'takeoff'][stretch];
  const stride = Math.max(0, strideOf(stretch, takeoff));
  const shift = Math.min(LOAD_SHIFT, Math.max(0, room - stride));
  const load = { x: SPOT.x + dive * shift, y: SPOT.y - restOf(DIVE_FRAMES.push[stretch]) };

  return {
    hop,
    load,
    takeoff: {
      x: load.x + dive * Math.min(stride, room - shift),
      y: SPOT.y - restOf(takeoff) - LIFT,
    },
  };
}

// his navel set, loaded, leaving the grass, at full stretch as the ball comes, and down on it
function pathOf(moment) {
  const contact = project(shotPoint(moment.aim, KEEPER_SHARE));
  const stretch = stretchOf(SPOT.y - contact.y);
  const atContact = diveFrameAt({ outcome: moment.outcome, stretch }, 0).map;
  const landing = diveFrameAt({ outcome: moment.outcome, stretch }, DIVE_BEATS.land).map;
  const dive = Math.sign(moment.dive);
  const full = {
    x: SPOT.x + travelOf(moment, contact, atContact),
    y: Math.min(SPOT.y - restOf(atContact), contact.y - handsOf(atContact).y),
  };

  return {
    stretch,
    set: { x: SPOT.x, y: SPOT.y - restOf(DIVE_FRAMES.set) },
    ...springOf({ stretch, full, dive }),
    full,
    land: {
      x: full.x + dive * slideOf(moment, { full, landing }),
      y: SPOT.y - restOf(landing),
    },
  };
}

const mix = (from, to, across, down) => ({
  x: lerp(from.x, to.x, across),
  y: lerp(from.y, to.y, down),
});

// one arc from his near boot to the stretch: across at an easing pace while he rises fast and
// slows, as a jump does, or for a low ball drops slowly and then faster
function flightOf(path, since) {
  const share = clamp01((since - DIVE_BEATS.takeoff) / -DIVE_BEATS.takeoff);
  const rising = path.full.y < path.takeoff.y;

  return mix(path.takeoff, path.full, share * (2 - share), rising ? easeOut(share) : easeIn(share));
}

// he holds still set, crouches on his near leg, springs off it to the stretch, hangs there through
// the contact, then drops
function navelAt(path, since) {
  if (since < DIVE_BEATS.push) {
    return path.set;
  }

  if (since < DIVE_BEATS.takeoff) {
    return path.load;
  }

  if (since < 0) {
    return flightOf(path, since);
  }

  if (since < DIVE_BEATS.hold) {
    return path.full;
  }

  const share = clamp01((since - DIVE_BEATS.hold) / (DIVE_BEATS.land - DIVE_BEATS.hold));

  return mix(path.full, path.land, easeOut(share), share * share);
}

// his shadow on the grass, as wide as the frame he is in
function shadowOf(map, { x, mirror }) {
  const width = map.rows[0].length;
  const middle = (width - 1) / 2 - map.anchor.x;

  return { x: x + (mirror ? -middle : middle), radiusX: Math.round(width * 0.36) };
}

// the front-facing dive at a tick of the show's clock: its frame, his navel on the art grid (x, y),
// where his gloves are and whether the frame holds the ball itself
export function divePose(moment, play) {
  const since = play - contactTick();
  const path = pathOf(moment);
  const frame = diveFrameAt(
    { outcome: moment.outcome, stretch: path.stretch, hop: path.hop },
    since,
  );
  const navel = navelAt(path, since);
  const mirror = moment.dive < 0;
  const hands = handsOf(frame.map);
  const x = Math.round(navel.x);
  const y = Math.round(Math.min(navel.y, SPOT.y - restOf(frame.map)));

  return {
    animation: 'front-dive',
    frame: frame.name,
    figure: frame.map,
    holdsBall: Boolean(frame.map.holdsBall),
    mirror,
    x,
    y,
    gloves: { x: x + (mirror ? -hands.x : hands.x), y: y + hands.y },
    shadow: shadowOf(frame.map, { x, mirror }),
  };
}
