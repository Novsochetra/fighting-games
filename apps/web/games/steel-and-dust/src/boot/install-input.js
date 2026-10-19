import { installAudioUnlock } from '../audio/index.js';
import { createGamepadReader } from '../input/gamepad.js';
import { installKeyboard } from '../input/keyboard.js';
import { installPauseButton, installTouchButtons } from '../input/touch-buttons.js';
import { installTouchStick, TouchStick } from '../input/touch-stick.js';
import { pause } from '../sim/stage/flow.js';

function installPointerTracking(window, { game, audio, ui, layout }) {
  window.addEventListener(
    'pointerdown',
    (event) => {
      ui.noteInput(event.pointerType === 'touch' ? 'touch' : 'mouse');
      if (event.pointerType === 'touch' && !game.device.touchUsed) {
        game.device.touchUsed = true;
        layout.applyTouchSettings();
      }
      audio.unlock();
    },
    true,
  );
}

export function installInput({ window, elements, game, audio, ui, layout, menus }) {
  installAudioUnlock(window, audio);
  installKeyboard(window, { game, audio, menus, ui });
  installPointerTracking(window, { game, audio, ui, layout });
  window.document.addEventListener('visibilitychange', () => {
    if (window.document.hidden) {
      pause(game);
    }
  });
  elements.canvas.addEventListener('pointerdown', () =>
    elements.canvas.focus({ preventScroll: true }),
  );
  const touchStick = new TouchStick({
    elements: { zone: elements.stickZone, base: elements.stickBase, knob: elements.stickKnob },
    game,
    layout,
  });
  installTouchStick(touchStick, { zone: elements.stickZone, base: elements.stickBase });
  installTouchButtons(elements.touchButtons, { game, audio });
  installPauseButton(elements.pauseButton, { game, audio });
  const gamepad = createGamepadReader({ navigator: window.navigator, game, menus, ui });
  return { touchStick, gamepad };
}
