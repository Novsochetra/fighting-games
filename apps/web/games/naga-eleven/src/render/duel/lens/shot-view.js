import { movesCamera } from '../../cinema/mode.js';
import { MIDDLE } from './lens-pen.js';
import { viewAt } from './track.js';

// the view a stage's shots give `ticks` in, or none where the player's camera holds still
export const shotView = (mode, shots, ticks, targets) =>
  movesCamera(mode) ? viewAt(shots, ticks, { middle: MIDDLE, ...targets }) : null;
