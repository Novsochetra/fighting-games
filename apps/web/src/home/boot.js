import { createAnalytics } from './analytics.js';
import { createAppearance } from './appearance.js';
import { fetchCatalog } from './catalog-client.js';
import { wireConsentBanner } from './consent-banner.js';
import { createDetailsSheet } from './details-sheet.js';
import { createHomeController } from './home-controller.js';
import { createHomeView } from './home-view.js';
import { wireInstallBanner } from './install-banner.js';
import { createLauncher } from './launcher.js';
import { createMemoryStorage, createPreferences } from './preferences.js';
import { createSoundPlayer } from './sound-player.js';
import { wireSupportBanner } from './support-banner.js';
import { wireInputs } from './wire-inputs.js';

// Back from a game through the back/forward cache: the card takes the screen back, then the Recent
// list catches up with the game just played.
function watchReturns({ document, launcher, controller, sound, signal }) {
  const onPageShow = (event) => {
    if (!event.persisted) {
      return;
    }
    if (launcher.isFlying()) {
      sound.play('land');
    }
    launcher.land().then(() => controller.refreshRecent());
  };
  document.defaultView.addEventListener('pageshow', onPageShow, { signal });
}

// The analytics question goes first, then install: while either is up, the support banner waits for
// another visit.
function wireBanners({ document, installer, settings, signal, visit }) {
  const { preferences, sound, analytics, track } = settings;
  wireConsentBanner({ document, analytics, sound, signal });
  if (installer) {
    wireInstallBanner({ document, installer, preferences, sound, signal, track });
  }
  const support = wireSupportBanner({
    document,
    preferences,
    sound,
    signal,
    now: visit.now,
    track,
  });
  support.offer();
}

const createHomeSound = ({ createAudioContext, preferences }) =>
  createSoundPlayer({
    createContext: createAudioContext ?? (() => null),
    isEnabled: preferences.isSoundOn,
  });

export function bootHome({
  document,
  fetch,
  navigate,
  gamepads,
  storage,
  createAudioContext,
  installer,
  analytics: analyticsSetup = {},
  visit = { now: () => Date.now() },
}) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const store = storage ?? createMemoryStorage();
  const preferences = createPreferences(store);
  const analytics = createAnalytics({ ...analyticsSetup, storage: store });
  const { track } = analytics;
  const appearance = createAppearance({ document, storage: store, signal });
  const sound = createHomeSound({ createAudioContext, preferences });
  const view = createHomeView(document);
  const { home } = view.elements;
  const launcher = createLauncher({ document, home, findSource: view.findLaunchSource, navigate });
  const loadGames = () => fetchCatalog(fetch);
  const controller = createHomeController({ view, loadGames, launcher, preferences, sound, track });
  const sheet = createDetailsSheet({ document, sound, signal });
  const settings = { preferences, sound, appearance, analytics, track };
  wireInputs({ document, view, controller, sheet, gamepads, settings, signal });
  watchReturns({ document, launcher, controller, sound, signal });
  wireBanners({ document, installer, settings, signal, visit });
  return {
    controller,
    launcher,
    sheet,
    preferences,
    appearance,
    analytics,
    ready: controller.load(),
    stop: () => lifetime.abort(),
  };
}
