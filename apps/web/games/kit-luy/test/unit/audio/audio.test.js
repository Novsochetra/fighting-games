import { describe, expect, it } from 'vitest';
import { createAudio } from '../../../src/audio/audio.js';
import { createMusic } from '../../../src/audio/music.js';
import { SONG } from '../../../src/data/song.js';
import { SOUNDS } from '../../../src/data/sounds.js';
import { fakeAudioContext, fakeTimers } from '../../support/fake-audio.js';

function openAudio(settings = { sound: true, music: true }) {
  const context = fakeAudioContext();
  const clock = fakeTimers();
  const window = {
    AudioContext: function AudioContext() {
      return context;
    },
    navigator: {},
    ...clock,
  };

  return { audio: createAudio({ window, settings }), context, settings, timers: clock.timers };
}

describe('the audio', () => {
  it('is silent until the first tap opens it', () => {
    const { audio, context } = openAudio();

    audio.play('right');
    expect(context.started).toEqual([]);

    audio.unlock();
    audio.play('right');
    expect(context.started).toHaveLength(SOUNDS.right.length);
  });

  it('plays a sound higher when asked to', () => {
    const { audio, context } = openAudio();

    audio.unlock();
    audio.play('tick');
    audio.play('tick', 12);

    expect(context.started[1].hertz).toBeCloseTo(context.started[0].hertz * 2, 5);
  });

  it('plays nothing with Sound off, and takes the switch at once', () => {
    const { audio, context, settings } = openAudio({ sound: false, music: true });

    audio.unlock();
    audio.play('wrong');
    expect(context.started).toEqual([]);

    settings.sound = true;
    audio.play('wrong');
    expect(context.started).toHaveLength(SOUNDS.wrong.length);
  });

  it('plays the tune only with Music on', () => {
    const off = openAudio({ sound: true, music: false });
    const on = openAudio({ sound: true, music: true });

    off.audio.unlock();
    off.audio.startMusic();
    on.audio.unlock();
    on.audio.startMusic();

    expect(off.context.started).toEqual([]);
    expect(on.context.started.length).toBeGreaterThan(0);
  });

  it('stays silent, and breaks nothing, where the browser has no Web Audio', () => {
    const audio = createAudio({
      window: { navigator: {} },
      settings: { sound: true, music: true },
    });

    audio.unlock();
    audio.play('right');
    audio.startMusic();
    audio.stopMusic();
    audio.hurryMusic(1.1);
    expect(audio.suspend()).toBeUndefined();
  });
});

describe('the music', () => {
  function openMusic() {
    const context = fakeAudioContext();
    const clock = fakeTimers();

    return {
      music: createMusic({ context, output: {}, song: SONG, timers: clock }),
      context,
      clock,
    };
  }

  it('writes the tune a little ahead of the clock, and more as the clock moves', () => {
    const { music, context, clock } = openMusic();

    music.start();

    const first = context.started.length;

    expect(first).toBeGreaterThan(0);
    expect(context.started.every((note) => note.at <= 0.4)).toBe(true);

    context.currentTime = 2;
    clock.timers.callback();
    expect(context.started.length).toBeGreaterThan(first);
  });

  it('stops writing when stopped', () => {
    const { music, clock } = openMusic();

    music.start();
    expect(music.playing).toBe(true);

    music.stop();
    expect(music.playing).toBe(false);
    expect(clock.timers.callback).toBeNull();
  });

  it('plays faster when hurried', () => {
    const steady = openMusic();
    const hurried = openMusic();

    steady.music.start();
    hurried.music.start();
    hurried.music.setRate(2);
    steady.context.currentTime = 4;
    hurried.context.currentTime = 4;
    steady.clock.timers.callback();
    hurried.clock.timers.callback();

    expect(hurried.context.started.length).toBeGreaterThan(steady.context.started.length);
  });
});
