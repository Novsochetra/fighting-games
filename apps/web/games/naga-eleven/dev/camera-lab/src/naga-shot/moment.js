import { cameraAt } from './camera/camera.js';
import { isShown } from './layers.js';
import { clockAt } from './sequence.js';
import { ballAt } from './tracks/ball.js';
import { flightShare } from './tracks/flight.js';
import { keeperAt } from './tracks/keeper.js';
import { nagaAt } from './tracks/naga.js';
import { playerAt } from './tracks/player.js';

// worked out from the frame alone, so a frame reached by scrubbing back comes out the same
export function momentOf(plan, frame, settings) {
  const clock = clockAt(plan, frame);
  const { ending } = settings;

  return {
    clock,
    ending,
    settings,
    camera: cameraAt(clock, { ending, camera: settings.camera, shake: isShown(settings, 'shake') }),
    player: playerAt(clock, ending),
    keeper: keeperAt(clock, ending),
    ball: ballAt(clock, ending),
    naga: nagaAt(clock),
    flight: flightShare(clock),
  };
}
