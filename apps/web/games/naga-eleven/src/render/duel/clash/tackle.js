import { KNOCK_BACK } from './knock-back.js';
import { TRIP_OVER } from './trip-over.js';

// a dribble the tackle won: how he goes down and how the tackler comes away with the ball. A plain
// slide takes his feet and he goes over it; anything else stops him dead, and so does a wall the
// guard's move raised (`walled`), which no one goes through
export const tackleOf = (scene) =>
  scene.defend.kind === 'tackle' && !scene.walled ? TRIP_OVER : KNOCK_BACK;
