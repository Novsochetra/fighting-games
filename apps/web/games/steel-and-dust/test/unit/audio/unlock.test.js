import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudio, installAudioUnlock } from '../../../src/audio/index.js';
import { nodesOfKind, stubAudioContext } from './fake-audio-context.js';

const gameState = () => ({ mode: 'title', muted: false, settings: { music: 60, sfx: 80 } });

function fakeWindow() {
  const listeners = [];
  const documentListeners = {};
  return {
    listeners,
    addEventListener: (type, listener, options) => listeners.push({ type, listener, options }),
    document: {
      hidden: false,
      addEventListener: (type, listener) => {
        documentListeners[type] = listener;
      },
    },
    fire(type) {
      for (const entry of listeners.filter((candidate) => candidate.type === type)) {
        entry.listener();
      }
    },
    fireDocument(type) {
      documentListeners[type]();
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('unlock', () => {
  it('creates one interactive context, asks iOS for playback and starts the warm-up', () => {
    const contexts = stubAudioContext();
    const audioSession = { type: 'auto' };
    vi.stubGlobal('navigator', { audioSession });
    const audio = createAudio(gameState());
    expect(audio.debugState()).toEqual({ state: 'none', voices: 0, bank: '0/34' });
    audio.unlock();
    audio.unlock();
    expect(contexts).toHaveLength(1);
    expect(contexts[0].options).toEqual({ latencyHint: 'interactive' });
    expect(audioSession.type).toBe('playback');
    expect(vi.getTimerCount()).toBe(1);
    expect(audio.debugState().state).toBe('running');
  });

  it('resumes a waiting context and plays a one-sample silent buffer', () => {
    const contexts = stubAudioContext();
    createAudio(gameState()).unlock();
    const [context] = contexts;
    expect(context.resumeCalls).toBe(1);
    const silence = context.buffers.find((buffer) => buffer.length === 1);
    expect(silence.sampleRate).toBe(22050);
    const source = nodesOfKind(context, 'bufferSource').find((node) => node.buffer === silence);
    expect(source.connections).toEqual([context.destination]);
    expect(source.starts).toEqual([[0]]);
  });

  it('leaves the game silent when there is no Web Audio', () => {
    vi.stubGlobal('AudioContext', undefined);
    const audio = createAudio(gameState());
    expect(() => audio.unlock()).not.toThrow();
    expect(audio.debugState().state).toBe('none');
    expect(() => audio.sfx('blunt')).not.toThrow();
  });
});

describe('installAudioUnlock', () => {
  it('retries on every lifting gesture until the context is running', () => {
    const contexts = stubAudioContext({ resumeTo: 'suspended' });
    const target = fakeWindow();
    const audio = createAudio(gameState());
    installAudioUnlock(target, audio);
    expect(target.listeners.map((entry) => entry.type)).toEqual([
      'touchend',
      'pointerup',
      'click',
      'keydown',
    ]);
    expect(target.listeners.every((entry) => entry.options.capture && entry.options.passive)).toBe(
      true,
    );
    target.fire('pointerup');
    target.fire('touchend');
    expect(contexts[0].resumeCalls).toBe(2);
    contexts[0].state = 'running';
    target.fire('click');
    target.fire('keydown');
    expect(contexts[0].resumeCalls).toBe(2);
    expect(contexts).toHaveLength(1);
  });

  it('resumes when the page becomes visible again', () => {
    const contexts = stubAudioContext({ resumeTo: 'suspended' });
    const target = fakeWindow();
    const audio = createAudio(gameState());
    installAudioUnlock(target, audio);
    target.fireDocument('visibilitychange');
    expect(contexts).toHaveLength(0);
    audio.unlock();
    target.document.hidden = true;
    target.fireDocument('visibilitychange');
    expect(contexts[0].resumeCalls).toBe(1);
    target.document.hidden = false;
    target.fireDocument('visibilitychange');
    expect(contexts[0].resumeCalls).toBe(2);
  });
});
