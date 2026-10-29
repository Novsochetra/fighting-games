import { keyShapeOf, SKIN_IDS, skinIdFor } from '../../data/skins/skins.js';
import { onFoldChange } from '../../../../../packages/screen/src/viewport-segments.js';
import { SkinView } from './skin-view.js';

// the Skins menu: it steps through the skins on a copy of the touch layer, so a player sees each
// on their own screen before picking it, and switches the shoulder keys of a skin that offers it
// between round and pill. A skin with a shell moves the stage into its frame meanwhile
// (layout.previewSkin); only Use changes the settings, and Cancel, or any way back, leaves them
export class SkinPicker {
  constructor({ view, game, audio, layout, settingsPanel }) {
    Object.assign(this, { view, game, audio, layout, settingsPanel });
    this.index = 0;
  }

  build() {
    this.index = SKIN_IDS.indexOf(skinIdFor(this.game.settings));
    this.keyShape = keyShapeOf(this.game.settings);
    this.render();
  }

  // the menus' Back, by Cancel, Use, a key or the gamepad
  leave() {
    this.layout.previewSkin(null);
  }

  // the keyboard and gamepad highlight starts on Use
  firstSelected() {
    return [...this.view.bar.querySelectorAll('button')].findIndex(
      (button) => button.dataset.skin === 'use',
    );
  }

  render(from = 0) {
    const look = { skinId: SKIN_IDS[this.index], keyShape: this.keyShape };

    this.layout.previewSkin(look.skinId, look.keyShape);
    this.view.render(look, this.game.settings, from);
  }

  step(step) {
    this.index = (this.index + step + SKIN_IDS.length) % SKIN_IDS.length;
    this.audio.sfx('ui');
    this.render(step);
  }

  switchShape() {
    this.keyShape = this.keyShape === 'pill' ? 'round' : 'pill';
    this.audio.sfx('ui');
    this.render();
  }

  use() {
    this.game.settings.skin = SKIN_IDS[this.index];
    this.game.settings.keyShape = this.keyShape;
    this.game.io.saveSettings(this.game.settings);
    this.layout.previewSkin(null);
    this.layout.applyTouchSettings();
    this.settingsPanel.build();
  }
}

// a thumb swiped across the screen shows the next skin, as a photo flicks by: right to left for
// the next one; a drag too short, or more up than across, is no swipe
const SWIPE = 40;

function swipeStep(start, event) {
  const across = event.clientX - start.x;
  const up = Math.abs(event.clientY - start.y);

  if (Math.abs(across) < SWIPE || Math.abs(across) < up * 1.2) {
    return 0;
  }

  return across < 0 ? 1 : -1;
}

function installSwipe(section, picker) {
  let start = null;

  section.addEventListener('pointerdown', (event) => {
    start = event.target.closest('.layout-bar')
      ? null
      : { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  });
  section.addEventListener('pointerup', (event) => {
    const step = start?.pointerId === event.pointerId ? swipeStep(start, event) : 0;

    start = null;

    if (step) {
      picker.step(step);
    }
  });
  section.addEventListener('pointercancel', () => {
    start = null;
  });
}

export function createSkinPicker({ window, game, audio, layout, settings }) {
  const view = new SkinView({ document: window.document, layout });
  const picker = new SkinPicker({ view, game, audio, layout, settingsPanel: settings });

  installSwipe(view.section, picker);
  view.section.addEventListener('click', (event) => {
    const stepper = event.target.closest('[data-skin-step]');

    if (stepper) {
      picker.step(Number(stepper.dataset.skinStep));
    } else if (event.target.closest('[data-skin-shape]')) {
      picker.switchShape();
    } else if (event.target.closest('[data-skin="use"]')) {
      picker.use();
    }
  });

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
