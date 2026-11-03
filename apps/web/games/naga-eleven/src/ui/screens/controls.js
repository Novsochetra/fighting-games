import { answerConfirm, closeConfirm, openConfirm } from './confirm.js';
import { focusedItem, moveFocus, scopeOf } from './focus.js';
import { stepOf } from './nav-step.js';
import { SCREENS } from './registry.js';
import { currentSection, returnUnder } from './show.js';

const screenOf = (app) => (app.current ? SCREENS[app.current.name] : null);

function adjust(app, key, by) {
  if (key) {
    screenOf(app)?.adjust?.(key, by, app);
  }
}

// up and down walk the screen's buttons; left and right change the row in focus, where it has
// a value to change, and walk the buttons where it has none
export function navigate(app, step) {
  const move = stepOf(step);
  const scope = scopeOf(currentSection(app));

  if (!move || !scope) {
    return;
  }

  const item = focusedItem(scope);

  if (move.axis === 'adjust' && item?.dataset.adjust) {
    adjust(app, item.dataset.adjust, move.by);

    return;
  }

  moveFocus(scope, move.by);
}

export function confirm(app) {
  const scope = scopeOf(currentSection(app));
  const item = focusedItem(scope);

  if (!item) {
    moveFocus(scope, 0);

    return;
  }

  if (item.dataset.adjust) {
    adjust(app, item.dataset.adjust, 1);

    return;
  }

  item.click();
}

export function back(app) {
  const screen = screenOf(app);

  if (!screen) {
    return;
  }

  if (app.confirming) {
    closeConfirm(app, currentSection(app));

    return;
  }

  if (screen.back?.(app)) {
    return;
  }

  if (screen.side && app.under.length > 0) {
    returnUnder(app);

    return;
  }

  app.emit('back', { from: app.current.name });
}

function adjustFrom(app, button) {
  const row = button.closest('[data-adjust]');

  row?.focus({ preventScroll: true });
  adjust(app, row?.dataset.adjust, Number(button.dataset.by) || 1);
}

const BUILT_IN = {
  back: (app) => back(app),
  'confirm-yes': (app) => answerConfirm(app, currentSection(app), true),
  'confirm-no': (app) => answerConfirm(app, currentSection(app), false),
  adjust: adjustFrom,
};

function press(app, button) {
  const { action } = button.dataset;

  if (BUILT_IN[action]) {
    BUILT_IN[action](app, button);
  } else if (button.dataset.ask) {
    openConfirm(app, currentSection(app), button);
  } else if (!screenOf(app).act?.(action, button, app)) {
    app.emit(action);
  }
}

export function onClick(app, event) {
  const button = event.target.closest?.('[data-action]');
  const section = currentSection(app);

  if (button && section?.contains(button) && !button.disabled) {
    press(app, button);
  }
}
