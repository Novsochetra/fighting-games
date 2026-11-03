// A Web Audio context for Node: it builds no sound, but records every node, connection and
// automation, and throws where a browser throws (an exponential ramp to 0, a time that is not a
// number, a source started twice), so a cue that would fail in a browser fails here.

function checkTime(time) {
  if (!Number.isFinite(time) || time < 0) {
    throw new RangeError(`bad time ${time}`);
  }
}

function checkValue(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`bad value ${value}`);
  }
}

const approach = (target, value, from, time) =>
  target.value + (value - target.value) * Math.exp(-(time - from) / target.timeConstant);

const settled = ({ value, at, target }, time) =>
  target ? approach(target, value, at, time) : value;

function afterEvent(segment, event) {
  if (event.kind === 'target') {
    return { value: settled(segment, event.time), at: event.time, target: event };
  }

  return { value: event.value, at: event.time, target: null };
}

function withinSegment(segment, event, time) {
  const { value, at } = segment;
  const share = (time - at) / (event.time - at);

  if (event.kind === 'linear') {
    return value + (event.value - value) * share;
  }

  return event.kind === 'exponential'
    ? value * (event.value / value) ** share
    : settled(segment, time);
}

// the value the automation gives at `time`, near enough as a browser computes it
function valueAt(param, time) {
  let segment = { value: param.value, at: 0, target: null };

  for (const event of param.events) {
    if (event.time > time) {
      return withinSegment(segment, event, time);
    }

    segment = afterEvent(segment, event);
  }

  return settled(segment, time);
}

function fakeParam(value) {
  const param = { value, events: [] };
  const record = (kind, eventValue, time, extra) => {
    checkValue(eventValue);
    checkTime(time);
    param.events.push({ kind, value: eventValue, time, ...extra });

    if (param.events.length > 1 && param.events.at(-2).time > time) {
      param.events.sort((first, second) => first.time - second.time);
    }

    return param;
  };

  return Object.assign(param, {
    setValueAtTime: (eventValue, time) => record('set', eventValue, time),
    linearRampToValueAtTime: (eventValue, time) => record('linear', eventValue, time),
    exponentialRampToValueAtTime(eventValue, time) {
      if (eventValue <= 0) {
        throw new RangeError('an exponential ramp cannot reach 0');
      }

      return record('exponential', eventValue, time);
    },

    setTargetAtTime(eventValue, time, timeConstant) {
      if (!(timeConstant > 0)) {
        throw new RangeError(`bad time constant ${timeConstant}`);
      }

      return record('target', eventValue, time, { timeConstant });
    },

    cancelScheduledValues(time) {
      checkTime(time);
      param.events = param.events.filter((event) => event.time < time);

      return param;
    },

    valueAt: (time) => valueAt(param, time),
  });
}

function fakeNode(context, kind, params = {}) {
  const node = { context, kind, outputs: [], disconnected: false };

  for (const [name, value] of Object.entries(params)) {
    node[name] = fakeParam(value);
  }

  context.nodes.push(node);

  return Object.assign(node, {
    connect(destination) {
      if (!destination) {
        throw new TypeError('connect to nothing');
      }

      node.outputs.push(destination);

      return destination;
    },

    disconnect() {
      node.outputs = [];
      node.disconnected = true;
    },
  });
}

function fakeSource(context, kind, params) {
  const source = fakeNode(context, kind, params);

  context.sourceList.push(source);

  return Object.assign(source, {
    isSource: true,
    start(when = 0) {
      checkTime(when);

      if (source.startAt !== undefined) {
        throw new Error('InvalidStateError: started twice');
      }

      source.startAt = when;
    },

    stop(when = 0) {
      checkTime(when);

      if (source.startAt === undefined) {
        throw new Error('InvalidStateError: stopped before it started');
      }

      source.stopAt = when;
    },

    isPlayingAt: (time) =>
      source.startAt !== undefined && source.startAt <= time && (source.stopAt ?? Infinity) > time,
  });
}

function fakeBuffer(channels, length, sampleRate) {
  const data = Array.from({ length: channels }, () => new Float32Array(length));

  return {
    numberOfChannels: channels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: (channel) => data[channel],
  };
}

const COMPRESSOR = { threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 };

export class FakeAudioContext {
  constructor(options = {}) {
    this.options = options;
    this.sampleRate = 8000;
    this.currentTime = 0;
    this.state = 'suspended';
    this.nodes = [];
    this.sourceList = [];
    this.destination = fakeNode(this, 'destination');
    FakeAudioContext.made.push(this);
  }

  resume() {
    this.state = 'running';

    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';

    return Promise.resolve();
  }

  advance(seconds) {
    if (this.state === 'running') {
      this.currentTime += seconds;
    }
  }

  createGain() {
    return fakeNode(this, 'gain', { gain: 1 });
  }

  createBiquadFilter() {
    const filter = fakeNode(this, 'filter', { frequency: 350, Q: 1, gain: 0 });

    return Object.assign(filter, { type: 'lowpass' });
  }

  createDynamicsCompressor() {
    return fakeNode(this, 'compressor', COMPRESSOR);
  }

  createOscillator() {
    return Object.assign(fakeSource(this, 'oscillator', { frequency: 440, detune: 0 }), {
      type: 'sine',
    });
  }

  createBufferSource() {
    return Object.assign(fakeSource(this, 'buffer', { playbackRate: 1, detune: 0 }), {
      buffer: null,
      loop: false,
    });
  }

  createBuffer(channels, length, sampleRate) {
    return fakeBuffer(channels, length, sampleRate);
  }

  sources() {
    return this.sourceList;
  }

  playingAt(time = this.currentTime) {
    return this.sources().filter((source) => source.isPlayingAt(time));
  }
}

FakeAudioContext.made = [];

// the newest context a test's createAudio made
export const lastContext = () => FakeAudioContext.made.at(-1);

// setInterval and clearInterval that run only when the test says
export function fakeTimers() {
  const intervals = new Map();
  let next = 1;

  return {
    setInterval(callback) {
      intervals.set(next, callback);
      next += 1;

      return next - 1;
    },

    clearInterval: (id) => intervals.delete(id),

    run() {
      for (const callback of intervals.values()) {
        callback();
      }
    },

    count: () => intervals.size,
  };
}

// an audio whose context runs, and `step(seconds)` to move its clock on and run the pump
export function runningAudio(createAudio, options = {}) {
  const timers = fakeTimers();
  const audio = createAudio({ AudioContext: FakeAudioContext, timers, ...options });

  audio.unlock();

  const context = lastContext();
  const step = (seconds) => {
    context.advance(seconds);
    timers.run();
  };

  return { audio, context, timers, step };
}
