import { BUTTON_SIZE } from '../../data/button-layout.js';
import { buttonScale } from '../../data/settings.js';
import { applyButtonLayout } from './apply-button-layout.js';
import { orientationOf, sizeOf } from './layout-draft.js';
import { centreOf, coverCost, fractionOf, halfExtentOf } from './layout-geometry.js';
import { EDITOR_HTML, fillPreview, sizeLabel } from './layout-markup.js';

// the editor's screen: a copy of the touch layer to drag the buttons on, and its toolbar
export class LayoutView {
  constructor({ document, layout }) {
    this.layout = layout;
    this.app = document.getElementById('app');
    this.section = document.getElementById('m-layout');
    this.section.innerHTML = EDITOR_HTML;
    this.preview = this.section.querySelector('.layout-preview');
    fillPreview(this.preview, document.getElementById('touch'));
    this.bar = this.section.querySelector('.layout-bar');
    this.buttons = [...this.preview.querySelectorAll('.tb[data-action]')];
  }

  isOpen() {
    return this.section.classList.contains('open');
  }

  // the menu is only drawn once it opens, so the toolbar finds its place a frame later
  reset() {
    this.bar.classList.remove('low');
    this.app.ownerDocument.defaultView.requestAnimationFrame(() => this.placeToolbar());
  }

  orientation() {
    return orientationOf(this.app.clientWidth, this.app.clientHeight);
  }

  buttonFor(action) {
    return this.buttons.find((button) => button.dataset.action === action);
  }

  pointAt(point) {
    return fractionOf(point, this.preview.getBoundingClientRect());
  }

  centreOnScreen(action) {
    return centreOf(this.buttonFor(action).getBoundingClientRect());
  }

  halfOf(action, size) {
    const rect = this.buttonFor(action).getBoundingClientRect();
    return halfExtentOf(rect, this.preview.getBoundingClientRect(), size);
  }

  measureCentres() {
    const layer = this.preview.getBoundingClientRect();
    return Object.fromEntries(
      this.buttons.map((button) => [
        button.dataset.action,
        fractionOf(centreOf(button.getBoundingClientRect()), layer),
      ]),
    );
  }

  render({ draft, picked }, settings) {
    const orientation = this.orientation();
    this.picked = picked;
    applyButtonLayout(this.preview, draft[orientation]);
    for (const button of this.buttons) {
      button.classList.toggle('picked', button.dataset.action === picked);
    }
    this.showValues(picked, sizeOf(draft, orientation, picked), !!draft[orientation]);
    this.placeStick(settings);
    this.placeToolbar();
  }

  showValues(picked, size, custom) {
    const field = (selector) => this.bar.querySelector(selector);
    field('.layout-name').textContent = this.buttonFor(picked).textContent;
    field('.layout-size').textContent = sizeLabel(size);
    field('[data-edit="smaller"]').disabled = size <= BUTTON_SIZE.min;
    field('[data-edit="bigger"]').disabled = size >= BUTTON_SIZE.max;
    field('[data-edit="reset"]').disabled = !custom;
  }

  placeStick(settings) {
    const stick = this.preview.querySelector('.stick-base');
    const rest = this.layout.stickRest(buttonScale(settings));
    stick.style.left = `${rest.x}px`;
    stick.style.top = `${rest.y}px`;
  }

  // the toolbar sits at the top and moves to the other side when that hides less, above all less of
  // the picked button; when the other side is no better it stays, drawn over the buttons
  placeToolbar() {
    const buttons = this.buttons.map((button) => ({
      action: button.dataset.action,
      rect: button.getBoundingClientRect(),
    }));
    const cost = () => coverCost(buttons, this.bar.getBoundingClientRect(), this.picked);
    const here = cost();
    if (here > 0) {
      this.bar.classList.toggle('low');
      if (cost() >= here) {
        this.bar.classList.toggle('low');
      }
    }
  }
}
