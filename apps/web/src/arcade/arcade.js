import { bootCredits } from '../credits/boot.js';
import { createAppearance } from '../home/appearance.js';
import { bootHome } from '../home/boot.js';
import { createMemoryStorage, createPreferences } from '../home/preferences.js';
import { createSoundPlayer } from '../home/sound-player.js';
import { bootSupporters } from '../supporters/boot.js';
import { arcadeRoot, SCREENS, screenUrl } from './routes.js';
import { createRouter } from './router.js';
import { createScreen } from './screen.js';

// The Support banner and the coffee sheet's KHQR choice lead to the supporters with #give.
const GIVE = '#give';

function screenBoots({ document, ports, shared, isShowing }) {
  const { fetch, storage, createAudioContext, home, locale } = ports;
  const visit = { now: () => Date.now() };

  return {
    home: {
      boot: () =>
        bootHome({
          document,
          fetch,
          storage,
          createAudioContext,
          ...home,
          visit,
          shared: { ...shared, isShowing: () => isShowing('home') },
        }),
    },
    supporters: {
      boot: () =>
        bootSupporters({ document, fetch, storage, createAudioContext, locale, visit, shared }),
      onShow: (page, { hash }) => {
        if (hash === GIVE) {
          page.donate.open();
        }
      },
    },
    credits: { boot: () => bootCredits({ document, storage, shared }) },
  };
}

// The arcade, its supporters and its credits as one page: whichever the visitor opened is in the
// document, and the others come in from their own pages once the browser is idle, so a tap between
// them changes the screen at once. They share one appearance and one sound.
export function startArcade({ window, ...ports }) {
  const { document } = window;
  const storage = ports.storage ?? createMemoryStorage();
  const startId = document.querySelector('[data-screen]').dataset.screen;
  const root = arcadeRoot(new URL(window.location.href), startId);
  const preferences = createPreferences(storage);
  const lifetime = new AbortController();
  const shared = {
    appearance: createAppearance({ document, storage, signal: lifetime.signal }),
    sound: createSoundPlayer({
      createContext: ports.createAudioContext ?? (() => null),
      isEnabled: preferences.isSoundOn,
    }),
  };
  let router = null;
  const isShowing = (id) => (router ? router.current() : startId) === id;
  const boots = screenBoots({ document, ports: { ...ports, storage }, shared, isShowing });
  const screens = new Map(
    SCREENS.map(({ id }) => [
      id,
      createScreen({ document, fetch: ports.fetch, id, url: screenUrl(root, id), ...boots[id] }),
    ]),
  );

  const referrer = ports.referrer ?? document.referrer;

  router = createRouter({ window, screens, root, startId, referrer });
  router.start();

  const stop = () => {
    router.stop();
    lifetime.abort();
    screens.forEach((screen) => screen.page?.stop?.());
  };

  return { router, screens, shared, stop };
}
