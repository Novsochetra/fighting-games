import { clamp } from './clamp.js';
import { itemOf } from './pad-markup.js';
import { followThumb, isNearFixedStick, knobOffset, stickDirections } from './stick-math.js';

const NO_DIRECTION = { left: false, right: false, up: false, down: false };

function centerOf(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// the stick steers: each of its directions holds the input the skin maps it to. `mode()` is fixed
// (a thumb must land on or near it), float (it comes under the thumb) or hidden (its side is left
// to a gamepad player); `restAt()` is where it stands, in px of its zone. The pad is looked up on
// each touch, as a new skin or a turn of the phone draws it again
export class PadStick {
  constructor({ layer, steer, mode, restAt }) {
    Object.assign(this, { layer, steer, mode, restAt });
    this.pointerId = null;
    this.center = { x: 0, y: 0 };
    this.directions = { ...NO_DIRECTION };
  }

  parts() {
    const zone = this.layer.querySelector('.pad-zone');

    return (
      zone && {
        zone,
        base: zone.querySelector('.pad-stick'),
        knob: zone.querySelector('.pad-knob'),
      }
    );
  }

  // the inputs are the ones the stick had when grabbed, so a skin drawn again mid-touch still lets
  // go of what it held
  setDirections(next) {
    for (const [direction, on] of Object.entries(next)) {
      if (this.directions[direction] !== on) {
        this.directions[direction] = on;
        this.steer(this.inputs[direction], on);
      }
    }
  }

  placeBase(zone) {
    const { base } = this.parts();

    base.style.left = `${this.center.x - zone.left}px`;
    base.style.top = `${this.center.y - zone.top}px`;
  }

  follow(event) {
    const { base, knob, zone } = this.parts();
    const radius = base.offsetWidth / 2 - knob.offsetWidth / 4;
    const thumb = { x: event.clientX, y: event.clientY };

    if (this.mode() === 'float') {
      this.center = followThumb(this.center, thumb, radius);
      this.placeBase(zone.getBoundingClientRect());
    }

    const dx = thumb.x - this.center.x;
    const dy = thumb.y - this.center.y;
    const offset = knobOffset(dx, dy, radius);

    knob.style.transform = `translate(${offset.x}px,${offset.y}px)`;
    this.setDirections(stickDirections(dx / radius, dy / radius, this.directions));
  }

  // where a floating stick comes under the thumb, kept whole in its zone
  floatingCenter(thumb, area, radius) {
    const margin = radius * 0.6;

    return {
      x: clamp(thumb.x, area.left + margin, area.right - margin),
      y: clamp(thumb.y, area.top + margin, area.bottom - margin),
    };
  }

  grab(event) {
    const mode = this.mode();

    if (mode === 'hidden') {
      return false;
    }

    const { base, zone } = this.parts();
    const radius = base.offsetWidth / 2;
    const thumb = { x: event.clientX, y: event.clientY };

    if (mode === 'fixed') {
      const center = centerOf(base.getBoundingClientRect());

      if (!isNearFixedStick(center, thumb, radius)) {
        return false;
      }

      this.center = center;
    } else {
      const area = zone.getBoundingClientRect();

      this.center = this.floatingCenter(thumb, area, radius);
      this.placeBase(area);
    }

    this.pointerId = event.pointerId;
    this.inputs = itemOf(base).inputs;

    return true;
  }

  press(event) {
    event.preventDefault();

    if (this.pointerId !== null || !this.grab(event)) {
      return;
    }

    const { base, zone } = this.parts();

    base.classList.add('on');
    zone.setPointerCapture?.(event.pointerId);
    this.follow(event);
  }

  move(event) {
    if (event.pointerId === this.pointerId) {
      this.follow(event);
    }
  }

  rest() {
    const parts = this.parts();

    if (this.pointerId !== null || !parts) {
      return;
    }

    const position = this.restAt();

    parts.base.style.left = `${position.x}px`;
    parts.base.style.top = `${position.y}px`;
    parts.knob.style.transform = '';
  }

  release(event) {
    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.pointerId = null;
    this.parts()?.base.classList.remove('on');
    this.setDirections(NO_DIRECTION);
    this.rest();
  }
}
