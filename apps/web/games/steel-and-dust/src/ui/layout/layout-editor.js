import {
  createDraft,
  customised,
  moveButton,
  nextAction,
  resetLayout,
  resizeButton,
  savedLayout,
  sizeOf,
} from './layout-draft.js';
import { installLayoutDrag } from './layout-drag.js';
import { LayoutView } from './layout-view.js';

const TOOLBAR_ACTIONS = {
  next: (editor) => editor.pick(nextAction(editor.state.picked)),
  smaller: (editor) => editor.resize(-1),
  bigger: (editor) => editor.resize(1),
  reset: (editor) => editor.reset(),
  done: (editor) => editor.save(),
};

// the Button layout menu: it edits a draft of the saved layouts, so the real touch buttons only
// change on Done, and Cancel (the menus' Back) just leaves
export class LayoutEditor {
  constructor({ view, game, audio, layout, settingsPanel }) {
    Object.assign(this, { view, game, audio, layout, settingsPanel });
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

  // the first move or resize turns the original layout into a custom one, where the buttons stand
  customise() {
    const orientation = this.view.orientation();
    if (!this.state.draft[orientation]) {
      this.state.draft = customised(this.state.draft, orientation, this.view.measureCentres());
    }
    return orientation;
  }

  halfOf(orientation, action) {
    return this.view.halfOf(action, sizeOf(this.state.draft, orientation, action));
  }

  pick(action) {
    if (this.state.picked !== action) {
      this.state.picked = action;
      this.audio.sfx('ui');
      this.render();
    }
  }

  moveTo(action, point) {
    const orientation = this.customise();
    const half = this.halfOf(orientation, action);
    const centre = this.view.pointAt(point);
    this.state.draft = moveButton(this.state.draft, { orientation, action, centre, half });
    this.render();
  }

  resize(step) {
    const orientation = this.customise();
    const action = this.state.picked;
    const half = this.halfOf(orientation, action);
    this.state.draft = resizeButton(this.state.draft, { orientation, action, step, half });
    this.audio.sfx('ui');
    this.render();
  }

  reset() {
    this.state.draft = resetLayout(this.state.draft, this.view.orientation());
    this.audio.sfx('ui');
    this.render();
  }

  save() {
    this.game.settings.buttonLayout = savedLayout(this.state.draft);
    this.game.io.saveSettings(this.game.settings);
    this.layout.applyTouchSettings();
    this.settingsPanel.build();
  }
}

export function createLayoutEditor({ window, game, audio, layout, settings }) {
  const view = new LayoutView({ document: window.document, layout });
  const editor = new LayoutEditor({ view, game, audio, layout, settingsPanel: settings });
  installLayoutDrag(view.preview, editor);
  view.section.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit]');
    if (button) {
      TOOLBAR_ACTIONS[button.dataset.edit](editor);
    }
  });
  // a phone turned while editing shows, and edits, the other orientation's layout
  window.addEventListener('resize', () => {
    if (view.isOpen()) {
      editor.render();
    }
  });
  return editor;
}
