import { isPlainClick } from './input-actions.js';

const listen = (element, type, listener, signal) =>
  element.addEventListener(type, listener, { signal });

function wirePlayLinks({ links, controller, sheet, signal }) {
  const playSelected = (event) => {
    if (!isPlainClick(event)) {
      return;
    }
    event.preventDefault();
    sheet.finish();
    controller.open(controller.selectedIndex());
  };
  links.forEach((link) => listen(link, 'click', playSelected, signal));
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

export function wireAppearanceToggle({ button, appearance, sound, signal }) {
  const show = () => button.setAttribute('aria-pressed', String(appearance.current() === 'dark'));
  show();
  listen(
    button,
    'click',
    () => {
      appearance.toggle();
      show();
      sound.play('appearance');
    },
    signal,
  );
}

export function wireSoundToggle({ button, preferences, sound, signal }) {
  const show = () => button.setAttribute('aria-pressed', String(preferences.isSoundOn()));
  show();
  listen(
    button,
    'click',
    () => {
      preferences.setSound(!preferences.isSoundOn());
      show();
      sound.play('soundOn');
    },
    signal,
  );
}

export function wireControls({ view, controller, sheet, signal }) {
  const { spotlight, library, elements } = view;
  const links = [spotlight.elements.play, sheet.elements.play];
  wirePlayLinks({ links, controller, sheet, signal });
  listen(spotlight.elements.details, 'click', () => sheet.open(controller.selectedCard()), signal);
  listen(spotlight.elements.favorite, 'click', () => controller.toggleFavorite(), signal);
  listen(elements.retry, 'click', () => controller.load(), signal);
  wireLibrary({ elements: library.elements, controller, signal });
}
