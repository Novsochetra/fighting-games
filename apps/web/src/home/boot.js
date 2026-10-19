import { fetchCatalog } from './catalog-client.js';
import { createGamepadPoller } from './gamepad-poller.js';
import { createHomeController } from './home-controller.js';
import { createHomeView } from './home-view.js';
import { actionForKey, isFormControl } from './input-actions.js';

function wireKeyboard(document, controller, signal) {
  const onKeyDown = (event) => {
    const action = actionForKey(event);
    if (!action || isFormControl(event.target)) {
      return;
    }
    if (controller.handleAction(action)) {
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', onKeyDown, { signal });
}

function wirePointer(shelf, controller, signal) {
  const selectFromEvent = (event) => {
    const link = event.target.closest?.('[data-game-index]');
    if (link) {
      controller.select(Number(link.dataset.gameIndex));
    }
  };
  shelf.addEventListener('pointerover', selectFromEvent, { signal });
  shelf.addEventListener('focusin', selectFromEvent, { signal });
}

function wireGamepads({ events, getGamepads, requestFrame }, controller, signal) {
  const poller = createGamepadPoller({
    getGamepads,
    requestFrame,
    onAction: (action) => controller.handleAction(action),
  });
  events.addEventListener('gamepadconnected', () => poller.start(), { signal });
  poller.start();
}

export function bootHome({ document, fetch, navigate, gamepads }) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const view = createHomeView(document);
  const controller = createHomeController({
    view,
    navigate,
    loadGames: () => fetchCatalog(fetch),
  });
  wireKeyboard(document, controller, signal);
  wirePointer(view.elements.shelf, controller, signal);
  view.elements.retry.addEventListener('click', () => controller.load(), { signal });
  if (gamepads) {
    wireGamepads(gamepads, controller, signal);
  }
  return { controller, ready: controller.load(), stop: () => lifetime.abort() };
}
