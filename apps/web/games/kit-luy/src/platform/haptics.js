import { buzzPhone } from '../../../../packages/input/src/rumble.js';
import { HAPTICS } from '../data/haptics.js';

export const canBuzz = (navigator) => typeof navigator.vibrate === 'function';

export const createHaptics = (navigator, settings) => (cue) => {
  if (settings.vibrate) {
    buzzPhone(navigator, HAPTICS[cue]);
  }
};
