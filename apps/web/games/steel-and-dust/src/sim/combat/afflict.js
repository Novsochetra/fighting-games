import { igniteTarget } from '../summons/burn.js';
import { poisonTarget } from '../summons/poison.js';
import { freezeTarget } from './freeze.js';

// what a landed move leaves on its target: ice that holds it, fire that burns on or venom
export function afflictTarget(game, target, move) {
  if (move.freeze) {
    freezeTarget(game, target, { duration: move.freeze });
  }
  if (move.burn) {
    igniteTarget(game, target, move.burn);
  }
  if (move.poison) {
    poisonTarget(game, target, move.poison);
  }
}
