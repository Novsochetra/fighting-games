import { createGamepadPoller } from './gamepad-poller.js';
import { wireCarousel } from './wire-carousel.js';
import { wireAppearanceToggle, wireControls, wireSoundToggle } from './wire-controls.js';
import { wireKeys } from './wire-keys.js';

function wireGamepads({ gamepads, controller, isBlocked, signal }) {
  const poller = createGamepadPoller({
    getGamepads: gamepads.getGamepads,
    requestFrame: gamepads.requestFrame,
    onAction: (action) => {
      if (!isBlocked()) {
        controller.handleAction(action);
      }
    },
  });
  gamepads.events.addEventListener('gamepadconnected', () => poller.start(), { signal });
  poller.start();
}

export function wireInputs({ document, view, controller, sheet, gamepads, settings, signal }) {
  const isBlocked = sheet.isOpen;
  wireKeys({ document, controller, isBlocked, signal });
  wireCarousel({ elements: view.elements, controller, signal });
  wireControls({ view, controller, sheet, signal });
  wireSoundToggle({ button: document.getElementById('sound-toggle'), ...settings, signal });
  wireAppearanceToggle({
    button: document.getElementById('appearance-toggle'),
    ...settings,
    signal,
  });
  // iOS Safari shows :active, the pressed look of a card, only where something listens for touches.
  document.addEventListener('touchstart', () => {}, { signal, passive: true });
  if (gamepads) {
    wireGamepads({ gamepads, controller, isBlocked, signal });
  }
}
