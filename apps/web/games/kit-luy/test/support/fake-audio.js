function param(value) {
  return {
    value,
    setValueAtTime(next) {
      this.value = next;
    },
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
  };
}

function node(kind, more) {
  return {
    kind,
    next: null,
    connect(next) {
      this.next = next;

      return next;
    },
    ...more,
  };
}

function filterAfter(started) {
  for (let at = started.next; at; at = at.next) {
    if (at.kind === 'filter') {
      return { type: at.type, frequency: at.frequency.value, q: at.Q.value };
    }
  }

  return null;
}

function source(started, kind, more) {
  const made = node(kind, {
    ...more,
    start(at = 0) {
      const frequency = made.frequency ? made.frequency.value : null;

      started.push({ kind, frequency, at, filter: filterAfter(made) });
    },
    stop() {},
  });

  return made;
}

export function fakeAudioContext() {
  const started = [];
  const context = {
    started,
    currentTime: 0,
    state: 'suspended',
    sampleRate: 8000,
    destination: node('destination'),
    createGain: () => node('gain', { gain: param(1) }),
    createBiquadFilter: () =>
      node('filter', { type: 'lowpass', frequency: param(350), Q: param(1) }),
    createOscillator: () => source(started, 'oscillator', { type: 'sine', frequency: param(440) }),
    createBufferSource: () => source(started, 'noise', { buffer: null }),
    createBuffer(channels, length) {
      const samples = new Float32Array(length);

      return { length, getChannelData: () => samples };
    },
    resume() {
      context.state = 'running';

      return Promise.resolve();
    },
    suspend() {
      context.state = 'suspended';

      return Promise.resolve();
    },
  };

  return context;
}
