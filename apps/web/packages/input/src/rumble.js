import { firstStandardPad } from './gamepad.js';

export function buzzPhone(navigator, pattern) {
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

export function rumblePad(navigator, rumbles) {
  const pads = navigator.getGamepads?.();
  const actuator = pads && firstStandardPad(pads)?.vibrationActuator;

  if (actuator?.playEffect) {
    rumble(actuator, rumbles);
  }
}

// Safari on iPhone has neither, Firefox dropped navigator.vibrate and keeps only its own
// hapticActuators, so the pad's rumble is looked for where it is played from
export function canVibrate(window) {
  const { Gamepad } = window;

  return !!window.navigator.vibrate || (!!Gamepad && 'vibrationActuator' in Gamepad.prototype);
}
