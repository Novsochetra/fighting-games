import { RUN_SPEED } from '../../config.js';
import { unseenAt } from '../brains/player/doorway-steps.js';
import { startRun } from '../fighters/actions.js';
import { placeOnGround } from '../fighters/terrain-motion.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { attachScarf } from '../pose/scarf.js';
import { missionOf } from './mission.js';

// a road with no wall at its start is run onto from off screen
const WAY_IN_FROM = -24;

// the hero comes onto the next road out of the doorway of the last road's wall, broken open behind
// the start, and takes the controls on the spot a road starts on
export function startWayIn(game) {
  const { player } = game;
  const doorway = missionOf(game).wayIn;
  const run = { way: 'in', phase: 'run', to: player.x, free: true, inDoorway: false };

  game.gateRun = run;

  if (doorway) {
    Object.assign(run, { phase: 'wait', inDoorway: true, time: 0, doorway });
    player.x = unseenAt(doorway);
    player.state = 'idle';
  } else {
    player.x = WAY_IN_FROM;
    startRun(player);
    player.vx = RUN_SPEED;
  }

  placeOnGround(game.terrain, player);
  attachScarf(player);
  refreshPose(player);
}
