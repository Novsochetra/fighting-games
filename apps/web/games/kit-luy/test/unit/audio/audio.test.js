import { describe, expect, it } from 'vitest';
import { createAudio } from '../../../src/audio/audio.js';
import { fakeAudioContext } from '../../support/fake-audio.js';
import { unlockedAudio, windowWith } from './open-audio.js';

const EVERY_SOUND = [
  ['deal', { value: 500 }],
  ['take', { value: 500 }],
  ['clear', undefined],
  ['paid', { pieces: [2000, 500] }],
  ['stamp', undefined],
  ['wrong', undefined],
  ['arrive', { kind: 'cook' }],
  ['stage', undefined],
  ['extra', undefined],
  ['left', undefined],
  ['closed', undefined],
  ['count', { value: 1000 }],
  ['best', undefined],
  ['tap', undefined],
];

function useAll(audio) {
  audio.unlock();
  audio.play('paid', { pieces: [1000] });
  audio.suspend();
  audio.resume();
}

describe('the sound before it may play', () => {
  it('is silent, with no context opened, until the first tap', () => {
    const context = fakeAudioContext();
    const window = windowWith(context);
    const audio = createAudio({ window, settings: { sound: true } });

    audio.play('tap');
    audio.suspend();
    audio.resume();

    expect(window.opened).toBe(0);
    expect(context.started).toEqual([]);
  });

  it('opens one context at the first tap and keeps it', () => {
    const { audio, context, window } = unlockedAudio();

    audio.unlock();
    audio.unlock();

    expect(window.opened).toBe(1);
    expect(context.state).toBe('running');
  });

  it.each([
    ['no Web Audio at all', {}],
    [
      'a context that will not open',
      {
        AudioContext: function AudioContext() {
          throw new Error('no audio hardware');
        },
      },
    ],
  ])('is silent and safe with %s', (_case, window) => {
    const audio = createAudio({ window, settings: { sound: true } });

    expect(() => useAll(audio)).not.toThrow();
  });

  it('opens the older webkitAudioContext where that is all there is', () => {
    const context = fakeAudioContext();
    const { AudioContext } = windowWith(context);
    const audio = createAudio({
      window: { webkitAudioContext: AudioContext, navigator: {} },
      settings: { sound: true },
    });

    useAll(audio);

    expect(context.started.length).toBeGreaterThan(0);
  });
});

describe('the sound on an iPhone', () => {
  it('plays in a window that has no navigator', () => {
    const context = fakeAudioContext();
    const window = windowWith(context, { navigator: undefined });

    useAll(createAudio({ window, settings: { sound: true } }));

    expect(context.started.length).toBeGreaterThan(0);
  });

  it('plays with the silent switch on', () => {
    const audioSession = { type: 'auto' };
    const window = windowWith(fakeAudioContext(), { navigator: { audioSession } });

    createAudio({ window, settings: { sound: true } }).unlock();

    expect(audioSession.type).toBe('playback');
  });

  it('still plays where an older WebKit will not let the session be set', () => {
    const context = fakeAudioContext();
    const audioSession = {
      set type(_value) {
        throw new TypeError('read-only');
      },
    };
    const window = windowWith(context, { navigator: { audioSession } });
    const audio = createAudio({ window, settings: { sound: true } });

    expect(() => useAll(audio)).not.toThrow();
    expect(context.started.length).toBeGreaterThan(0);
  });
});

describe('playing a sound', () => {
  it.each(EVERY_SOUND)('%s plays at least one voice, from now on', (name, detail) => {
    const { audio, context } = unlockedAudio();

    context.currentTime = 3;
    audio.play(name, detail);

    expect(context.started.length).toBeGreaterThan(0);
    expect(Math.min(...context.started.map((voice) => voice.at))).toBe(3);
  });

  it.each(['fanfare', '', 'constructor', 'toString', undefined])(
    'plays nothing for the unknown name %s',
    (name) => {
      const { audio, context } = unlockedAudio();

      expect(() => audio.play(name, { value: 500 })).not.toThrow();
      expect(context.started).toEqual([]);
    },
  );

  it.each(['deal', 'take', 'paid', 'arrive', 'count'])(
    '%s still plays when the page gives it no detail',
    (name) => {
      const { audio, context } = unlockedAudio();

      expect(() => audio.play(name)).not.toThrow();
      expect(() => audio.play(name, null)).not.toThrow();
      expect(() => audio.play(name, { value: 'lots', pieces: 7, kind: 'toString' })).not.toThrow();
      expect(context.started.length).toBeGreaterThan(0);
      expect(context.started.every((voice) => Number.isFinite(voice.at))).toBe(true);
    },
  );

  it('reads the sound switch on every play', () => {
    const { audio, context, settings } = unlockedAudio({ sound: false });

    audio.play('tap');

    expect(context.started).toEqual([]);

    settings.sound = true;
    audio.play('tap');

    expect(context.started.length).toBeGreaterThan(0);

    const heard = context.started.length;

    settings.sound = false;
    audio.play('tap');

    expect(context.started).toHaveLength(heard);
  });
});

describe('the sound of a page that is put away', () => {
  it('stops with the page and comes back with it', () => {
    const { audio, context } = unlockedAudio();

    audio.play('tap');
    audio.suspend();

    expect(context.state).toBe('suspended');

    const heard = context.started.length;

    audio.play('closed');

    expect(context.started).toHaveLength(heard);

    audio.resume();
    audio.play('tap');

    expect(context.state).toBe('running');
    expect(context.started.length).toBeGreaterThan(heard);
  });

  it('plays what the first tap asked for in a browser that starts its context late', () => {
    const { audio, context } = unlockedAudio();

    context.state = 'suspended';
    audio.play('tap');

    expect(context.started.length).toBeGreaterThan(0);
  });

  it('survives a phone that will not wake its sound', async () => {
    const { audio, context } = unlockedAudio();

    context.state = 'interrupted';
    context.resume = () => Promise.reject(new Error('a call is in progress'));

    expect(() => audio.resume()).not.toThrow();
    await Promise.resolve();
  });
});
