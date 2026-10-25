import { EVENTS, onOff } from './analytics-events.js';
import { isPlainClick } from './input-actions.js';

const listen = (element, type, listener, signal) =>
  element.addEventListener(type, listener, { signal });

function wirePlayLinks({ links, controller, sheet, signal }) {
  const playSelected = (source) => (event) => {
    if (!isPlainClick(event)) {
      return;
    }
    event.preventDefault();
    sheet.finish();
    controller.open(controller.selectedIndex(), source);
  };
  Object.entries(links).forEach(([source, link]) =>
    listen(link, 'click', playSelected(source), signal),
  );
}

function wireLibrary({ elements, controller, signal }) {
  listen(
    elements.grid,
    'click',
    (event) => {
      const tile = event.target?.closest?.('.tile');
      if (tile) {
        controller.pickTile(Number(tile.dataset.gameIndex));
      }
    },
    signal,
  );
  listen(
    elements.filters,
    'click',
    (event) => {
      const option = event.target?.closest?.('[data-filter]');
      if (option) {
        controller.setFilter(option.dataset.filter);
      }
    },
    signal,
  );
  listen(elements.showMore, 'click', () => controller.showMore(), signal);
}

export function wireAppearanceToggle({ button, appearance, sound, track, signal }) {
  const show = () => button.setAttribute('aria-pressed', String(appearance.current() === 'dark'));
  show();
  listen(
    button,
    'click',
    () => {
      appearance.toggle();
      show();
      sound.play('appearance');
      track(EVENTS.appearance, { appearance: appearance.current() });
    },
    signal,
  );
}

export function wireSoundToggle({ button, preferences, sound, track, signal }) {
  const show = () => button.setAttribute('aria-pressed', String(preferences.isSoundOn()));
  show();
  listen(
    button,
    'click',
    () => {
      preferences.setSound(!preferences.isSoundOn());
      show();
      sound.play('soundOn');
      track(EVENTS.sound, { sound: onOff(preferences.isSoundOn()) });
    },
    signal,
  );
}

function openDetails({ controller, sheet, track }) {
  const card = controller.selectedCard();
  sheet.open(card);
  if (card) {
    track(EVENTS.details, { game_id: card.id });
  }
}

export function wireControls({ view, controller, sheet, track, signal }) {
  const { spotlight, library, elements } = view;
  const links = { play_button: spotlight.elements.play, details: sheet.elements.play };
  wirePlayLinks({ links, controller, sheet, signal });
  const showDetails = () => openDetails({ controller, sheet, track });
  listen(spotlight.elements.details, 'click', showDetails, signal);
  listen(spotlight.elements.favorite, 'click', () => controller.toggleFavorite(), signal);
  listen(elements.retry, 'click', () => controller.load(), signal);
  wireLibrary({ elements: library.elements, controller, signal });
}
