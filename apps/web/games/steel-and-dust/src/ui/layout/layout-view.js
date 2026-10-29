import { renderPad } from '../../../../../packages/touch-pad/src/pad-markup.js';
import { placePad, placesOf } from '../../../../../packages/touch-pad/src/pad-place.js';
import { BUTTON_SIZE } from '../../data/button-layout.js';
import { buttonScale } from '../../data/settings.js';
import { fitTouchLayer } from '../screen/touch-area.js';
import { orientationOf, shownControls, sizeOf, slotFor } from './layout-draft.js';
import { centreOf, coverCost, fractionOf, halfExtentOf } from './layout-geometry.js';
import { controlName, EDITOR_HTML, fillPreview, sizeLabel } from './layout-markup.js';

// the editor's screen: a copy of the touch layer to drag the controls on, and its toolbar
export class LayoutView {
  constructor({ document, layout }) {
    this.layout = layout;
    this.app = document.getElementById('app');
    this.section = document.getElementById('m-layout');
    this.section.innerHTML = EDITOR_HTML;
    this.preview = this.section.querySelector('.layout-preview');
    fillPreview(this.preview, document.getElementById('touch'));
    this.bar = this.section.querySelector('.layout-bar');
    this.controls = [];
  }

  isOpen() {
    return this.section.classList.contains('open');
  }

  // the bar starts each visit at the top; menus stay laid out while closed, so it can be placed
  // before the editor shows
  reset() {
    this.bar.classList.remove('low');
  }

  orientation() {
    return orientationOf(this.app.clientWidth, this.app.clientHeight);
  }

  // the skin shown for the way the phone is held, and that way
  slot(settings) {
    return slotFor(settings, this.orientation());
  }

  controlFor(control) {
    return this.controls.find((element) => element.dataset.control === control);
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
      this.controls.map((element) => [
        element.dataset.control,
        fractionOf(centreOf(element.getBoundingClientRect()), layer),
      ]),
    );
  }

  // the skin's controls for the way the phone is held, drawn again only when that changes
  drawControls(entries) {
    const padLayout = this.layout.padLayout();
    const places = placesOf(padLayout, entries);

    renderPad(this.preview, padLayout);
    placePad(this.preview, places);
    this.controls = [...this.preview.querySelectorAll('[data-control]')];

    return places;
  }

  render({ draft, picked }, settings) {
    const slot = this.slot(settings);
    const entries = draft[slot];
    this.picked = picked;
    this.shown = shownControls(this.layout.padLayout(), settings.stick);
    fitTouchLayer(this.preview, this.layout.touchArea());
    const places = this.drawControls(entries);
    for (const element of this.controls) {
      element.classList.toggle('picked', element.dataset.control === picked);
    }
    this.placeStick(places, settings);
    this.showValues(picked, sizeOf(draft, slot, picked), !!entries);
    this.placeToolbar();
  }

  showValues(picked, size, custom) {
    const field = (selector) => this.bar.querySelector(selector);
    field('.layout-name').textContent = controlName(this.controlFor(picked));
    field('.layout-size').textContent = sizeLabel(size);
    field('[data-edit="smaller"]').disabled = size <= BUTTON_SIZE.min;
    field('[data-edit="bigger"]').disabled = size >= BUTTON_SIZE.max;
    field('[data-edit="reset"]').disabled = !custom;
  }

  // the buttons place themselves through CSS; the stick rests where the screen fit puts the
  // original one, or at its placed centre on the touch layer
  placeStick(places, settings) {
    const stick = this.controlFor('stick');

    if (!stick) {
      return;
    }

    const screen = { width: this.app.clientWidth, height: this.app.clientHeight };
    const layer = this.layout.touchArea() ?? screen;
    const rest = places
      ? { x: places.stick.x * layer.width, y: places.stick.y * layer.height }
      : this.layout.originalStickRest(buttonScale(settings));
    stick.style.left = `${rest.x}px`;
    stick.style.top = `${rest.y}px`;
  }

  // the toolbar sits at the top and moves to the other side when that hides less, above all less of
  // the picked control; when the other side is no better it stays, drawn over the controls
  placeToolbar() {
    const controls = this.shown.map((control) => ({
      control,
      rect: this.controlFor(control).getBoundingClientRect(),
    }));
    const cost = () => coverCost(controls, this.bar.getBoundingClientRect(), this.picked);
    const here = cost();
    if (here > 0) {
      this.bar.classList.toggle('low');
      if (cost() >= here) {
        this.bar.classList.toggle('low');
      }
    }
  }
}
