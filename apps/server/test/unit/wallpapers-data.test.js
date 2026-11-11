import { describe, expect, it } from 'vitest';
import { createMemoryWallpapersStore } from '../../src/wallpapers/memory-store.js';
import { readDownload, readLike } from '../../src/wallpapers/read-wallpaper-acts.js';

const IDS = new Set(['kulen-night', 'entry-sunset']);
const VISITOR = '3f2b8c1e-4a5d-4e6f-8a9b-0c1d2e3f4a5b';
const OTHER = 'a1b2c3d4-e5f6-4a7b-9c8d-e9f0a1b2c3d4';

describe('readLike', () => {
  it('takes a like or its taking back from a visitor, on a wallpaper the arcade has', () => {
    expect(readLike({ wallpaper: 'kulen-night', visitor: VISITOR, liked: true }, IDS)).toEqual({
      like: { wallpaper: 'kulen-night', visitor: VISITOR, liked: true },
    });
    expect(
      readLike({ wallpaper: 'kulen-night', visitor: VISITOR, liked: false }, IDS).like.liked,
    ).toBe(false);
  });

  it('turns away a wallpaper the arcade does not have', () => {
    expect(readLike({ wallpaper: 'nope', visitor: VISITOR, liked: true }, IDS).error).toMatch(
      /wallpaper/,
    );
    expect(readLike(null, IDS).error).toMatch(/wallpaper/);
  });

  it('needs a visitor id as a browser makes it, and a yes or no', () => {
    const like = (fields) => readLike({ wallpaper: 'kulen-night', liked: true, ...fields }, IDS);

    expect(like({ visitor: 'me' }).error).toMatch(/visitor/);
    expect(like({ visitor: VISITOR.toUpperCase() }).error).toMatch(/visitor/);
    expect(like({ visitor: VISITOR, liked: 'yes' }).error).toMatch(/liked/);
  });
});

describe('readDownload', () => {
  it('takes a download of a wallpaper for a phone or a desktop, and nothing else', () => {
    expect(readDownload({ wallpaper: 'entry-sunset', shape: 'phone' }, IDS)).toEqual({
      download: { wallpaper: 'entry-sunset', shape: 'phone' },
    });
    expect(readDownload({ wallpaper: 'entry-sunset', shape: 'tablet' }, IDS).error).toMatch(
      /phone/,
    );
    expect(readDownload({ wallpaper: 'x', shape: 'phone' }, IDS).error).toMatch(/wallpaper/);
  });
});

describe('the in-memory wallpapers store', () => {
  it('counts a visitor’s like once, and takes back only their own', async () => {
    const store = createMemoryWallpapersStore();
    const like = (visitor, liked) => store.setLike({ wallpaper: 'kulen-night', visitor, liked });

    expect(await like(VISITOR, true)).toBe(1);
    expect(await like(VISITOR, true)).toBe(1);
    expect(await like(OTHER, true)).toBe(2);
    expect(await like(VISITOR, false)).toBe(1);
    expect(await like(VISITOR, false)).toBe(1);
  });

  it('counts every download, and lists the wallpapers that have any', async () => {
    const store = createMemoryWallpapersStore();

    await store.addDownload({ wallpaper: 'entry-sunset', shape: 'phone' });
    expect(await store.addDownload({ wallpaper: 'entry-sunset', shape: 'desktop' })).toBe(2);
    await store.setLike({ wallpaper: 'kulen-night', visitor: VISITOR, liked: true });

    expect(await store.counts()).toEqual(
      expect.arrayContaining([
        { wallpaper: 'entry-sunset', likes: 0, downloads: 2 },
        { wallpaper: 'kulen-night', likes: 1, downloads: 0 },
      ]),
    );
  });
});
