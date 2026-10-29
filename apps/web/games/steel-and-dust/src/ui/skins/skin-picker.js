import { keyShapesOf, SKIN_IDS, skinIdFor } from '../../data/skins/skins.js';
import { onFoldChange } from '../../../../../packages/screen/src/viewport-segments.js';
import { KeyChooser } from './key-chooser.js';
import { installSwipe } from './skin-swipe.js';
import { SkinView } from './skin-view.js';

const withShape = (keyShapes, control, shape) => {
  const others = Object.fromEntries(Object.entries(keyShapes).filter(([id]) => id !== control));

  return shape === 'pill' ? { ...others, [control]: 'pill' } : others;
};

// the Skins menu: it steps through the skins on a copy of the touch layer, so a player sees each
// on their own screen before picking it, and a key the skin offers a pill for opens a chooser of
// its shape. A skin with a shell moves the stage into its frame meanwhile (layout.previewSkin);
// only Use changes the skin worn, and Cancel, or any way back, leaves it (a layout Done in the editor
// opened from here is kept either way, as it belongs to the skin looked at). `select` (the menus')
// moves the keyboard and gamepad highlight as the chooser opens and closes
export class SkinPicker {
  constructor({ view, chooser, game, audio, layout, settingsPanel }) {
    Object.assign(this, { view, chooser, game, audio, layout, settingsPanel });
    this.index = 0;
    this.keyShapes = {};
    this.select = () => {};
  }

  build() {
    this.index = SKIN_IDS.indexOf(skinIdFor(this.game.settings));
    this.keyShapes = keyShapesOf(this.game.settings);
    this.render();
  }

  // the menus' Back, by Cancel, Use, a key or the gamepad
  leave() {
    this.chooser.close();
    this.layout.previewSkin(null);
  }

  // Back with the chooser open closes only the chooser, the highlight back on its key
  backOut() {
    if (!this.chooser.isOpen()) {
      return false;
    }

    const key = this.view.keyFor(this.chooser.control);

    this.chooser.close();
    this.select(key);

    return true;
  }

  // the keyboard and gamepad highlight starts on Use
  firstSelected() {
    return [...this.view.bar.querySelectorAll('button')].findIndex(
      (button) => button.dataset.skin === 'use',
    );
  }

  render(from = 0) {
    const look = { skinId: SKIN_IDS[this.index], keyShapes: this.keyShapes };

    this.chooser.close();
    this.layout.previewSkin(look.skinId, look.keyShapes);
    this.view.render(look, this.game.settings, from);
  }

  step(step) {
    this.index = (this.index + step + SKIN_IDS.length) % SKIN_IDS.length;
    this.audio.sfx('ui');
    this.render(step);
  }

  pick(key) {
    const shape = this.keyShapes[key.dataset.control] ?? 'round';

    this.chooser.open({ key, shape });
    this.audio.sfx('ui');
    this.select(this.chooser.buttonFor(shape));
  }

  choose(shape) {
    const { control } = this.chooser;

    this.keyShapes = withShape(this.keyShapes, control, shape);
    this.audio.sfx('ui');
    this.render();
    this.select(this.view.keyFor(control));
  }

  use() {
    this.game.settings.skin = SKIN_IDS[this.index];
    this.game.settings.keyShapes = this.keyShapes;
    this.game.io.saveSettings(this.game.settings);
    this.leave();
    this.layout.applyTouchSettings();
    this.settingsPanel.build();
  }
}

// a tap anywhere but in the chooser closes it first, so the tap lands on what it was meant for
function onClick(picker, event) {
  const { target } = event;

  if (picker.chooser.isOpen() && !target.closest('.key-chooser')) {
    picker.chooser.close();
  }

  const stepper = target.closest('[data-skin-step]');
  const shape = target.closest('[data-key-shape]');
  const key = target.closest('.skin-preview [data-pickable]');

  if (stepper) {
    picker.step(Number(stepper.dataset.skinStep));
  } else if (shape) {
    picker.choose(shape.dataset.keyShape);
  } else if (key) {
    picker.pick(key);
  } else if (target.closest('[data-skin="use"]')) {
    picker.use();
  }
}

export function createSkinPicker({ window, game, audio, layout, settings }) {
  const { document } = window;
  const view = new SkinView({ document, layout });
  const chooser = new KeyChooser({ document, section: view.section });
  const picker = new SkinPicker({ view, chooser, game, audio, layout, settingsPanel: settings });

  installSwipe(view.section, picker);
  view.section.addEventListener('click', (event) => onClick(picker, event));

  // a phone turned or folded on the screen shows the skin held the new way
  const redraw = () => {
    if (view.isOpen()) {
      picker.render();
    }
  };

  window.addEventListener('resize', redraw);
  onFoldChange(window, redraw);

  return picker;
}
