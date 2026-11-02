import { RUN_SPEED } from '../../config.js';
import { startRun } from '../fighters/actions.js';
import { placeOnGround } from '../fighters/terrain-motion.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { attachScarf } from '../pose/scarf.js';

// the hero comes onto the next road from off screen, out through the last road's wall broken open
// behind the start, and takes the controls on the spot a road starts on
const WAY_IN_FROM = -24;

export function startWayIn(game) {
  const { player } = game;

  game.gateRun = { way: 'in', to: player.x, free: true };
  player.x = WAY_IN_FROM;
  placeOnGround(game.terrain, player);
  startRun(player);
  player.vx = RUN_SPEED;
  attachScarf(player);
  refreshPose(player);
}
