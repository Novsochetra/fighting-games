export function createMemoryWallpapersStore() {
  const likes = new Map();
  const downloads = new Map();
  const likersOf = (wallpaper) => likes.get(wallpaper) ?? new Set();

  return {
    async counts() {
      const ids = new Set([...likes.keys(), ...downloads.keys()]);

      return [...ids].map((wallpaper) => ({
        wallpaper,
        likes: likersOf(wallpaper).size,
        downloads: downloads.get(wallpaper) ?? 0,
      }));
    },

    async setLike({ wallpaper, visitor, liked }) {
      const likers = likersOf(wallpaper);

      if (liked) {
        likers.add(visitor);
      } else {
        likers.delete(visitor);
      }

      likes.set(wallpaper, likers);

      return likers.size;
    },

    async addDownload({ wallpaper }) {
      downloads.set(wallpaper, (downloads.get(wallpaper) ?? 0) + 1);

      return downloads.get(wallpaper);
    },

    async ping() {},
  };
}
