import { HAPTIC_CUES } from '../../data/haptics.js';

export function buzz(game, cue) {
  if (game.settings.haptics) {
    game.io.vibrate(HAPTIC_CUES[cue]);
  }
}
