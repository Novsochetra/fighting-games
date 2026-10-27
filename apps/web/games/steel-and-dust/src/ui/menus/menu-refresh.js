import { hasLivesLeft } from '../../sim/stage/lives.js';
import { continueSavedLabel, overNoteHtml, titleNoteHtml, weaponButtonLabel } from './menu-text.js';
import { clearResultsHtml } from './results-text.js';

// with a run saved, Continue takes the lead and Play starts a new one in its place
function showSavedRun(byId, checkpoint) {
  const continueButton = byId('continueSavedBtn');
  const playButton = byId('playBtn');
  continueButton.hidden = !checkpoint;
  continueButton.textContent = checkpoint ? continueSavedLabel(checkpoint) : '';
  playButton.textContent = checkpoint ? 'New game' : 'Play';
  playButton.classList.toggle('primary', !checkpoint);
}

// fills in the live text of a base menu when it opens
export function createMenuRefreshers({ document, game, context }) {
  const byId = (id) => document.getElementById(id);
  return {
    title() {
      showSavedRun(byId, game.checkpoint);
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
      byId('overBoardBtn').hidden = !out;
    },
    clear() {
      byId('clearStats').innerHTML = clearResultsHtml(game);
    },
  };
}
