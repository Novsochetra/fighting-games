// storage can be missing or throw (private windows, blocked site data); the game then just
// forgets between visits
export function readJson(storage, key, fallback) {
  try {
    const text = storage.getItem(key);
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  return true;
}
