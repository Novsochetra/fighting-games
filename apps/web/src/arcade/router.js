import { cameFrom } from '../home/back-link.js';
import { screenAt, screenLink } from './routes.js';
import { switchScreen } from './screen-switch.js';

const entryOf = (screen, index) => ({ arcade: { screen, index } });

function whenIdle(window, task) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(task, { timeout: 2000 });
  } else {
    window.setTimeout(task, 1000);
  }
}

async function reveal(nav, id, { direction, hash, animate }) {
  const { window, screens, state, scrolls } = nav;
  const from = screens.get(state.current);
  const to = screens.get(id);
  const scrollY = scrolls.get(state.index) ?? 0;

  state.current = id;
  state.trail[state.index] = id;
  to.start();
  await switchScreen(window.document, { from, to, direction, scrollY, animate });
  to.shown({ hash });
}

async function go(nav, id, url, direction) {
  const { window, screens, state, scrolls } = nav;

  if (id === state.current) {
    screens.get(id).shown({ hash: url.hash });
    return;
  }

  try {
    await screens.get(id).ready();
  } catch {
    window.location.assign(url.href);
    return;
  }

  state.index += 1;
  state.trail.length = state.index;
  scrolls.delete(state.index);
  window.history.pushState(entryOf(id, state.index), '', url.href);
  await reveal(nav, id, { direction, hash: url.hash, animate: true });
}

// Back pops to the screen before when the arcade came from it, so it comes back as it was left; a
// page loaded from the arcade goes back through history too, so the browser brings the arcade back.
// Opened on its own, Back goes to the arcade, still sliding the way Back does.
function back(nav, id, url) {
  const { window, state, referrer } = nav;
  const { history } = window;
  const fromPrevious = state.index > 0 && state.trail[state.index - 1] === id;
  const loadedFrom =
    state.index === 0 && cameFrom(url, { referrer, historyLength: history.length });

  if (fromPrevious || loadedFrom) {
    history.back();
  } else {
    go(nav, id, url, 'pop');
  }
}

// A swipe back that the browser already slid needs no slide of its own.
async function onPopState(nav, event) {
  const { window, screens, root, state } = nav;
  const entry = event.state?.arcade;
  const id = entry?.screen ?? screenAt(new URL(window.location.href), root);
  const index = entry?.index ?? state.index;
  const visit = { direction: index < state.index ? 'pop' : 'push', hash: window.location.hash };

  if (!id) {
    return;
  }

  try {
    await screens.get(id).ready();
  } catch {
    window.location.reload();
    return;
  }

  state.index = index;

  if (id === state.current) {
    screens.get(id).shown(visit);
  } else {
    await reveal(nav, id, { ...visit, animate: !event.hasUAVisualTransition });
  }
}

function onClick(nav, event) {
  const link = screenLink(event, nav.root);

  if (!link) {
    return;
  }

  event.preventDefault();

  if (link.back) {
    back(nav, link.screen, link.url);
  } else {
    go(nav, link.screen, link.url, 'push');
  }
}

function start(nav, startId) {
  const { window, screens, state, scrolls, signal } = nav;
  const { document, history } = window;

  history.scrollRestoration = 'manual';
  history.replaceState({ ...history.state, ...entryOf(startId, state.index) }, '');
  state.trail[state.index] = startId;
  screens.get(startId).shown({ hash: window.location.hash });
  document.addEventListener('click', (event) => onClick(nav, event), { signal });
  window.addEventListener('popstate', (event) => onPopState(nav, event), { signal });
  window.addEventListener('scroll', () => scrolls.set(state.index, window.scrollY), {
    passive: true,
    signal,
  });
  whenIdle(window, () => screens.forEach((screen) => screen.ready().catch(() => {})));
}

// The arcade's screens change in the page, never through a load. Each change is an entry in the
// tab's history, so Back, the browser's back and forward and a reload all land where they should;
// every screen keeps its own scroll, as each page kept its own.
export function createRouter({ window, screens, root, startId, referrer }) {
  const lifetime = new AbortController();
  const index = window.history.state?.arcade?.index ?? 0;
  const state = { current: startId, index, trail: [] };
  const nav = { window, screens, root, state, referrer, scrolls: new Map() };

  nav.signal = lifetime.signal;

  return {
    current: () => state.current,
    start: () => start(nav, startId),
    stop: () => lifetime.abort(),
  };
}
