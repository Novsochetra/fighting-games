import { vi } from 'vitest';

const PARAM_METHODS = [
  'setValueAtTime',
  'linearRampToValueAtTime',
  'exponentialRampToValueAtTime',
  'setTargetAtTime',
];

function createParam(value) {
  const param = { value, events: [] };
  for (const method of PARAM_METHODS) {
    param[method] = (...args) => {
      param.events.push([method, ...args]);
      return param;
    };
  }
  return param;
}

function createNode(context, kind, { params = {}, fields = {}, scheduled = false } = {}) {
  const node = { kind, connections: [], ...fields };
  for (const [name, value] of Object.entries(params)) {
    node[name] = createParam(value);
  }
  node.connect = (destination) => {
    node.connections.push(destination);
    return destination;
  };
  node.disconnect = () => {
    node.connections.length = 0;
    node.disconnected = true;
  };
  if (scheduled) {
    node.starts = [];
    node.stops = [];
    node.onended = null;
    node.start = (...args) => node.starts.push(args);
    node.stop = (...args) => node.stops.push(args);
  }
  context.nodes.push(node);
  return node;
}

export function createFakeBuffer(channels, length, sampleRate) {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  return {
    numberOfChannels: channels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: (channel) => data[channel],
  };
}

// records every node it creates; resume() moves it to `resumeTo`
export function createFakeAudioContext({ state = 'suspended', resumeTo = 'running' } = {}) {
  const context = {
    state,
    sampleRate: 44100,
    currentTime: 0,
    nodes: [],
    buffers: [],
    resumeCalls: 0,
    destination: { kind: 'destination', connections: [] },
    resume() {
      context.resumeCalls++;
      context.state = resumeTo;
      return Promise.resolve();
    },
    createBuffer(channels, length, sampleRate) {
      const buffer = createFakeBuffer(channels, length, sampleRate);
      context.buffers.push(buffer);
      return buffer;
    },
    createGain: () => createNode(context, 'gain', { params: { gain: 1 } }),
    createOscillator: () =>
      createNode(context, 'oscillator', {
        params: { frequency: 440 },
        fields: { type: 'sine' },
        scheduled: true,
      }),
    createBiquadFilter: () =>
      createNode(context, 'biquad', {
        params: { frequency: 350, Q: 1, gain: 0 },
        fields: { type: 'lowpass' },
      }),
    createBufferSource: () =>
      createNode(context, 'bufferSource', {
        params: { playbackRate: 1 },
        fields: { buffer: null },
        scheduled: true,
      }),
    createDynamicsCompressor: () =>
      createNode(context, 'compressor', {
        params: { threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 },
      }),
    createWaveShaper: () => createNode(context, 'waveShaper', { fields: { curve: null } }),
    createConvolver: () => createNode(context, 'convolver', { fields: { buffer: null } }),
    createDelay: () => createNode(context, 'delay', { params: { delayTime: 0 } }),
    createStereoPanner: () => createNode(context, 'stereoPanner', { params: { pan: 0 } }),
  };
  return context;
}

// when a scheduled source stops: its own stop time, or the end of its buffer
function endTime(node) {
  if (node.stops.length) {
    return node.stops.at(-1)[0];
  }
  const duration = node.buffer ? node.buffer.duration / node.playbackRate.value : 0;
  return (node.starts[0]?.[0] ?? 0) + duration;
}

// moves the clock on and fires `onended` on every source that has stopped by then, once
export function advanceTo(context, time) {
  context.currentTime = time;
  for (const node of context.nodes) {
    if (node.starts?.length && !node.ended && endTime(node) <= time) {
      node.ended = true;
      node.onended?.();
    }
  }
}

export function connectedNodes(context) {
  return context.nodes.filter((node) => !node.disconnected);
}

export function nodesOfKind(context, kind) {
  return context.nodes.filter((node) => node.kind === kind);
}

// whether a node's connections lead to `target` (the destination, a bus...)
export function reaches(node, target, seen = new Set()) {
  if (node === target) {
    return true;
  }
  if (seen.has(node)) {
    return false;
  }
  seen.add(node);
  return node.connections.some((next) => reaches(next, target, seen));
}

// replaces the global AudioContext; every context the code creates lands in `contexts`
export function stubAudioContext(settings) {
  const contexts = [];
  function FakeAudioContext(options) {
    const context = createFakeAudioContext(settings);
    context.options = options;
    contexts.push(context);
    return context;
  }
  vi.stubGlobal('AudioContext', FakeAudioContext);
  return contexts;
}
