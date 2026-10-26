import { firstStandardPad } from '../input/gamepad-state.js';

function buzzPhone(navigator, pattern) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    return;
  }
}

// a pad plays one effect at a time and a new one cuts it short ('preempted'), so each rumble waits
// for the last to end, and a new cue ends the rest of the one before it
export function rumble(actuator, [first, ...rest]) {
  const effect = {
    startDelay: first.wait ?? 0,
    duration: first.ms,
    strongMagnitude: first.strong,
    weakMagnitude: first.weak,
  };
  return Promise.resolve()
    .then(() => actuator.playEffect('dual-rumble', effect))
    .then((result) => (result === 'complete' && rest.length ? rumble(actuator, rest) : result))
    .catch(() => 'unsupported');
}

function rumblePad(navigator, rumbles) {
  const pads = navigator.getGamepads?.();
  const actuator = pads && firstStandardPad(pads)?.vibrationActuator;
  if (actuator?.playEffect) {
    rumble(actuator, rumbles);
  }
}

// Safari on iPhone has neither, and Firefox dropped navigator.vibrate
export function canVibrate(window) {
  return !!window.navigator.vibrate || 'GamepadHapticActuator' in window;
}

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
