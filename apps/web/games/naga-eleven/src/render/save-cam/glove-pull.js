import { KEEPER_SHARE, shotPoint } from './flight.js';
import { keeperPose } from './keeper-pose.js';
import { contactTick } from './timing.js';
import { project } from './view.js';

// A dive's stretch reaches as far as its frame does, so a ball close to him would meet the air
// short of his gloves: a ball he keeps out curls into them over its last ticks, and a punch or a
// parry leaves from them. A goal or a miss flies on where it was aimed
const SAVES = new Set(['catch', 'punch', 'parry']);

const PULL_TICKS = 8;

// how far his gloves at the contact lie from where the aim brings the ball, on the art grid
export function glovePull(moment) {
  if (!SAVES.has(moment.outcome)) {
    return null;
  }

  const gloves = keeperPose(moment, contactTick()).gloves;
  const contact = project(shotPoint(moment.aim, KEEPER_SHARE));

  return { x: gloves.x - contact.x, y: gloves.y - contact.y };
}

// a point of the ball's way on the art grid at the play tick `play`, moved into his gloves as it
// comes to the contact
export function pulled(point, pull, play) {
  if (!pull) {
    return point;
  }

  const share = Math.min(1, Math.max(0, (play - contactTick() + PULL_TICKS) / PULL_TICKS));
  const eased = share * share * (3 - 2 * share);

  return { ...point, x: point.x + pull.x * eased, y: point.y + pull.y * eased };
}

export const contactAt = (moment) =>
  pulled(project(shotPoint(moment.aim, KEEPER_SHARE)), glovePull(moment), contactTick());
