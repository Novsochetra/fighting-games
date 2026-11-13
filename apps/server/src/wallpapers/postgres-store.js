const COUNT_LIKES = 'SELECT wallpaper, count(*) AS total FROM wallpaper_likes GROUP BY wallpaper';
const COUNT_DOWNLOADS =
  'SELECT wallpaper, count(*) AS total FROM wallpaper_downloads GROUP BY wallpaper';
const LIKE = `INSERT INTO wallpaper_likes (wallpaper, visitor) VALUES ($1, $2)
  ON CONFLICT (wallpaper, visitor) DO NOTHING`;
const UNLIKE = 'DELETE FROM wallpaper_likes WHERE wallpaper = $1 AND visitor = $2';
const LIKES_OF = 'SELECT count(*) AS total FROM wallpaper_likes WHERE wallpaper = $1';
const DOWNLOAD = 'INSERT INTO wallpaper_downloads (wallpaper, shape) VALUES ($1, $2)';
const DOWNLOADS_OF = 'SELECT count(*) AS total FROM wallpaper_downloads WHERE wallpaper = $1';
// Reads both tables, so a database the pre-deploy never migrated fails the health check.
const PING = ['SELECT 1 FROM wallpaper_likes LIMIT 1', 'SELECT 1 FROM wallpaper_downloads LIMIT 1'];

const totalsOf = (rows) => new Map(rows.map((row) => [row.wallpaper, Number(row.total)]));

export function createPostgresWallpapersStore(database) {
  const totalOf = async (query, wallpaper) =>
    Number((await database.query(query, [wallpaper])).rows[0].total);

  return {
    async counts() {
      const likes = totalsOf((await database.query(COUNT_LIKES)).rows);
      const downloads = totalsOf((await database.query(COUNT_DOWNLOADS)).rows);
      const ids = new Set([...likes.keys(), ...downloads.keys()]);

      return [...ids].map((wallpaper) => ({
        wallpaper,
        likes: likes.get(wallpaper) ?? 0,
        downloads: downloads.get(wallpaper) ?? 0,
      }));
    },

    async setLike({ wallpaper, visitor, liked }) {
      await database.query(liked ? LIKE : UNLIKE, [wallpaper, visitor]);

      return totalOf(LIKES_OF, wallpaper);
    },

    async addDownload({ wallpaper, shape }) {
      await database.query(DOWNLOAD, [wallpaper, shape]);

      return totalOf(DOWNLOADS_OF, wallpaper);
    },

    async ping() {
      await Promise.all(PING.map((query) => database.query(query)));
    },
  };
}
