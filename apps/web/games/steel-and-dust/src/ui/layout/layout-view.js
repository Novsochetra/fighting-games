import { BUTTON_SIZE } from '../../data/button-layout.js';
import { buttonScale } from '../../data/settings.js';
import { applyButtonLayout } from './apply-button-layout.js';
import { orientationOf, shownControls, sizeOf } from './layout-draft.js';
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
    this.controls = [...this.preview.querySelectorAll('[data-control]')];
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

  render({ draft, picked }, settings) {
    const entries = draft[this.orientation()];
    this.picked = picked;
    this.shown = shownControls(settings.stick);
    applyButtonLayout(this.preview, entries);
    for (const element of this.controls) {
      element.classList.toggle('picked', element.dataset.control === picked);
    }
    this.placeStick(entries, settings);
    this.showValues(picked, sizeOf(draft, this.orientation(), picked), !!entries);
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
  // original one, or at its custom centre
  placeStick(entries, settings) {
    const stick = this.controlFor('stick');
    const rest = entries
      ? { x: entries.stick.x * this.app.clientWidth, y: entries.stick.y * this.app.clientHeight }
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
