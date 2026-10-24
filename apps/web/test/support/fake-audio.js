import { vi } from 'vitest';

const param = (value = 0) => ({
  value,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
});

const node = (extra = {}) => ({ connect: vi.fn(), ...extra });

// Enough of an AudioContext to see which voices a cue starts, without making a sound.
export function createFakeAudioContext({ state = 'running' } = {}) {
  const context = {
    state,
    currentTime: 0,
    sampleRate: 8000,
    destination: node(),
    started: [],
    gains: [],
    resume: vi.fn(async () => {}),
  };
  const source = (extra) =>
    node({
      ...extra,
      start: vi.fn(() => context.started.push(extra.kind)),
      stop: vi.fn(),
    });
  Object.assign(context, {
    createGain: () => {
      const gain = node({ gain: param(1) });
      context.gains.push(gain);
      return gain;
    },
    createDynamicsCompressor: () => node(),
    createOscillator: () => source({ kind: 'tone', type: 'sine', frequency: param(440) }),
    createBufferSource: () => source({ kind: 'noise', buffer: null }),
    createBiquadFilter: () => node({ type: 'lowpass', Q: param(1), frequency: param(350) }),
    createBuffer: (_channels, length) => ({ getChannelData: () => new Float32Array(length) }),
  });
  return context;
}
