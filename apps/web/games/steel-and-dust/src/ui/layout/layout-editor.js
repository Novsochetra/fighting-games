import { onFoldChange } from '../../../../../packages/screen/src/viewport-segments.js';
import {
  createDraft,
  customised,
  moveControl,
  nextControl,
  resetLayout,
  resizeControl,
  savedLayout,
  shownControls,
  sizeOf,
} from './layout-draft.js';
import { installLayoutDrag } from './layout-drag.js';
import { LayoutView } from './layout-view.js';

const TOOLBAR_ACTIONS = {
  next: (editor) => editor.pickNext(),
  smaller: (editor) => editor.resize(-1),
  bigger: (editor) => editor.resize(1),
  reset: (editor) => editor.reset(),
  done: (editor) => editor.save(),
};

// the Button layout menu, opened from the Skins screen for the skin looked at there: it edits a
// draft of the saved layouts, so the real touch controls only change on Done, and Cancel (the
// menus' Back) just leaves
export class LayoutEditor {
  constructor({ view, game, audio, layout, skins }) {
    Object.assign(this, { view, game, audio, layout, skins });
    this.state = { draft: createDraft(null), picked: 'light' };
  }

  build() {
    this.state = { draft: createDraft(this.game.settings.buttonLayout), picked: 'light' };
    this.view.reset();
    this.render();
  }

  // the keyboard and gamepad highlight starts on Done
  firstSelected() {
    return this.view.bar.querySelectorAll('button').length - 1;
  }

  render() {
    this.view.render(this.state, this.game.settings);
  }

  // the first move or resize turns the skin's layout into a custom one, where the controls stand
  customise() {
    const slot = this.view.slot();
    if (!this.state.draft[slot]) {
      this.state.draft = customised(this.state.draft, slot, this.view.measureCentres());
    }
    return slot;
  }

  halfOf(slot, control) {
    return this.view.halfOf(control, sizeOf(this.state.draft, slot, control));
  }

  pick(control) {
    if (this.state.picked !== control) {
      this.state.picked = control;
      this.audio.sfx('ui');
      this.render();
    }
  }

  pickNext() {
    const shown = shownControls(this.layout.padLayout(), this.game.settings.stick);
    this.pick(nextControl(this.state.picked, shown));
  }

  moveTo(control, point) {
    const slot = this.customise();
    const half = this.halfOf(slot, control);
    const centre = this.view.pointAt(point);
    this.state.draft = moveControl(this.state.draft, { slot, control, centre, half });
    this.render();
  }

  resize(step) {
    const slot = this.customise();
    const control = this.state.picked;
    const half = this.halfOf(slot, control);
    this.state.draft = resizeControl(this.state.draft, { slot, control, step, half });
    this.audio.sfx('ui');
    this.render();
  }

  reset() {
    this.state.draft = resetLayout(this.state.draft, this.view.slot());
    this.audio.sfx('ui');
    this.render();
  }

  save() {
    this.game.settings.buttonLayout = savedLayout(this.state.draft);
    this.game.io.saveSettings(this.game.settings);
    this.layout.applyTouchSettings();
    this.skins.render();
  }
}

export function createLayoutEditor({ window, game, audio, layout, skins }) {
  const view = new LayoutView({ document: window.document, layout });
  const editor = new LayoutEditor({ view, game, audio, layout, skins });
  installLayoutDrag(view.preview, editor);
  view.section.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit]');
    if (button) {
      TOOLBAR_ACTIONS[button.dataset.edit](editor);
    }
  });
  // a phone turned while editing shows, and edits, the other orientation's layout, and a phone
  // folded while editing moves the controls with the touch layer
  const redraw = () => {
    if (view.isOpen()) {
      editor.render();
    }
  };
  window.addEventListener('resize', redraw);
  onFoldChange(window, redraw);
  return editor;
}
