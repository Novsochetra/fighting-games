import { describe, expect, it, vi } from 'vitest';
import { createUpdateCheck } from '@/services/updates/update-check.js';
import { createFakeWorkers, servedAs } from '../../../support/fake-workers.js';

const ROOT = new URL('https://arcade.test/');

// The page's document, as far as the check sees it: whether it is shown, and when that changes.
function createPage(visibilityState = 'visible') {
  return Object.assign(new EventTarget(), { visibilityState });
}

// A check in flight lets the page be shown again without asking twice; this waits it out.
const checked = () => new Promise((resolve) => setTimeout(resolve));

function turn(page, visibilityState) {
  page.visibilityState = visibilityState;
  page.dispatchEvent(new Event('visibilitychange'));
}

function startCheck({ version = 'old', fetch = servedAs('old'), page = createPage(), ...rest }) {
  const fakes = createFakeWorkers();
  const check = createUpdateCheck({
    version,
    fetch,
    root: ROOT,
    workers: fakes.workers,
    document: page,
    ...rest,
  });

  return { check, fetch, page, ...fakes };
}

describe('createUpdateCheck', () => {
  it('asks as the arcade opens, and is ready once a newer build has taken over', async () => {
    const { check, registration, settle } = startCheck({ fetch: servedAs('new') });
    const listener = vi.fn();

    check.subscribe(listener);
    await vi.waitFor(() => expect(registration.installing).not.toBeNull());
    expect(check.isReady()).toBe(false);

    settle('activated');
    await vi.waitFor(() => expect(check.isReady()).toBe(true));
    expect(listener).toHaveBeenCalledOnce();
  });

  it('stays as it is while the server holds the build the page runs', async () => {
    const { check, fetch, workers } = startCheck({});

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(workers.getRegistration).not.toHaveBeenCalled();
    expect(check.isReady()).toBe(false);
  });

  it('asks again each time the arcade is shown, as a phone brings an installed one back', async () => {
    const page = createPage('hidden');
    const fetch = servedAs('old');
    const { check, settle } = startCheck({ page, fetch });

    expect(fetch).not.toHaveBeenCalled();
    turn(page, 'visible');
    await checked();
    expect(fetch).toHaveBeenCalledOnce();

    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ version: 'new' }) });
    turn(page, 'hidden');
    turn(page, 'visible');
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    settle('activated');
    await vi.waitFor(() => expect(check.isReady()).toBe(true));
  });

  it('asks one at a time, and stops asking once it is ready', async () => {
    const { check, fetch, page, settle } = startCheck({ fetch: servedAs('new') });

    turn(page, 'visible');
    turn(page, 'visible');
    settle('activated');
    await vi.waitFor(() => expect(check.isReady()).toBe(true));
    turn(page, 'visible');
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('is not ready when the new build failed to come down, and asks again when shown', async () => {
    const { check, fetch, page, registration, settle } = startCheck({ fetch: servedAs('new') });

    await vi.waitFor(() => expect(registration.installing).not.toBeNull());
    settle('redundant');
    await checked();
    turn(page, 'visible');
    await checked();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(check.isReady()).toBe(false);
  });

  it('never asks from a page with no version, as on the dev server', () => {
    const { fetch, page } = startCheck({ version: null });

    turn(page, 'visible');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('stops listening once the arcade’s lifetime ends', async () => {
    const lifetime = new AbortController();
    const { fetch, page } = startCheck({ signal: lifetime.signal });

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    lifetime.abort();
    turn(page, 'visible');
    expect(fetch).toHaveBeenCalledOnce();
  });
});
