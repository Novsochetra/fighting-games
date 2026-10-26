// @vitest-environment happy-dom
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBannerClasses } from '../../support/fake-analytics.js';
import { createFakeWorkers } from '../../support/fake-workers.js';
import {
  boot,
  byId,
  click,
  jsonReply,
  realCatalogJson,
  stopHomes,
  waitUntil,
} from '../../support/home-harness.js';

// Bug: after a deploy, an arcade left open, or opened from what its worker keeps (as an installed
// one on a phone is), went on running the build it had. The worker fetched the new build only on a
// load, and a load before it had taken over opened the old build again: a player saw a deploy only
// after two loads, and an installed arcade that a phone brought back without loading it, after days.
// Now each page names its build, the arcade asks the server for its own as it opens and each time it
// is shown again, and offers Reload once the worker holding the new build has taken over.
const server = { version: 'v1' };

async function serverFetch() {
  const catalog = await realCatalogJson();

  return vi.fn(async (url) =>
    new URL(url, window.location.href).pathname === '/version.json'
      ? jsonReply(JSON.stringify({ version: server.version }))
      : jsonReply(catalog),
  );
}

function showAgain() {
  act(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

beforeEach(() => {
  document.body.innerHTML = '';
  clearBannerClasses();
  server.version = 'v1';
});

afterEach(stopHomes);

describe('an arcade left open across a deploy', () => {
  it('learns of it when shown again, and offers Reload only once the new build has taken over', async () => {
    const { workers, registration, settle } = createFakeWorkers();
    const reload = vi.fn();
    const fetchFn = await serverFetch();

    await boot(fetchFn, { version: 'v1', workers, reload });
    await waitUntil(() =>
      expect(fetchFn.mock.calls.some(([url]) => url.endsWith('/version.json'))).toBe(true),
    );
    // the check as the arcade opened finishes before the phone hides and shows it again
    await new Promise((resolve) => setTimeout(resolve));
    expect(byId('update').hidden).toBe(true);

    server.version = 'v2';
    showAgain();
    await waitUntil(() => expect(registration.installing).not.toBeNull());
    expect(byId('update').hidden).toBe(true);

    settle('activated');
    await waitUntil(() => expect(byId('update').hidden).toBe(false));
    click(byId('update-reload'));
    expect(reload).toHaveBeenCalledOnce();
  });
});
