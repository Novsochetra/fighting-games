// @vitest-environment happy-dom
import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  arcadeFetch,
  screenOf,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../../support/arcade-harness.js';
import { waitUntil } from '../../../support/render-arcade.tsx';

const VERSION_4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const reply = (json, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => json,
});

// the server: these counts, and every like and download sent to it, answered as it would
function wallpapersServer({ failLikes = false } = {}) {
  const sent = [];
  const counts = { 'kulen-night': { likes: 4, downloads: 1200 } };
  const shared = arcadeFetch();
  const fetchFn = vi.fn(async (url, options = {}) => {
    const { pathname } = new URL(url, window.location.href);

    if (pathname === '/api/wallpapers') {
      return reply({ wallpapers: counts });
    }

    if (pathname === '/api/wallpapers/likes') {
      const like = JSON.parse(options.body);

      sent.push(like);

      return failLikes ? reply({ error: 'No.' }, 503) : reply({ likes: 4 + (like.liked ? 1 : 0) });
    }

    if (pathname === '/api/wallpapers/downloads') {
      sent.push(JSON.parse(options.body));

      return reply({ downloads: 1201 }, 201);
    }

    return shared(url, options);
  });

  return { fetchFn, sent };
}

const byId = (id) => document.getElementById(id);
const textOf = (id) => byId(id).textContent;

async function openKulen(server) {
  startArcadeAt('wallpapers', { fetch: server.fetchFn });
  await waitUntil(() =>
    expect(screenOf('wallpapers').querySelector('.wallpaper-tile__stats')).not.toBeNull(),
  );
  tap(screenOf('wallpapers').querySelector('[data-wallpaper="kulen-night"]'));
}

afterEach(() => {
  stopArcades();
  window.localStorage.clear();
});

describe('liking a wallpaper and counting its downloads', () => {
  it('shows each tile’s likes and downloads once the counts are in', async () => {
    await openKulen(wallpapersServer());
    const tile = screenOf('wallpapers').querySelector('[data-wallpaper="kulen-night"]');

    expect(tile.querySelector('.wallpaper-tile__stats').textContent).toBe('4 likes,1.2K downloads');
    expect(textOf('wallpaper-meta')).toBe('Night · 1,200 downloads');
  });

  it('likes at a tap, under a visitor id made for it, and takes the like back at another', async () => {
    const server = wallpapersServer();

    await openKulen(server);
    await act(async () => byId('wallpaper-like').click());
    await waitUntil(() => expect(server.sent).toHaveLength(1));

    expect(byId('wallpaper-like').getAttribute('aria-pressed')).toBe('true');
    expect(textOf('wallpaper-likes')).toBe('5');
    expect(server.sent[0]).toMatchObject({ wallpaper: 'kulen-night', liked: true });
    expect(server.sent[0].visitor).toMatch(VERSION_4);

    await act(async () => byId('wallpaper-like').click());
    await waitUntil(() => expect(server.sent).toHaveLength(2));
    expect(server.sent[1]).toEqual({ ...server.sent[0], liked: false });
    expect(byId('wallpaper-like').getAttribute('aria-pressed')).toBe('false');
  });

  it('takes the like back when it does not go through', async () => {
    const server = wallpapersServer({ failLikes: true });

    await openKulen(server);
    await act(async () => byId('wallpaper-like').click());
    await waitUntil(() =>
      expect(byId('wallpaper-like').getAttribute('aria-pressed')).toBe('false'),
    );
    expect(textOf('wallpaper-likes')).toBe('4');
  });

  it('counts a download as it is tapped', async () => {
    const server = wallpapersServer();

    await openKulen(server);
    byId('wallpaper-download').addEventListener('click', (event) => event.preventDefault());
    tap(byId('wallpaper-download'));
    await waitUntil(() => expect(server.sent).toHaveLength(1));

    expect(server.sent[0]).toEqual({ wallpaper: 'kulen-night', shape: 'desktop' });
    expect(textOf('wallpaper-meta')).toBe('Night · 1,201 downloads');
  });
});
