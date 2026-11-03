import { SKILL_AI } from '../../data/skills.js';
import { duoPassOf } from '../combos/duos.js';
import { chance } from '../random.js';

// a keeper holding the ball with a duo's striker in reach, both shares ready, throws it for the
// duo now and then: once, as he looks up. Dara is the computer's even on the player's side
export function duoThrowOf(match, keeper, lookAt) {
  const duo = keeper.holding === lookAt ? duoPassOf(match, keeper) : null;

  if (!duo || !chance(match.random, SKILL_AI.duo)) {
    return null;
  }

  return { kind: 'skillPass', move: null, target: duo.striker.index, duo: duo.duo };
}
