import { movesCamera } from '../../cinema/mode.js';
import { MIDDLE } from './lens-pen.js';
import { viewAt } from './track.js';

export const shotView = (mode, shots, ticks, targets) =>
  movesCamera(mode) ? viewAt(shots, ticks, { middle: MIDDLE, ...targets }) : null;
