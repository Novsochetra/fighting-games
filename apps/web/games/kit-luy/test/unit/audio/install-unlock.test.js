import { describe, expect, it } from 'vitest';
import { createAudio } from '../../../src/audio/audio.js';
import { installAudioUnlock } from '../../../src/audio/install-unlock.js';
import { fakeAudioContext } from '../../support/fake-audio.js';
import { windowWith } from './open-audio.js';

function listened() {
  const listeners = new Map();

  return {
    listeners,
    addEventListener: (type, listener) => listeners.set(type, listener),
  };
}

function installed() {
  const context = fakeAudioContext();
  const window = windowWith(context, listened());
  const document = { hidden: false, ...listened() };
  const audio = createAudio({ window, settings: { sound: true } });

  installAudioUnlock({ window, document, audio });

  return { audio, context, window, document };
}

function hide(document, hidden) {
  document.hidden = hidden;
  document.listeners.get('visibilitychange')();
}

describe('the audio unlock on the page', () => {
  it.each(['touchend', 'pointerup', 'click', 'keydown'])('opens the sound on a %s', (gesture) => {
    const { audio, context, window } = installed();

    window.listeners.get(gesture)({ type: gesture });
    audio.play('tap');

    expect(context.state).toBe('running');
    expect(context.started.length).toBeGreaterThan(0);
  });

  it('opens one context however many gestures follow', () => {
    const { window } = installed();

    for (const listener of window.listeners.values()) {
      listener({});
    }

    expect(window.opened).toBe(1);
  });

  it('rests the sound while the page is hidden and wakes it after', () => {
    const { context, window, document } = installed();

    window.listeners.get('click')({});
    hide(document, true);

    expect(context.state).toBe('suspended');

    hide(document, false);

    expect(context.state).toBe('running');
  });

  it('does nothing when the page is hidden before any tap', () => {
    const { window, document } = installed();

    expect(() => hide(document, true)).not.toThrow();
    expect(() => hide(document, false)).not.toThrow();
    expect(window.opened).toBe(0);
  });
});
