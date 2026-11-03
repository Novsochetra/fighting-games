import { setSlot } from './dom.js';
import { focusAt } from './focus.js';
import { say } from './strings.js';

const panelOf = (section) => section?.querySelector('.confirm') ?? null;

function fill(panel, { ask, yes }, lang) {
  setSlot(panel, 'ask', say(ask, lang));
  setSlot(panel, 'yes', say(yes, lang));
}

// the safe answer takes the focus, so a quick second press never throws a story away
export function openConfirm(app, section, opener) {
  const panel = panelOf(section);
  const { action, ask, yes = 'yes' } = opener.dataset;

  if (!panel) {
    app.emit(action);

    return;
  }

  app.confirming = { action, ask, yes, opener };
  fill(panel, app.confirming, app.lang);
  panel.hidden = false;
  section.classList.add('is-confirming');
  focusAt(panel, 1);
}

export function refreshConfirm(app, section) {
  const panel = panelOf(section);

  if (app.confirming && panel) {
    fill(panel, app.confirming, app.lang);
  }
}

export function closeConfirm(app, section, { refocus = true } = {}) {
  const panel = panelOf(section);
  const opener = app.confirming?.opener;

  app.confirming = null;
  section?.classList.remove('is-confirming');

  if (panel) {
    panel.hidden = true;
  }

  if (refocus) {
    opener?.focus({ preventScroll: true });
  }
}

export function answerConfirm(app, section, yes) {
  const action = app.confirming?.action;

  closeConfirm(app, section, { refocus: !yes });

  if (yes && action) {
    app.emit(action);
  }
}
