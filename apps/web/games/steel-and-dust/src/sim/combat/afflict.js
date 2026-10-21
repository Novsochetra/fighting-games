import { igniteTarget } from '../summons/burn.js';
import { freezeTarget } from './freeze.js';

// what a landed move leaves on the raider: ice that holds it, or fire that burns on
export function afflictTarget(game, target, move) {
  if (move.freeze) {
    freezeTarget(game, target, { duration: move.freeze });
  }
  if (move.burn) {
    igniteTarget(game, target, move.burn);
  }
}
