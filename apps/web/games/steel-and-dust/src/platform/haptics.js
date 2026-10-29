import { buzzPhone, rumblePad } from '../../../../packages/input/src/rumble.js';

// a cue is felt in what the player holds: the gamepad, or the phone, whichever they used last
export function createHaptics({ navigator, ui }) {
  return {
    play(cue) {
      if (ui.lastInput === 'pad') {
        rumblePad(navigator, cue.pad);
      } else if (ui.lastInput === 'touch') {
        buzzPhone(navigator, cue.phone);
      }
    },
  };
}
