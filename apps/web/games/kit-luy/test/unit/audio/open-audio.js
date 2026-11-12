import { createAudio } from '../../../src/audio/audio.js';
import { fakeAudioContext } from '../../support/fake-audio.js';

export function windowWith(context, more = {}) {
  const window = { opened: 0, navigator: {}, ...more };

  window.AudioContext = function AudioContext() {
    window.opened += 1;

    return context;
  };

  return window;
}

export function unlockedAudio(settings = { sound: true }) {
  const context = fakeAudioContext();
  const window = windowWith(context);
  const audio = createAudio({ window, settings });

  audio.unlock();

  return { audio, context, settings, window };
}

export function played(name, detail) {
  const { audio, context } = unlockedAudio();

  audio.play(name, detail);

  return context.started;
}

export const oscillators = (started) => started.filter((voice) => voice.kind === 'oscillator');
