import { createAnalytics } from './analytics.js';
import { createAppearance } from './appearance.js';
import { fetchCatalog } from './catalog-client.js';
import { wireCoffee } from './coffee.js';
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
// another visit. The coffee button floats beside them and steps aside on a phone while one is up.
function wireBanners({ document, installer, settings, signal, visit }) {
  const { preferences, sound, analytics, track } = settings;
  wireConsentBanner({ document, analytics, sound, signal });
  wireCoffee({ document, sound, signal });
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

// In the arcade the other screens share the appearance and the sound, and the keys and the pad are
// the arcade's only while it shows; on its own the arcade makes its own.
function homeServices({ document, storage, createAudioContext, analytics, shared = {} }, signal) {
  const store = storage ?? createMemoryStorage();
  const preferences = createPreferences(store);
  const sound = () =>
    createSoundPlayer({
      createContext: createAudioContext ?? (() => null),
      isEnabled: preferences.isSoundOn,
    });

  return {
    preferences,
    analytics: createAnalytics({ ...analytics, storage: store }),
    appearance: shared.appearance ?? createAppearance({ document, storage: store, signal }),
    sound: shared.sound ?? sound(),
    isShowing: shared.isShowing ?? (() => true),
  };
}

export function bootHome(options) {
  const { document, fetch, navigate, gamepads, installer } = options;
  const visit = options.visit ?? { now: () => Date.now() };
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const { preferences, analytics, appearance, sound, isShowing } = homeServices(options, signal);
  const { track } = analytics;
  const view = createHomeView(document);
  const { home } = view.elements;
  const launcher = createLauncher({ document, home, findSource: view.findLaunchSource, navigate });
  const loadGames = () => fetchCatalog(fetch);
  const controller = createHomeController({ view, loadGames, launcher, preferences, sound, track });
  const sheet = createDetailsSheet({ document, sound, signal });
  const settings = { preferences, sound, appearance, analytics, track };

  wireInputs({ document, view, controller, sheet, gamepads, settings, isShowing, signal });
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
