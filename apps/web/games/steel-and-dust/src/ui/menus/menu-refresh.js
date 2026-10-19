import { clearStatsHtml, overNoteHtml, titleNoteHtml, weaponButtonLabel } from './menu-text.js';

// fills in the live text of a base menu when it opens
export function createMenuRefreshers({ document, game, context }) {
  const byId = (id) => document.getElementById(id);
  return {
    title() {
      byId('titleNote').innerHTML = titleNoteHtml(game, context());
      context().fullscreen.refreshLabels();
    },
    pause() {
      const button = byId('weaponBtn');
      button.hidden = !game.settings.training;
      button.textContent = weaponButtonLabel(game);
      context().fullscreen.refreshLabels();
    },
    over() {
      byId('overNote').innerHTML = overNoteHtml(game);
    },
    clear() {
      byId('clearStats').innerHTML = clearStatsHtml(game);
    },
  };
}
