export const STORAGE_KEYS = {
  favorites: 'arcade.favorites',
  recent: 'arcade.recent',
  sound: 'arcade.sound',
  installDismissedAt: 'arcade.install-dismissed',
  plays: 'arcade.plays',
  supportSnoozedUntil: 'arcade.support-snoozed-until',
  supportSeenPlays: 'arcade.support-seen-plays',
  gaveAt: 'arcade.gave-at',
  likedWallpapers: 'arcade.liked-wallpapers',
  wallpaperVisitor: 'arcade.wallpaper-visitor',
};
export const RECENT_LIMIT = 12;

const isIdList = (value) => Array.isArray(value) && value.every((id) => typeof id === 'string');
const numberOr = (value, fallback) => (Number.isFinite(value) ? value : fallback);
const textOr = (value, fallback) => (typeof value === 'string' && value ? value : fallback);

export function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id];
}

export function pushRecent(ids, id, limit = RECENT_LIMIT) {
  return [id, ...ids.filter((other) => other !== id)].slice(0, limit);
}

// Private windows and blocked site data make localStorage throw or forget; the arcade then simply
// starts fresh on every visit.
export function createBrowserStorage(window) {
  return {
    read(key) {
      try {
        return JSON.parse(window.localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Nothing to do: the choice still holds until the page closes.
      }
    },
  };
}

export const createMemoryStorage = () => {
  const values = new Map();
  return { read: (key) => values.get(key) ?? null, write: (key, value) => values.set(key, value) };
};

const readSupportState = (storage) => ({
  supportSnoozedUntil: numberOr(storage.read(STORAGE_KEYS.supportSnoozedUntil), null),
  supportSeenPlays: numberOr(storage.read(STORAGE_KEYS.supportSeenPlays), null),
});

// What the support banner keeps: when it may ask again, the plays it last saw, and a gift. The gift
// is made on the supporters page, another document, so it is read afresh each time: an arcade brought
// back from the back/forward cache still holds everything else as it read it on its first load.
const supportPreferences = ({ state, save, storage }) => ({
  supportSnoozedUntil: () => state.supportSnoozedUntil,
  snoozeSupport: (until) => save('supportSnoozedUntil', until),
  supportSeenPlays: () => state.supportSeenPlays,
  markSupportSeen: (count) => save('supportSeenPlays', count),
  hasGiven: () => numberOr(storage.read(STORAGE_KEYS.gaveAt), null) !== null,
  recordGift: (time) => storage.write(STORAGE_KEYS.gaveAt, time),
});

// The wallpapers this device liked, and the random id its likes go under, made at its first like
// (makeId), so the server counts a like once and lets only its giver take it back.
const wallpaperPreferences = ({ state, save }) => ({
  isLikedWallpaper: (id) => state.likedWallpapers.includes(id),
  setLikedWallpaper: (id, liked) =>
    save(
      'likedWallpapers',
      liked === state.likedWallpapers.includes(id)
        ? state.likedWallpapers
        : toggleId(state.likedWallpapers, id),
    ),
  wallpaperVisitor(makeId) {
    if (!state.wallpaperVisitor) {
      save('wallpaperVisitor', makeId());
    }

    return state.wallpaperVisitor;
  },
});

export function createPreferences(storage) {
  const readIds = (key) => {
    const value = storage.read(key);
    return isIdList(value) ? value : [];
  };
  const state = {
    favorites: readIds(STORAGE_KEYS.favorites),
    recent: readIds(STORAGE_KEYS.recent),
    sound: storage.read(STORAGE_KEYS.sound) !== false,
    installDismissedAt: storage.read(STORAGE_KEYS.installDismissedAt),
    plays: numberOr(storage.read(STORAGE_KEYS.plays), 0),
    likedWallpapers: readIds(STORAGE_KEYS.likedWallpapers),
    wallpaperVisitor: textOr(storage.read(STORAGE_KEYS.wallpaperVisitor), null),
    ...readSupportState(storage),
  };
  const save = (name, value) => {
    state[name] = value;
    storage.write(STORAGE_KEYS[name], value);
  };
  return {
    favorites: () => state.favorites,
    recent: () => state.recent,
    isFavorite: (id) => state.favorites.includes(id),
    toggleFavorite: (id) => save('favorites', toggleId(state.favorites, id)),
    recordPlay: (id) => {
      save('recent', pushRecent(state.recent, id));
      save('plays', state.plays + 1);
    },
    // Players from before the count was kept have only their Recent list to show for it.
    playCount: () => Math.max(state.plays, state.recent.length),
    isSoundOn: () => state.sound,
    setSound: (isOn) => save('sound', Boolean(isOn)),
    installDismissedAt: () => state.installDismissedAt,
    dismissInstall: (time) => save('installDismissedAt', time),
    ...supportPreferences({ state, save, storage }),
    ...wallpaperPreferences({ state, save }),
  };
}
