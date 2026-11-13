import { project } from '../../render/camera.js';
import { chestOf, punchTransform } from '../../render/camera/punch-in.js';
import { movesCamera } from '../../render/cinema/mode.js';

// the player a skill punched the camera in on, or, as a duel is called, the two meeting over the
// ball, before the cut-ins take the screen
function focusOf(session) {
  const { match, camera, duelShow } = session;
  const punched = session.pace?.punchIn;
  const player = punched ? match.players[punched.player] : null;

  if (player) {
    return chestOf(project(camera, player.x, player.y));
  }

  const calling = duelShow?.stage === 'intro' && movesCamera(session.cinema);

  return calling ? chestOf(project(camera, match.ball.x, match.ball.y)) : null;
}

// the punch-in drawFrame takes, or none
export function zoomOf(session) {
  const focus = focusOf(session);

  return focus ? punchTransform(focus) : null;
}
