const param = () => ({
  value: 0,
  setValueAtTime() {},
  exponentialRampToValueAtTime() {},
});

// a Web Audio context that only remembers each oscillator started on it
export function fakeAudioContext() {
  const context = {
    currentTime: 0,
    state: 'running',
    destination: {},
    started: [],
    resume: () => Promise.resolve(),
    suspend: () => Promise.resolve(),
    createGain: () => ({ gain: param(), connect() {} }),
    createOscillator() {
      const oscillator = {
        type: 'sine',
        frequency: {
          ...param(),
          setValueAtTime(hertz) {
            oscillator.hertz = hertz;
          },
        },
        connect() {},
        start(at) {
          context.started.push({ wave: oscillator.type, hertz: oscillator.hertz, at });
        },
        stop() {},
      };

      return oscillator;
    },
  };

  return context;
}

// timers that fire only when the test says so
export function fakeTimers() {
  const timers = { callback: null, cleared: 0 };

  return {
    timers,
    setInterval(callback) {
      timers.callback = callback;

      return 1;
    },
    clearInterval() {
      timers.cleared += 1;
      timers.callback = null;
    },
  };
}
