// localStorage as far as the game uses it, kept in a map the test can read
export function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    data,
  };
}
