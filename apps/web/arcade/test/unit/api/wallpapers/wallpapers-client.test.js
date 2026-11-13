import { describe, expect, it, vi } from 'vitest';
import {
  fetchWallpaperCounts,
  postDownload,
  postLike,
  readWallpaperCounts,
} from '@/api/wallpapers/wallpapers-client.js';

const answer = (json, status = 200) => new Response(JSON.stringify(json), { status });

describe('readWallpaperCounts', () => {
  it('reads each wallpaper’s likes and downloads, and nothing but whole counts', () => {
    const counts = readWallpaperCounts({
      wallpapers: {
        'kulen-night': { likes: 3, downloads: 12 },
        'entry-sunset': { likes: -1, downloads: '9' },
      },
    });

    expect(counts).toEqual({
      'kulen-night': { likes: 3, downloads: 12 },
      'entry-sunset': { likes: 0, downloads: 0 },
    });
  });

  it('fails on an answer that is not a set of counts', () => {
    expect(() => readWallpaperCounts({ wallpapers: [] })).toThrow(/counts/);
    expect(() => readWallpaperCounts(null)).toThrow(/counts/);
  });
});

describe('fetchWallpaperCounts', () => {
  it('reads the counts from the address', async () => {
    const fetchFile = vi.fn(async () => answer({ wallpapers: { a: { likes: 1, downloads: 2 } } }));

    expect(await fetchWallpaperCounts(fetchFile, '/api/wallpapers')).toEqual({
      a: { likes: 1, downloads: 2 },
    });
  });

  it('fails when the server does', async () => {
    await expect(fetchWallpaperCounts(async () => answer({}, 503), '/api/w')).rejects.toThrow(
      /503/,
    );
  });
});

describe('postLike and postDownload', () => {
  it('send the act as JSON and answer the count the server now holds', async () => {
    const fetchFile = vi.fn(async () => answer({ likes: 7, downloads: 40 }));
    const like = { wallpaper: 'a', visitor: 'v', liked: true };

    expect(await postLike(fetchFile, '/likes', like)).toBe(7);
    expect(await postDownload(fetchFile, '/downloads', { wallpaper: 'a', shape: 'phone' })).toBe(
      40,
    );

    const [url, options] = fetchFile.mock.calls[0];
    expect(url).toBe('/likes');
    expect(options).toMatchObject({ method: 'POST' });
    expect(JSON.parse(options.body)).toEqual(like);
  });

  it('fail with the server’s own words, or a plain one when the network is gone', async () => {
    const busy = async () => answer({ error: 'That is a lot at once.' }, 429);
    const offline = async () => Promise.reject(new TypeError('Failed to fetch'));

    await expect(postLike(busy, '/likes', {})).rejects.toThrow('That is a lot at once.');
    await expect(postLike(offline, '/likes', {})).rejects.toThrow(/connection/);
  });
});
