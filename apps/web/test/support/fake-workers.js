import { vi } from 'vitest';

// A browser's workers as the arcade's update check sees them: one registration, whose update finds
// the deploy's build (when there is one) and installs it, until the test has it take over or fail.
export function createFakeWorkers({ hasNewBuild = true } = {}) {
  const incoming = Object.assign(new EventTarget(), { state: 'installing' });
  const registration = {
    installing: null,
    waiting: null,
    update: vi.fn(async () => {
      if (hasNewBuild) {
        registration.installing = incoming;
      }
    }),
  };

  return {
    workers: { getRegistration: vi.fn(async () => registration) },
    registration,
    // the new build all in and its worker in charge ('activated'), or given up ('redundant')
    settle(state = 'activated') {
      incoming.state = state;
      registration.installing = null;
      incoming.dispatchEvent(new Event('statechange'));
    },
  };
}

// The server's version.json, as it answers for the build it holds.
export const servedAs = (version) =>
  vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ version }) }));
