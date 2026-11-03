import { LOOK_ART } from '../../art/duel/looks.js';
import { ballAt, KEEPER_SHARE, shotPoint, trailOf } from './flight.js';
import { keeperPose } from './keeper-pose.js';
import { contactTick, flightShare, playTicks } from './timing.js';
import { aimPoint, BALL_SIZE, DEPTH, project } from './view.js';

const FREE_FLIGHTS = new Set(['goal', 'wide']);

const onScreen = (at) => {
  const place = project(at);

  return { x: place.x, y: place.y, radius: BALL_SIZE * place.scale, z: at.z };
};

// the ball on the art grid, in his gloves when he holds it; a dive's frame that holds it draws it
function ballOf(moment, ticks, pose) {
  const at = ballAt(moment, ticks);

  if (at.gone || (at.held && pose.holdsBall)) {
    return null;
  }

  if (at.held) {
    return { x: pose.gloves.x, y: pose.gloves.y, radius: 3, z: DEPTH.keeper - 0.1, held: true };
  }

  return onScreen(at);
}

// the trail runs as far as the ball flies free: into the net or past the post, but no further
// than the keeper when it comes back off him
function trailFor(moment, ticks) {
  const until = contactTick() + (FREE_FLIGHTS.has(moment.outcome) ? 12 : 0);

  return trailOf(moment, ticks, { count: 14, until }).map(onScreen);
}

// everything a frame of the save cam needs, worked out from its moment and how far in it is
export function camScene(cam, tick) {
  const { moment } = cam;
  const play = playTicks(cam.ticks);
  const pose = keeperPose(moment, play);

  return {
    tick,
    ticks: cam.ticks,
    play,
    since: play - contactTick(),
    flight: flightShare(cam.ticks),
    moment,
    pose,
    ball: ballOf(moment, cam.ticks, pose),
    trail: trailFor(moment, cam.ticks),
    aim: project(aimPoint(moment.aim)),
    contact: project(shotPoint(moment.aim, KEEPER_SHARE)),
    art: LOOK_ART[moment.look] ?? LOOK_ART.plain,
    guardArt: moment.guardLook ? LOOK_ART[moment.guardLook] : null,
    holds: !['goal', 'wide', 'post'].includes(moment.outcome),
  };
}
