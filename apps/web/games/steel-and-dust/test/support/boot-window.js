const nextDue = (timers, until) =>
  [...timers]
    .filter(([, timer]) => timer.at <= until)
    .sort(([, first], [, second]) => first.at - second.at)[0];

// a window the boot runs in: an address it can reload, events, and timers that run only when the
// test moves the clock on, in the order they fall due, with the browser's report of each file in
function fakeClock(window) {
  let now = 0;
  const timers = new Map();
  let nextId = 1;
  window.setTimeout = (callback, ms) => {
    timers.set(nextId, { at: now + ms, callback });
    return nextId++;
  };
  window.clearTimeout = (id) => timers.delete(id);
  window.advance = (ms) => {
    const until = now + ms;
    for (let due = nextDue(timers, until); due; due = nextDue(timers, until)) {
      const [id, timer] = due;
      timers.delete(id);
      now = timer.at;
      timer.callback();
    }
    now = until;
  };
  window.PerformanceObserver = class {
    constructor(callback) {
      window.fileIn = () => this.watching && callback();
    }

    observe() {
      this.watching = true;
    }

    disconnect() {
      this.watching = false;
    }
  };
}

export function fakeBootWindow(href) {
  const listeners = new Map();
  const window = {
    replaced: [],
    rewritten: [],
    location: {
      href,
      replace: (url) => window.replaced.push(url),
    },
    history: {
      state: { kept: true },
      replaceState: (state, title, url) => {
        window.rewritten.push({ state, url });
        window.location.href = url;
      },
    },
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type, listener) => {
      if (listeners.get(type) === listener) {
        listeners.delete(type);
      }
    },
    // an exception reaches the window itself; a file that fails fires at its own element
    fire: (type, target = window) => listeners.get(type)?.({ type, target }),
  };
  fakeClock(window);
  return window;
}
