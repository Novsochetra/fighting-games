export function createLru(limit) {
  const entries = new Map();

  return {
    get(key) {
      if (!entries.has(key)) {
        return undefined;
      }

      const value = entries.get(key);

      entries.delete(key);
      entries.set(key, value);

      return value;
    },

    set(key, value) {
      entries.set(key, value);

      if (entries.size > limit) {
        entries.delete(entries.keys().next().value);
      }
    },

    clear() {
      entries.clear();
    },

    get size() {
      return entries.size;
    },
  };
}
