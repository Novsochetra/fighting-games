import { createContext, use, type ReactNode } from 'react';
import { createAnalytics, type AnalyticsSetup } from './analytics/analytics';
import { createAppearance } from './appearance/appearance.js';
import { createPreferences } from './preferences.js';
import { createSoundPlayer } from './sound/sound-player.js';
import { createUpdateCheck } from './updates/update-check.js';

// Where the arcade keeps its preferences (preferences.js): localStorage, or memory where it is refused.
export interface ArcadeStorage {
  read: (key: string) => unknown;
  write: (key: string, value: unknown) => unknown;
}

// What the arcade needs from the browser, passed in so the tests can hand it fakes.
export interface ArcadePorts {
  window: Window;
  fetch: typeof fetch;
  storage: ArcadeStorage;
  createAudioContext: () => AudioContext | null;
  locale: string;
  // the arcade's own address, which every address in a screen resolves against: a screen shows
  // under another screen's address, so a relative one would resolve against the wrong folder
  root: URL;
  // a game opens with a load of its own page
  navigate: (href: string) => void;
  // a load of the page, into the newest build once its worker has taken over (update-check.js)
  reload: () => void;
  // the version of the build this page comes from (arcade-version.js), none on the dev server
  version?: string | null;
  // where the arcade's worker is registered, in a browser that has workers
  workers?: ServiceWorkerContainer;
  referrer: string;
  // the clock the arcade's reminders count from
  now: () => number;
  gamepads?: {
    events: EventTarget;
    getGamepads: () => (Gamepad | null)[];
    requestFrame: (callback: FrameRequestCallback) => number;
  };
  installer?: Installer;
  // Google's tag, which loads only on the live arcade and once the visitor says yes (analytics.js)
  analyticsTag?: AnalyticsSetup;
}

export interface Installer {
  events: EventTarget;
  isIos: boolean;
  isInstalled: () => boolean;
  now: () => number;
}

export interface Arcade extends ArcadePorts {
  preferences: ReturnType<typeof createPreferences>;
  analytics: ReturnType<typeof createAnalytics>;
  appearance: ReturnType<typeof createAppearance>;
  sound: ReturnType<typeof createSoundPlayer>;
  updates: ReturnType<typeof createUpdateCheck>;
}

const ArcadeContext = createContext<Arcade | null>(null);

// One appearance, one sound, one count of visits and one check for a new build for every screen,
// made once for the page (main.tsx), outside React, whose development checks run effects twice and
// would stop a listener made in one.
export function createArcade(ports: ArcadePorts, signal?: AbortSignal): Arcade {
  const preferences = createPreferences(ports.storage);

  return {
    ...ports,
    preferences,
    analytics: createAnalytics({ ...ports.analyticsTag, storage: ports.storage }),
    appearance: createAppearance({
      document: ports.window.document,
      storage: ports.storage,
      signal,
    }),
    sound: createSoundPlayer({
      createContext: ports.createAudioContext,
      isEnabled: preferences.isSoundOn,
    }),
    updates: createUpdateCheck({
      version: ports.version ?? null,
      fetch: ports.fetch,
      root: ports.root,
      workers: ports.workers,
      document: ports.window.document,
      signal,
    }),
  };
}

export function ArcadeProvider({ arcade, children }: { arcade: Arcade; children: ReactNode }) {
  return <ArcadeContext value={arcade}>{children}</ArcadeContext>;
}

// An address under the arcade, as a screen uses it in a link, an image or a request.
export function useArcadeUrl(): (path: string) => string {
  const { root } = useArcade();

  return (path) => new URL(path, root).href;
}

export function useArcade(): Arcade {
  const arcade = use(ArcadeContext);

  if (!arcade) {
    throw new Error('useArcade needs an ArcadeProvider above it');
  }

  return arcade;
}
