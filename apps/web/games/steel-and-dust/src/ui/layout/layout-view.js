import { BUTTON_SIZE } from '../../data/button-layout.js';
import { fitTouchLayer } from '../screen/touch-area.js';
import { orientationOf, shownControls, sizeOf, slotFor } from './layout-draft.js';
import { centreOf, coverCost, fractionOf, halfExtentOf } from './layout-geometry.js';
import { controlName, EDITOR_HTML, fillPreview, sizeLabel } from './layout-markup.js';
import { drawPreviewPad, restPreviewStick } from './preview-pad.js';

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
    const places = drawPreviewPad(this.preview, this.layout.padLayout(), entries);

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
    restPreviewStick(this.preview, { places, layout: this.layout, app: this.app, settings });
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
