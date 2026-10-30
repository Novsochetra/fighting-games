import { notifyManager } from '@tanstack/react-query';
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { ArcadeProvider, createArcade, type ArcadePorts } from '@/services/arcade-context';
import { App } from '@/App';
import { renderScreen } from '@/screens/render-screen';
import { createMemoryStorage } from '@/services/preferences.js';

export interface ArcadeOptions extends Partial<Omit<ArcadePorts, 'window' | 'root'>> {
  // where the tab opens, under the arcade at the test page's root
  path?: string;
}

const lifetimes: AbortController[] = [];

// The queries tell React on a timer, which tests that fake the clock would hold back.
notifyManager.setScheduler((callback) => queueMicrotask(callback));

const noFetch = vi.fn(async () => {
  throw new TypeError('This test hands the arcade no fetch');
});

// The arcade's services, with fakes for what they take from the browser, at a tab opened at path.
function fakeArcade({ path = '/', ...given }: ArcadeOptions) {
  const ports = Object.fromEntries(
    Object.entries(given).filter(([, value]) => value !== undefined),
  );
  const lifetime = new AbortController();

  window.history.replaceState(null, '', path);
  const root = new URL('/', window.location.href);
  const arcade = createArcade(
    {
      window,
      fetch: noFetch,
      storage: createMemoryStorage(),
      createAudioContext: () => null,
      locale: 'en-US',
      root,
      navigate: vi.fn(),
      reload: vi.fn(),
      referrer: '',
      now: () => Date.now(),
      ...ports,
    },
    lifetime.signal,
  );

  lifetimes.push(lifetime);

  return { arcade, root };
}

// The whole arcade as a page renders it (main.tsx).
export function renderArcade(options: ArcadeOptions = {}) {
  const { arcade, root } = fakeArcade(options);
  const view = render(<App arcade={arcade} basename="/" renderScreen={renderScreen} />);

  return { arcade, root, ...view };
}

// One part of a screen, with the arcade's services around it.
export function renderInArcade(part: ReactNode, options: ArcadeOptions = {}) {
  const { arcade, root } = fakeArcade(options);
  const view = render(<ArcadeProvider arcade={arcade}>{part}</ArcadeProvider>);

  return { arcade, root, ...view };
}

export function unmountArcade() {
  cleanup();
  lifetimes.splice(0).forEach((lifetime) => lifetime.abort());
  window.history.replaceState(null, '', '/');
}

// Waits as vi.waitFor does, which goes on with a faked clock, where Testing Library's waitFor would
// wait on the clock; React draws meanwhile as on a page, as it does inside waitFor.
export async function waitUntil(check: () => void, options?: Parameters<typeof vi.waitFor>[1]) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const wasActing = scope.IS_REACT_ACT_ENVIRONMENT;

  scope.IS_REACT_ACT_ENVIRONMENT = false;

  try {
    await vi.waitFor(check, options);
  } finally {
    scope.IS_REACT_ACT_ENVIRONMENT = wasActing;
  }
}
