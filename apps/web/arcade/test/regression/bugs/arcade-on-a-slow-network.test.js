import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PAGES_ROOT } from '../../../../../server/src/paths.js';
import { NETWORK_LIMIT_MS } from '@/service-worker/api-cache.js';
import { pagesUnderTheArcade } from '../../support/arcade-pages.js';
import { SCOPE, server, startWorker, text } from '../../support/offline-worker.js';

// Bug: the arcade opened at once offline but took as long as the network did on a slow one (a
// phone's weak signal). Each page's head held its first paint, and the app's module with it, for a
// stylesheet from Google Fonts, which fails at once offline; and the worker read the games from the
// network first, so the home showed its spinner until the network answered. With 6 s answers the
// home took 12 s to show its games, against a tenth of a second offline.
const SUPPORTERS = '{"supporters":[{"name":"Dara"}]}';
const neverAnswers = () => new Promise(() => {});

const fromAnotherSite = (html) =>
  [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>|<script\b[^>]*\bsrc="[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => /\b(?:href|src)="(?:https?:)?\/\//.test(tag));

afterEach(() => {
  vi.useRealTimers();
});

describe('the arcade on a slow network', () => {
  it('draws each page without waiting for another site', async () => {
    const pages = [path.join(PAGES_ROOT, 'index.html'), ...(await pagesUnderTheArcade())];

    for (const page of pages) {
      const html = await readFile(page, 'utf8');

      expect({ page, tags: fromAnotherSite(html) }).toEqual({ page, tags: [] });
    }
  });

  it('lists the games it last read at once, while the network has not answered', async () => {
    const worker = await startWorker();

    worker.network.hold = neverAnswers();

    expect(await text(worker.answer('api/games').response)).toBe('{"games":[]}');
  });

  it('shows the supporters it last read once the network has kept them waiting', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const worker = await startWorker({ ...server(), [`${SCOPE}api/supporters`]: SUPPORTERS });

    worker.network.hold = neverAnswers();
    const { response } = worker.answer('api/supporters');

    await vi.advanceTimersByTimeAsync(NETWORK_LIMIT_MS);

    expect(await text(response)).toBe(SUPPORTERS);
  });
});
