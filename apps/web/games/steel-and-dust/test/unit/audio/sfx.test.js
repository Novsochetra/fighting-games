import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudio } from '../../../src/audio/index.js';
import {
  advanceTo,
  connectedNodes,
  nodesOfKind,
  reaches,
  stubAudioContext,
} from './fake-audio-context.js';

const gameState = () => ({
  mode: 'play',
  muted: false,
  clearTime: 0,
  boss: null,
  camera: { x: 100 },
  settings: { music: 60, sfx: 80 },
});

let contexts;

function runningAudio(game = gameState()) {
  const audio = createAudio(game);
  audio.unlock();
  const context = contexts.at(-1);
  context.nodes.length = 0;
  return { audio, context, game };
}

const sources = (context) => nodesOfKind(context, 'bufferSource');

beforeEach(() => {
  vi.useFakeTimers();
  contexts = stubAudioContext();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('sfx routing', () => {
  it('plays a bank sound as one buffer through the chain', () => {
    const { audio, context } = runningAudio();
    audio.sfx('blunt');
    const [source] = sources(context);
    expect(source.buffer.length).toBe(Math.ceil(0.35 * 44100));
    expect(source.connections[0].gain.value).toBe(1);
    expect(reaches(source, context.destination)).toBe(true);
    expect(audio.debugState().voices).toBe(1);
  });

  it('picks the Big variant when asked and one exists', () => {
    const { audio, context } = runningAudio();
    audio.sfx('blunt', true);
    audio.sfx('armor', true);
    expect(sources(context).map((source) => source.buffer.length)).toEqual([26460, 26460]);
  });

  it('builds live sounds from oscillators instead of the bank', () => {
    const { audio, context } = runningAudio();
    audio.sfx('ui');
    expect(sources(context)).toHaveLength(0);
    const [tone] = nodesOfKind(context, 'oscillator');
    expect(tone.frequency.events[0]).toEqual(['setValueAtTime', 1175, 0.005]);
    expect(reaches(tone, context.destination)).toBe(true);
  });

  it('stays silent when muted, not running, or asked for an unknown sound', () => {
    const { audio, context, game } = runningAudio();
    audio.sfx('nope');
    game.muted = true;
    audio.sfx('blunt');
    audio.sfx('ui');
    game.muted = false;
    context.state = 'suspended';
    audio.sfx('blunt');
    expect(context.nodes).toEqual([]);
  });

  it('applies volume, rate, take and the tick offset', () => {
    const { audio, context } = runningAudio();
    audio.setTickOffset(0.5);
    audio.sfx('land', false, { vol: 0.5, rate: 2, take: 4 });
    const [source] = sources(context);
    expect(source.connections[0].gain.value).toBe(0.16);
    expect(source.playbackRate.value).toBeGreaterThan(2 * 0.96);
    expect(source.playbackRate.value).toBeLessThan(2 * 1.04);
    expect(source.starts[0][0]).toBeCloseTo(0.508, 12);
  });

  it('pans by screen position and sweeps the pan the way a swing travels', () => {
    const { audio, context } = runningAudio();
    audio.sfx('blunt', false, { x: 100 + 288 });
    audio.sfx('swingSword', false, { x: 100, dir: 1 });
    const [still, moving] = nodesOfKind(context, 'stereoPanner');
    expect(still.pan.value).toBeCloseTo(0.5 * 0.55, 12);
    expect(moving.pan.events[0]).toEqual(['setValueAtTime', -0.55 - 0.25, 0.008]);
    expect(moving.pan.events[1][1]).toBeCloseTo(-0.55 + 0.25, 12);
  });

  it('merges the same sound fired twice in one moment', () => {
    const { audio, context } = runningAudio();
    audio.sfx('blunt');
    audio.sfx('blunt');
    audio.sfx('voiceHurt');
    audio.sfx('voiceHurt');
    expect(sources(context)).toHaveLength(3);
  });

  it('merges a burst of the same live sound, then plays it again a moment later', () => {
    const { audio, context } = runningAudio();
    audio.sfx('thorns');
    const once = context.nodes.length;
    audio.sfx('thorns');
    expect(context.nodes).toHaveLength(once);
    context.currentTime = 0.05;
    audio.sfx('thorns');
    expect(context.nodes).toHaveLength(once * 2);
  });
});

describe('finished sounds', () => {
  it('leave the voice pool and the audio graph as soon as they end', () => {
    const { audio, context } = runningAudio();
    audio.sfx('blunt', false, { x: 160, dir: 1 });
    audio.sfx('ui');
    expect(audio.debugState().voices).toBe(1);
    advanceTo(context, 5);
    expect(audio.debugState().voices).toBe(0);
    expect(connectedNodes(context)).toEqual([]);
  });
});
