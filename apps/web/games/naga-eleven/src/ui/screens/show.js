import { applyStrings } from './apply-strings.js';
import { closeConfirm, refreshConfirm } from './confirm.js';
import { focusAt, focusedIndex, scopeOf } from './focus.js';
import { SCREENS } from './registry.js';
import { markScroll } from './scroll-hint.js';
import { LANGS, numberIn, say, sayWith, textIn } from './strings.js';

export const sectionOf = (app, name) => app.root.querySelector(`#screen-${name}`);

export const currentSection = (app) => (app.current ? sectionOf(app, app.current.name) : null);

export function viewOf(app) {
  const { lang } = app;

  return {
    document: app.document,
    lang,
    settings: app.settings,
    say: (key) => say(key, lang),
    sayWith: (key, values) => sayWith(key, lang, values),
    text: (value) => textIn(value, lang),
    number: (value) => numberIn(value, lang),
  };
}

function renderCurrent(app) {
  const section = currentSection(app);
  const { name, data, state } = app.current;

  SCREENS[name].render?.(section, { data, state, view: viewOf(app) });
  refreshConfirm(app, section);
}

// reading the layout between the two lets the entrance play again on a screen shown twice
function playEntrance(section) {
  section.classList.remove('is-entering');
  section.getBoundingClientRect();
  section.classList.add('is-entering');
}

// a screen opened afresh starts at its top, and one returned to where it was left
function open(app, entry, { focus = 0, scroll = 0 } = {}) {
  const section = sectionOf(app, entry.name);

  closeConfirm(app, currentSection(app), { refocus: false });
  app.current = entry;
  app.root.hidden = false;
  app.root.dataset.screen = entry.name;

  for (const other of app.root.querySelectorAll('.screen')) {
    other.hidden = other !== section;
  }

  renderCurrent(app);
  section.scrollTop = scroll;
  markScroll(section);
  playEntrance(section);
  focusAt(section, focus);
}

function remembered(app) {
  const section = currentSection(app);

  return { ...app.current, focus: focusedIndex(section), scroll: section.scrollTop };
}

// a side screen (hero, settings, how to play) opens over the one before it, and Back returns
// there, to the button that opened it; any other screen starts afresh
export function showScreen(app, name, data = {}) {
  const screen = SCREENS[name];

  if (!screen) {
    throw new Error(`Naga Eleven has no screen called ${name}`);
  }

  if (!screen.side) {
    app.under = [];
  } else if (app.current && app.current.name !== name) {
    app.under.push(remembered(app));
  }

  open(app, { name, data, state: screen.start?.(data, app) ?? {} });
}

export function returnUnder(app) {
  const from = app.current.name;
  const below = app.under.pop();

  open(app, below, { focus: below.focus, scroll: below.scroll });
  app.emit('closed', { screen: from, to: below.name });
}

export function hideScreens(app) {
  closeConfirm(app, currentSection(app), { refocus: false });
  app.current = null;
  app.under = [];
  app.root.hidden = true;
  delete app.root.dataset.screen;
}

export function rerender(app) {
  if (!app.current) {
    return;
  }

  const scope = scopeOf(currentSection(app));
  const at = focusedIndex(scope);

  renderCurrent(app);
  markScroll(currentSection(app));

  if (at >= 0) {
    focusAt(scope, at);
  }
}

export function changeLang(app, lang) {
  if (!LANGS.includes(lang)) {
    return;
  }

  app.lang = lang;
  applyStrings(app.root, lang);
  rerender(app);
}
