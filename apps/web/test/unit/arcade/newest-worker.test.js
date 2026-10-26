import { describe, expect, it, vi } from 'vitest';
import { takeNewestWorker } from '../../../src/arcade/newest-worker.js';
import { createFakeWorkers } from '../../support/fake-workers.js';

const ROOT = new URL('https://arcade.test/');

describe('takeNewestWorker', () => {
  it('has the worker at the arcade’s root fetch the newest build, and waits for it to take over', async () => {
    const { workers, registration, settle } = createFakeWorkers();
    const taken = takeNewestWorker(workers, ROOT);

    await vi.waitFor(() => expect(registration.installing).not.toBeNull());
    expect(workers.getRegistration).toHaveBeenCalledWith('https://arcade.test/');
    settle('activated');
    expect(await taken).toBe(true);
  });

  it('has nothing to wait for once the browser has already put the newest build in charge', async () => {
    const { workers } = createFakeWorkers({ hasNewBuild: false });

    expect(await takeNewestWorker(workers, ROOT)).toBe(true);
  });

  it('leaves a reload to the server where no worker keeps the arcade', async () => {
    const unregistered = { getRegistration: async () => undefined };

    expect(await takeNewestWorker(undefined, ROOT)).toBe(true);
    expect(await takeNewestWorker(unregistered, ROOT)).toBe(true);
  });

  it('is not done when the download is cut short, or the worker can’t be reached', async () => {
    const cut = createFakeWorkers();
    const taken = takeNewestWorker(cut.workers, ROOT);
    const offline = createFakeWorkers();

    await vi.waitFor(() => expect(cut.registration.installing).not.toBeNull());
    cut.settle('redundant');
    offline.registration.update.mockRejectedValue(new TypeError('Failed to update'));

    expect(await taken).toBe(false);
    expect(await takeNewestWorker(offline.workers, ROOT)).toBe(false);
  });
});
