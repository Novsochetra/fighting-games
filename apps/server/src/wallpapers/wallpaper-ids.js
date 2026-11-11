import { readFile } from 'node:fs/promises';

async function readIds(listFile) {
  const { wallpapers } = JSON.parse(await readFile(listFile, 'utf8'));

  return new Set(wallpapers.map((wallpaper) => wallpaper.id));
}

// the wallpapers change only with a deploy, so their list is read once, as it is first needed; a
// failed read is tried again next time
export function createWallpaperIds(listFile) {
  let ids = null;

  return function wallpaperIds() {
    ids ??= readIds(listFile).catch((error) => {
      ids = null;
      throw error;
    });

    return ids;
  };
}
