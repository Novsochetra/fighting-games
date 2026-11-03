import { camMoment } from './moment.js';
import { SAVE_CAM_TICKS } from './timing.js';

export { prepareBackdrop as prepareSaveCam } from './backdrop.js';
export { drawCamScene, drawSaveCam, drawSaveCamOn } from './draw.js';
export { roundMoment } from './moment.js';
export { SAVE_CAM_TICKS } from './timing.js';

// a save cam for a moment (README "Contract additions": the shooter, the keeper, the move, his
// skill, the aim, the dive, the style and the result); `length` is the duel's or open play's, and
// `venue` the match's, whose goal and what stands behind it the cam shows
export function createSaveCam(
  match,
  moment,
  { length = SAVE_CAM_TICKS.open, seed, venue = null } = {},
) {
  return {
    match,
    venue,
    moment: camMoment(
      moment,
      seed ?? (moment.shooter ?? 0) * 131 + (moment.keeper ?? 0) * 17 + (match.tick ?? 0),
    ),
    length,
    ticks: 0,
  };
}

export const isSaveCamDone = (cam) => cam.ticks >= cam.length;

const pressedAny = (pressed = {}) => Boolean(pressed.pass || pressed.shoot || pressed.sprint);

// once a tick; a press once it has run a moment skips to its end, where it holds
export function updateSaveCam(cam, input = {}) {
  if (isSaveCamDone(cam)) {
    return cam;
  }

  cam.ticks += 1;

  if ((pressedAny(input.pressed) || input.tap) && cam.ticks > SAVE_CAM_TICKS.skipAfter) {
    cam.ticks = cam.length;
  }

  return cam;
}
