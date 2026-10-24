import { createAppearance } from './appearance.js';
import { fetchCatalog } from './catalog-client.js';
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

// Install goes first: while its banner is up, the support banner waits for another visit.
function wireBanners({ document, installer, preferences, sound, signal, visit }) {
  if (installer) {
    wireInstallBanner({ document, installer, preferences, sound, signal });
  }
  const support = wireSupportBanner({ document, preferences, sound, signal, now: visit.now });
  support.offer(visit.cameFromGame);
}

export function bootHome({
  document,
  fetch,
  navigate,
  gamepads,
  storage,
  createAudioContext,
  installer,
  visit = { cameFromGame: false, now: () => Date.now() },
}) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const store = storage ?? createMemoryStorage();
  const preferences = createPreferences(store);
  const appearance = createAppearance({ document, storage: store, signal });
  const sound = createSoundPlayer({
    createContext: createAudioContext ?? (() => null),
    isEnabled: preferences.isSoundOn,
  });
  const view = createHomeView(document);
  const { home } = view.elements;
  const launcher = createLauncher({ document, home, findSource: view.findLaunchSource, navigate });
  const loadGames = () => fetchCatalog(fetch);
  const controller = createHomeController({ view, loadGames, launcher, preferences, sound });
  const sheet = createDetailsSheet({ document, sound, signal });
  const settings = { preferences, sound, appearance };
  wireInputs({ document, view, controller, sheet, gamepads, settings, signal });
  watchReturns({ document, launcher, controller, sound, signal });
  wireBanners({ document, installer, preferences, sound, signal, visit });
  return {
    controller,
    launcher,
    sheet,
    preferences,
    appearance,
    ready: controller.load(),
    stop: () => lifetime.abort(),
  };
}
