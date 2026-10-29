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

// a run that ended with a score can be posted once, while it has its ticket, and shared any time;
// its card is drawn ahead, as a share sheet opens only straight from a tap
function showRunEnded(byId, { prefix, game, context, ended }) {
  const { online, share } = context();
  const shareable = ended && !!game.lastRun;

  byId(`${prefix}PostBtn`).hidden = !ended || !online.canPost(game.lastRun);
  byId(`${prefix}ShareBtn`).hidden = !shareable;

  if (shareable) {
    share.prepare(game.lastRun, online.rankOf(game.lastRun));
  }
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
      const { online } = context();
      byId('overTitle').textContent = out ? 'Game over' : 'You fell';
      byId('overNote').innerHTML = overNoteHtml(game, out && online.rankOf(game.lastRun));
      byId('startOverBtn').hidden = !out;
      byId('continueBtn').hidden = out;
      byId('restartMissionBtn').hidden = out;
      byId('overBoardBtn').hidden = !out;
      showRunEnded(byId, { prefix: 'over', game, context, ended: out });
    },
    clear() {
      byId('clearStats').innerHTML = clearResultsHtml(game);
      showRunEnded(byId, { prefix: 'clear', game, context, ended: true });
    },
  };
}
