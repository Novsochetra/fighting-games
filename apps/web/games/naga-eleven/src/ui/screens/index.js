import { applyStrings } from './apply-strings.js';
import { back, confirm, navigate, onClick } from './controls.js';
import { watchScroll } from './scroll-hint.js';
import { preferredLang, readSettings, writeSettings } from './settings-store.js';
import { changeLang, hideScreens, rerender, sectionOf, showScreen } from './show.js';
import { LANGS } from './strings.js';
import { followStage } from './title-place.js';

function createApp(document, { storage, onAction }) {
  const settings = readSettings(storage, { lang: preferredLang(document.defaultView?.navigator) });
  const app = {
    document,
    root: document.getElementById('screens'),
    storage,
    settings,
    lang: settings.lang,
    current: null,
    under: [],
    confirming: null,
    emit: (name, payload) => onAction(name, payload),
  };

  app.rerender = () => rerender(app);
  app.applyLang = (lang) => changeLang(app, lang);

  return app;
}

function storeLang(app, lang) {
  if (!LANGS.includes(lang)) {
    return;
  }

  app.settings = { ...app.settings, lang };
  writeSettings(app.storage, app.settings);
  app.applyLang(lang);
}

// every DOM screen of the game over the canvas; `onAction(name, payload)` tells the game what the
// player picked, and the game shows the next screen
export function createScreens(document, { storage = null, onAction = () => {} } = {}) {
  const app = createApp(document, { storage, onAction });

  applyStrings(app.root, app.lang);
  app.root.addEventListener('click', (event) => onClick(app, event));
  watchScroll(app.root);
  followStage(document, sectionOf(app, 'title'));

  return {
    show: (name, data) => showScreen(app, name, data),
    hide: () => hideScreens(app),
    current: () => app.current?.name ?? null,
    setLang: (lang) => storeLang(app, lang),
    navigate: (step) => navigate(app, step),
    confirm: () => confirm(app),
    back: () => back(app),
    settings: () => ({ ...app.settings }),
  };
}
