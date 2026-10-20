import { hasLivesLeft } from '../../sim/stage/lives.js';
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
    // with no lives left the run can only start over from the first mission
    over() {
      const out = !hasLivesLeft(game);
      byId('overTitle').textContent = out ? 'Game over' : 'You fell';
      byId('overNote').innerHTML = overNoteHtml(game);
      byId('startOverBtn').hidden = !out;
      byId('continueBtn').hidden = out;
      byId('restartMissionBtn').hidden = out;
    },
    clear() {
      byId('clearStats').innerHTML = clearStatsHtml(game);
    },
  };
}
