import { keyShapesOf, SKIN_IDS, skinIdFor } from '../../data/skins/skins.js';
import { onFoldChange } from '../../../../../packages/screen/src/viewport-segments.js';
import { createDraft, savedLayout } from '../layout/layout-draft.js';
import { installLayoutDrag } from '../layout/layout-drag.js';
import { LayoutEditor } from '../layout/layout-editor.js';
import { installSkinClicks } from './skin-clicks.js';
import { installSwipe } from './skin-swipe.js';
import { SkinView } from './skin-view.js';

// the Skins menu: it steps through the skins on a copy of the touch layer, so a player sees each
// on their own screen before picking it, and a press on a control edits it there (`editor`). A skin
// with a shell moves the stage into its frame meanwhile (layout.previewSkin). The skin, its keys'
// shapes and every skin's layout are a draft until Use saves them all; Cancel, or any way back,
// drops it. `select` (the menus') moves the keyboard and gamepad highlight as a control is picked
// and let go
export class SkinPicker {
  constructor({ view, game, audio, layout, settingsPanel }) {
    Object.assign(this, { view, game, audio, layout, settingsPanel });
    this.state = { index: 0, keyShapes: {}, draft: createDraft(null), picked: null };
    this.editor = new LayoutEditor({ screen: this, audio });
    this.select = () => {};
  }

  build() {
    const { settings } = this.game;

    this.state = {
      index: SKIN_IDS.indexOf(skinIdFor(settings)),
      keyShapes: keyShapesOf(settings),
      draft: createDraft(settings.buttonLayout),
      picked: null,
    };
    this.view.bar.reset();
    this.render();
  }

  skinId() {
    return SKIN_IDS[this.state.index];
  }

  slot() {
    return this.view.slot(this.skinId());
  }

  // the menus' Back, by Cancel, Use, a key or the gamepad
  leave() {
    this.state.picked = null;
    this.layout.previewSkin(null);
  }

  backOut() {
    if (!this.state.picked) {
      return false;
    }

    this.editor.unpick();

    return true;
  }

  sideways(step) {
    if (this.state.picked) {
      return false;
    }

    this.step(step);

    return true;
  }

  // the keyboard and gamepad highlight starts on Use
  firstSelected() {
    return this.view.skinTools().findIndex((button) => button.dataset.skin === 'use');
  }

  render(from = 0) {
    const { keyShapes, draft, picked } = this.state;
    const skinId = this.skinId();

    this.layout.previewSkin(skinId, keyShapes);
    this.view.render({ skinId, keyShapes, draft, picked }, this.game.settings, from);
  }

  step(step) {
    this.state.index = (this.state.index + step + SKIN_IDS.length) % SKIN_IDS.length;
    this.state.picked = null;
    this.audio.sfx('ui');
    this.render(step);
  }

  // a tap or a swipe beside the controls lets go of the one edited; with none, a swipe steps
  // through the skins, so a drag that misses its control never changes the skin
  beside(step) {
    if (this.state.picked) {
      this.editor.finish();
    } else if (step) {
      this.step(step);
    }
  }

  use() {
    const { settings } = this.game;

    settings.skin = this.skinId();
    settings.keyShapes = this.state.keyShapes;
    settings.buttonLayout = savedLayout(this.state.draft);
    this.game.io.saveSettings(settings);
    this.leave();
    this.layout.applyTouchSettings();
    this.settingsPanel.build();
  }
}

export function createSkinPicker({ window, game, audio, layout, settings }) {
  const view = new SkinView({ document: window.document, layout });
  const picker = new SkinPicker({ view, game, audio, layout, settingsPanel: settings });

  installSwipe(view.section, picker);
  installLayoutDrag(view.preview, picker.editor);
  installSkinClicks(view.section, picker);

  // a phone turned or folded on the screen shows, and edits, the skin held the new way
  const redraw = () => {
    if (view.isOpen()) {
      picker.render();
    }
  };

  window.addEventListener('resize', redraw);
  onFoldChange(window, redraw);

  return picker;
}
