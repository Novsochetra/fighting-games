import { isHeld } from './input-state.js';
import { normalized } from './vector.js';

const axis = (input, negative, positive) =>
  (isHeld(input, positive) ? 1 : 0) - (isHeld(input, negative) ? 1 : 0);

export const stickOf = (input) =>
  normalized(axis(input, 'left', 'right'), axis(input, 'up', 'down'));
