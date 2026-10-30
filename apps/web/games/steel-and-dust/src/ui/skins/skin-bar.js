import { BUTTON_SIZE } from '../../data/button-layout.js';
import { coverCost } from '../layout/layout-geometry.js';
import { sizeLabel } from '../layout/layout-markup.js';
import { browseHint, EDIT_HINT } from './skin-markup.js';

export class SkinBar {
  constructor(root) {
    this.root = root;
  }

  field(selector) {
    return this.root.querySelector(selector);
  }

  // the bar starts each visit at the top; menus stay laid out while closed, so it can be placed
  // before the screen shows
  reset() {
    this.root.classList.remove('low');
  }

  showSkin({ skin, index, custom, offersPills }) {
    this.field('.skin-name').textContent = skin.name;
    this.field('.skin-about').textContent = skin.about;
    this.field('[data-skin="reset"]').disabled = !custom;
    this.field('.skin-help').textContent = browseHint(offersPills);
    this.root.querySelectorAll('.skin-dots i').forEach((dot, i) => {
      dot.classList.toggle('on', i === index);
    });
  }

  showControl({ name, size, shape }) {
    this.field('.layout-name').textContent = name;
    this.field('.layout-size').textContent = sizeLabel(size);
    this.field('[data-edit="smaller"]').disabled = size <= BUTTON_SIZE.min;
    this.field('[data-edit="bigger"]').disabled = size >= BUTTON_SIZE.max;
    this.field('.edit-shape').hidden = !shape;
    this.field('.skin-help').textContent = EDIT_HINT;

    for (const button of this.root.querySelectorAll('[data-key-shape]')) {
      const lit = button.dataset.keyShape === shape;

      button.classList.toggle('on', lit);
      button.setAttribute('aria-pressed', String(lit));
    }
  }

  doneButton() {
    return this.field('[data-edit="done"]');
  }

  // the bar sits at the top and moves to the other side when that hides less, above all less of
  // the picked control; when the other side is no better it stays, drawn over the controls
  place(controls, picked) {
    const cost = () => coverCost(controls, this.root.getBoundingClientRect(), picked);
    const here = cost();

    if (here > 0) {
      this.root.classList.toggle('low');

      if (cost() >= here) {
        this.root.classList.toggle('low');
      }
    }
  }
}
