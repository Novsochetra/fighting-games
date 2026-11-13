import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from '../../src/db/migrate.js';
import { createPostgresWallpapersStore } from '../../src/wallpapers/postgres-store.js';
import { createPgliteDatabase } from '../support/pglite-database.js';

const VISITOR = '3f2b8c1e-4a5d-4e6f-8a9b-0c1d2e3f4a5b';
const OTHER = 'a1b2c3d4-e5f6-4a7b-9c8d-e9f0a1b2c3d4';

let database;

// a Postgres compiled to WebAssembly takes seconds to start while the whole suite runs
beforeEach(async () => {
  database = await createPgliteDatabase();
  await migrate(database);
}, 30000);

afterEach(() => database.close());

describe('the Postgres wallpapers store', () => {
  it('counts a visitor’s like once, and takes back only their own', async () => {
    const store = createPostgresWallpapersStore(database);
    const like = (visitor, liked) => store.setLike({ wallpaper: 'kulen-night', visitor, liked });

    expect(await like(VISITOR, true)).toBe(1);
    expect(await like(VISITOR, true)).toBe(1);
    expect(await like(OTHER, true)).toBe(2);
    expect(await like(VISITOR, false)).toBe(1);
  });

  it('counts every download, and lists each wallpaper with any', async () => {
    const store = createPostgresWallpapersStore(database);

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

  it('holds the shapes and ids in the tables too', async () => {
    const insert = (wallpaper, shape) =>
      database.query('INSERT INTO wallpaper_downloads (wallpaper, shape) VALUES ($1, $2)', [
        wallpaper,
        shape,
      ]);

    await expect(insert('kulen-night', 'tablet')).rejects.toThrow(/check/);
    await expect(insert('../etc', 'phone')).rejects.toThrow(/check/);
    await expect(insert('kulen-night', 'phone')).resolves.toBeDefined();
  });

  it('answers the health check once migrated', async () => {
    await expect(createPostgresWallpapersStore(database).ping()).resolves.toBeUndefined();
  });
});
