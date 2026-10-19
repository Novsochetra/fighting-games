import { buttonScale } from '../data/settings.js';
import { clamp } from '../lib/math.js';
import { followThumb, isNearFixedStick, knobOffset, stickDirections } from './stick-math.js';

const NO_DIRECTION = { left: false, right: false, up: false, down: false };

function centerOf(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// the stick only steers (and gives up / down for launchers and dives); JUMP and DASH have buttons
export class TouchStick {
  constructor({ elements, game, layout }) {
    Object.assign(this, { elements, game, layout });
    this.pointerId = null;
    this.center = { x: 0, y: 0 };
    this.directions = { ...NO_DIRECTION };
  }

  setDirections(next) {
    for (const [key, on] of Object.entries(next)) {
      if (this.directions[key] !== on) {
        this.directions[key] = on;
        this.game.input.held[key] = on;
      }
    }
  }

  placeBase(zone) {
    this.elements.base.style.left = `${this.center.x - zone.left}px`;
    this.elements.base.style.top = `${this.center.y - zone.top}px`;
  }

  follow(event) {
    const { base, knob, zone } = this.elements;
    const radius = base.offsetWidth / 2 - knob.offsetWidth / 4;
    const thumb = { x: event.clientX, y: event.clientY };
    if (this.game.settings.stick === 'float') {
      this.center = followThumb(this.center, thumb, radius);
      this.placeBase(zone.getBoundingClientRect());
    }
    const dx = thumb.x - this.center.x;
    const dy = thumb.y - this.center.y;
    const offset = knobOffset(dx, dy, radius);
    knob.style.transform = `translate(${offset.x}px,${offset.y}px)`;
    this.setDirections(stickDirections(dx / radius, dy / radius, this.directions));
  }

  // fixed: a thumb must land on or near the stick; floating: the stick appears under the thumb
  grab(event) {
    const { base, zone } = this.elements;
    const radius = base.offsetWidth / 2;
    const thumb = { x: event.clientX, y: event.clientY };
    if (this.game.settings.stick === 'fixed') {
      const center = centerOf(base.getBoundingClientRect());
      if (!isNearFixedStick(center, thumb, radius)) {
        return false;
      }
      this.center = center;
    } else {
      const area = zone.getBoundingClientRect();
      const margin = radius * 0.6;
      this.center = {
        x: clamp(thumb.x, area.left + margin, area.right - margin),
        y: clamp(thumb.y, area.top + margin, area.bottom - margin),
      };
      this.placeBase(area);
    }
    this.pointerId = event.pointerId;
    return true;
  }

  rest() {
    if (this.pointerId !== null) {
      return;
    }
    const position = this.layout.stickRest(buttonScale(this.game.settings));
    this.elements.base.style.left = `${position.x}px`;
    this.elements.base.style.top = `${position.y}px`;
    this.elements.knob.style.transform = '';
  }

  release(event) {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.elements.base.classList.remove('on');
    this.setDirections(NO_DIRECTION);
    this.rest();
  }
}

export function installTouchStick(stick, { zone, base }) {
  zone.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (stick.pointerId !== null || !stick.grab(event)) {
      return;
    }
    base.classList.add('on');
    zone.setPointerCapture?.(event.pointerId);
    stick.follow(event);
  });
  zone.addEventListener('pointermove', (event) => {
    if (event.pointerId === stick.pointerId) {
      stick.follow(event);
    }
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    zone.addEventListener(type, (event) => stick.release(event));
  }
}
