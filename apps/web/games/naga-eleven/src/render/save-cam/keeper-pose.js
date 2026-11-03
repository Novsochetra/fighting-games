import { divePose } from './dive-pose.js';
import { KEEPER_SHARE, shotPoint } from './flight.js';
import { contactTick } from './timing.js';
import { DEPTH, project } from './view.js';

// The keeper standing for a ball at him, as the sheets draw him: `idle` facing the camera, arms up
// from `celebrate`, beaten on `fall`; `hands` is where his gloves are, in sheet pixels from his feet.
// For a ball to one side he dives on the front-facing dive's frames instead (dive-pose.js)
const ARMS_UP = { animation: 'celebrate', frame: 3, of: 8, hands: [0, -57] };

const CHEST = [0, -31];

// standing tall at the middle of the goal: arms up for a high ball, a punch or a wall, the ball
// into his chest for a catch, down beaten for a goal
function standing(moment, play) {
  const since = play - contactTick();
  const high = shotPoint(moment.aim, KEEPER_SHARE).y > 1.35;
  const still = { animation: 'idle', frame: 0, of: 1, hands: CHEST, mirror: false };

  if (moment.outcome === 'goal') {
    return since < 0
      ? still
      : { ...still, animation: 'fall', frame: Math.min(2, Math.floor(since / 5)), of: 4 };
  }

  const armsUp = moment.outcome === 'wall' || moment.outcome === 'punch' || high;
  const raised = moment.outcome === 'wall' ? since > -16 : since > -6;

  return armsUp && raised ? { ...still, ...ARMS_UP } : still;
}

// his pose at a tick of the show's clock, and where on the art grid his feet (or, diving, his
// navel) and his gloves are
export function keeperPose(moment, play) {
  if (moment.dive !== 0) {
    return divePose(moment, play);
  }

  const pose = standing(moment, play);
  const feet = project({ x: 0, y: 0, z: DEPTH.keeper });
  const x = Math.round(feet.x);
  const y = Math.round(feet.y);

  return { ...pose, x, y, gloves: { x: x + pose.hands[0], y: y + pose.hands[1] } };
}
