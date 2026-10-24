import { fetchCatalog } from './catalog-client.js';
import { createDetailsSheet } from './details-sheet.js';
import { createHomeController } from './home-controller.js';
import { createHomeView } from './home-view.js';
import { createLauncher } from './launcher.js';
import { createMemoryStorage, createPreferences } from './preferences.js';
import { createSoundPlayer } from './sound-player.js';
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

export function bootHome({ document, fetch, navigate, gamepads, storage, createAudioContext }) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const preferences = createPreferences(storage ?? createMemoryStorage());
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
  const settings = { preferences, sound };
  wireInputs({ document, view, controller, sheet, gamepads, settings, signal });
  watchReturns({ document, launcher, controller, sound, signal });
  return {
    controller,
    launcher,
    sheet,
    preferences,
    ready: controller.load(),
    stop: () => lifetime.abort(),
  };
}
