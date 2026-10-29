import { orientationOf } from './layout-draft.js';
import { centreOf, fractionOf, halfExtentOf } from './layout-geometry.js';
import { drawPreviewPad } from './preview-pad.js';

export class PreviewControls {
  constructor({ preview, app }) {
    Object.assign(this, { preview, app });
    this.elements = [];
    this.shown = [];
  }

  orientation() {
    return orientationOf(this.app.clientWidth, this.app.clientHeight);
  }

  controlFor(control) {
    return this.elements.find((element) => element.dataset.control === control);
  }

  pointAt(point) {
    return fractionOf(point, this.preview.getBoundingClientRect());
  }

  centreOnScreen(control) {
    return centreOf(this.controlFor(control).getBoundingClientRect());
  }

  halfOf(control, size) {
    const rect = this.controlFor(control).getBoundingClientRect();

    return halfExtentOf(rect, this.preview.getBoundingClientRect(), size);
  }

  measureCentres() {
    const layer = this.preview.getBoundingClientRect();

    return Object.fromEntries(
      this.elements.map((element) => [
        element.dataset.control,
        fractionOf(centreOf(element.getBoundingClientRect()), layer),
      ]),
    );
  }

  rects() {
    return this.shown.map((control) => ({
      control,
      rect: this.controlFor(control).getBoundingClientRect(),
    }));
  }

  draw(padLayout, entries) {
    const places = drawPreviewPad(this.preview, padLayout, entries);

    this.elements = [...this.preview.querySelectorAll('[data-control]')];

    return places;
  }

  // a hidden stick (Settings, Joystick) is shown to no one, so neither the keyboard nor the
  // gamepad reaches it
  mark(shown, picked) {
    this.shown = shown;

    for (const element of this.elements) {
      const { control } = element.dataset;

      element.toggleAttribute('data-editable', shown.includes(control));
      element.classList.toggle('picked', control === picked);
    }
  }
}
