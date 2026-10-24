export const STORAGE_KEYS = {
  favorites: 'arcade.favorites',
  recent: 'arcade.recent',
  sound: 'arcade.sound',
  installDismissedAt: 'arcade.install-dismissed',
  plays: 'arcade.plays',
  supportSnoozedUntil: 'arcade.support-snoozed-until',
  gaveAt: 'arcade.gave-at',
};
export const RECENT_LIMIT = 12;

const isIdList = (value) => Array.isArray(value) && value.every((id) => typeof id === 'string');
const numberOr = (value, fallback) => (Number.isFinite(value) ? value : fallback);

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
    supportSnoozedUntil: numberOr(storage.read(STORAGE_KEYS.supportSnoozedUntil), null),
    gaveAt: numberOr(storage.read(STORAGE_KEYS.gaveAt), null),
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
    supportSnoozedUntil: () => state.supportSnoozedUntil,
    snoozeSupport: (until) => save('supportSnoozedUntil', until),
    hasGiven: () => state.gaveAt !== null,
    recordGift: (time) => save('gaveAt', time),
  };
}
