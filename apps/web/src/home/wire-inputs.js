import { createGamepadPoller } from './gamepad-poller.js';
import { actionForKey, isFormControl, isPlainClick } from './input-actions.js';
import { trackInputModality } from './input-modality.js';

function gameIndexOf(target) {
  const link = target?.closest?.('[data-game-index]');
  return link ? Number(link.dataset.gameIndex) : -1;
}

function wireKeyboard({ document, controller, modality, signal }) {
  const onKeyDown = (event) => {
    const action = actionForKey(event);
    if (!action || isFormControl(event.target)) {
      return;
    }
    modality.useKeys();
    if (controller.handleAction(action)) {
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', onKeyDown, { signal });
}

function wirePointer({ grid, controller, modality, signal }) {
  const selectHovered = (event) => {
    if (!modality.isKeys()) {
      controller.select(gameIndexOf(event.target));
    }
  };
  const openClicked = (event) => {
    const index = gameIndexOf(event.target);
    if (index >= 0 && isPlainClick(event)) {
      event.preventDefault();
      controller.open(index);
    }
  };
  grid.addEventListener('pointerover', selectHovered, { signal });
  grid.addEventListener('focusin', (event) => controller.select(gameIndexOf(event.target)), {
    signal,
  });
  grid.addEventListener('click', openClicked, { signal });
  // iOS Safari shows :active, the pressed look of an icon, only where something listens for touches.
  grid.addEventListener('touchstart', () => {}, { signal, passive: true });
}

function wireGamepads({ gamepads, controller, modality, signal }) {
  const poller = createGamepadPoller({
    getGamepads: gamepads.getGamepads,
    requestFrame: gamepads.requestFrame,
    onAction: (action) => {
      modality.useKeys();
      controller.handleAction(action);
    },
  });
  gamepads.events.addEventListener('gamepadconnected', () => poller.start(), { signal });
  poller.start();
}

export function wireInputs({ document, grid, controller, gamepads, signal }) {
  const modality = trackInputModality({ document, signal });
  wireKeyboard({ document, controller, modality, signal });
  wirePointer({ grid, controller, modality, signal });
  if (gamepads) {
    wireGamepads({ gamepads, controller, modality, signal });
  }
}
