import { dpadDirections } from './dpad-math.js';
import { itemOf } from './pad-markup.js';

const NO_DIRECTION = { up: false, right: false, down: false, left: false };

// a thumb rolls over the d-pad from one direction to the next, a corner holding two; each holds
// the input the skin maps it to, as the stick's do
export class PadDpad {
  constructor({ steer }) {
    this.steer = steer;
    this.pointerId = null;
    this.directions = { ...NO_DIRECTION };
  }

  setDirections(next) {
    for (const [direction, on] of Object.entries(next)) {
      if (this.directions[direction] !== on) {
        this.directions[direction] = on;
        this.steer(this.inputs[direction], on);
      }
    }

    const pressed = Object.keys(next).filter((direction) => next[direction]);

    this.dpad.dataset.pressed = pressed.join(' ');
    this.dpad.classList.toggle('on', pressed.length > 0);
  }

  follow(event) {
    const rect = this.dpad.getBoundingClientRect();
    const half = { x: rect.width / 2 || 1, y: rect.height / 2 || 1 };
    const x = (event.clientX - rect.left - half.x) / half.x;
    const y = (event.clientY - rect.top - half.y) / half.y;

    this.setDirections(dpadDirections(x, y));
  }

  press(dpad, event) {
    event.preventDefault();

    if (this.pointerId !== null) {
      return;
    }

    Object.assign(this, { dpad, pointerId: event.pointerId, inputs: itemOf(dpad).inputs });
    dpad.setPointerCapture?.(event.pointerId);
    this.follow(event);
  }

  move(event) {
    if (event.pointerId === this.pointerId) {
      this.follow(event);
    }
  }

  release(event) {
    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.pointerId = null;
    this.setDirections(NO_DIRECTION);
  }
}
