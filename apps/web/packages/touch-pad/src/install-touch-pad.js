import { pressButton, releaseButton } from './pad-buttons.js';
import { PadDpad } from './pad-dpad.js';
import { controlIn } from './pad-markup.js';
import { PadStick } from './pad-stick.js';

const ENDS = ['pointerup', 'pointercancel', 'lostpointercapture'];

const closest = (event, selector) => event.target.closest?.(selector);

function press(event, { handler, stick, dpad }) {
  const button = closest(event, '.pad-button');
  const pressedDpad = !button && closest(event, '.pad-dpad');

  if (button) {
    pressButton(button, handler, event);
  } else if (pressedDpad) {
    dpad.press(pressedDpad, event);
  } else if (closest(event, '.pad-zone')) {
    stick.press(event);
  }
}

// a pulse (data-pulse, pad-buttons.js) that has played, or was cut off as the touch layer hid, is
// let go: an animation plays again when what it is on comes back into view, so a resumed game
// would pop every button pressed before the pause at once
function settlePulse(event) {
  if (event.pseudoElement && event.target.dataset?.pulse) {
    delete event.target.dataset.pulse;
  }
}

function release(event, { handler, stick, dpad }) {
  const button = closest(event, '.pad-button');

  if (button) {
    releaseButton(button, handler);
  }

  dpad.release(event);
  stick.release(event);
}

// one set of listeners on the layer serves whatever skin is drawn on it (renderPad), since a new
// skin or a turn of the phone draws the pad again. `handler` hears the inputs: press and release
// for a button, steer for the stick and the d-pad, which hold their inputs while a thumb is on them
export function installTouchPad(layer, { handler, stickMode, stickRest }) {
  const stick = new PadStick({ layer, steer: handler.steer, mode: stickMode, restAt: stickRest });
  const dpad = new PadDpad({ steer: handler.steer });
  const parts = { handler, stick, dpad };

  layer.addEventListener('pointerdown', (event) => press(event, parts));
  layer.addEventListener('pointermove', (event) => {
    stick.move(event);
    dpad.move(event);
  });

  for (const type of ENDS) {
    layer.addEventListener(type, (event) => release(event, parts));
  }

  for (const type of ['animationend', 'animationcancel']) {
    layer.addEventListener(type, settlePulse);
  }

  return {
    restStick: () => stick.rest(),
    control: (id) => controlIn(layer, id),
  };
}
