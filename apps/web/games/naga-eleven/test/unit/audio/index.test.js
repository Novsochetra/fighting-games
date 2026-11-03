import { describe, expect, it } from 'vitest';
import { createAudio } from '../../../src/audio/index.js';
import { createMatch } from '../../../src/sim/create-match.js';
import {
  FakeAudioContext,
  fakeTimers,
  lastContext,
  runningAudio,
} from '../../support/fake-audio.js';

const EVENTS = [
  { type: 'whistle', kind: 'kickoff', half: 1 },
  { type: 'shot', player: 9, power: 0.9, move: null },
  { type: 'goal', team: 0, scorer: 9, move: null },
];

function everyCall(audio) {
  audio.setMusic('title');
  audio.setVolumes({ sound: 0.5, music: 0.5 });
  audio.setCrowd(0.8);
  audio.unlock();
  audio.play('kick', { power: 1 });
  audio.hear(EVENTS, createMatch({ seed: 1, humanTeam: 0 }));
  audio.hearTraining({ drill: 'cone-dribble', events: [{ type: 'brush' }], run: {} });
  audio.pause();
  audio.resume();

  return audio.stats();
}

describe('createAudio', () => {
  it('is silent, and never throws, with no AudioContext', () => {
    const audio = createAudio();

    expect(everyCall(audio)).toEqual({ state: 'none', voices: 0, mood: null });
    expect(audio.play('kick')).toBe(false);
  });

  it('stays silent when the browser refuses to make a context', () => {
    const Refusing = function Refusing() {
      throw new Error('NotAllowedError');
    };
    const audio = createAudio({ AudioContext: Refusing, timers: fakeTimers() });

    expect(everyCall(audio).state).toBe('none');
  });

  it('makes its context on the first unlock only, and starts the music pump', () => {
    const timers = fakeTimers();
    const audio = createAudio({ AudioContext: FakeAudioContext, timers });
    const before = FakeAudioContext.made.length;

    audio.unlock();
    audio.unlock();

    expect(FakeAudioContext.made.length).toBe(before + 1);
    expect(lastContext().state).toBe('running');
    expect(timers.count()).toBe(1);
  });

  it('plays nothing while suspended, and plays again once resumed', () => {
    const { audio, context } = runningAudio(createAudio);

    audio.pause();

    expect(context.state).toBe('suspended');
    expect(audio.play('kick')).toBe(false);

    audio.resume();

    expect(context.state).toBe('running');
    expect(audio.play('kick')).toBe(true);
  });

  it('lets the phone play through the silent switch when it can', () => {
    const navigator = { audioSession: { type: 'auto' } };

    runningAudio(createAudio, { navigator });

    expect(navigator.audioSession.type).toBe('playback');
  });

  it('starts the mood asked for before the first tap once the tap unlocks it', () => {
    const timers = fakeTimers();
    const audio = createAudio({ AudioContext: FakeAudioContext, timers });

    audio.setMusic('calm');

    expect(audio.stats().mood).toBe(null);

    audio.unlock();

    expect(audio.stats().mood).toBe('calm');
  });
});
