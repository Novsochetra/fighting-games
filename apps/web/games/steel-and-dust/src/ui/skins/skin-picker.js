import { SKIN_IDS, skinIdFor } from '../../data/skins/skins.js';
import { onFoldChange } from '../../../../../packages/screen/src/viewport-segments.js';
import { SkinView } from './skin-view.js';

// the Skins menu: it steps through the skins on a copy of the touch layer, so a player sees each
// on their own screen before picking it; only Use changes the setting, and Cancel (the menus'
// Back) just leaves
export class SkinPicker {
  constructor({ view, game, audio, layout, settingsPanel }) {
    Object.assign(this, { view, game, audio, layout, settingsPanel });
    this.index = 0;
  }

  build() {
    this.index = SKIN_IDS.indexOf(skinIdFor(this.game.settings));
    this.render();
  }

  // the keyboard and gamepad highlight starts on Use
  firstSelected() {
    return this.view.bar.querySelectorAll('button').length - 1;
  }

  render(from = 0) {
    this.view.render(SKIN_IDS[this.index], this.game.settings, from);
  }

  step(step) {
    this.index = (this.index + step + SKIN_IDS.length) % SKIN_IDS.length;
    this.audio.sfx('ui');
    this.render(step);
  }

  use() {
    this.game.settings.skin = SKIN_IDS[this.index];
    this.game.io.saveSettings(this.game.settings);
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
