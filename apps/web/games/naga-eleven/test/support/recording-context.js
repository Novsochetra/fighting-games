// a 2D context that keeps every call and every style set on it, for tests to read back
export function createRecordingContext() {
  const calls = [];
  const state = {};

  const context = new Proxy(state, {
    get(target, name) {
      if (name in target) {
        return target[name];
      }

      return (...args) => {
        calls.push({ name, args });
      };
    },
    set(target, name, value) {
      target[name] = value;
      calls.push({ name, args: [value] });

      return true;
    },
  });

  return { context, calls };
}
