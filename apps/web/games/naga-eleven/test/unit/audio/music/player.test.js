import { describe, expect, it } from 'vitest';
import { unlockAudio } from '../../../../src/audio/context/unlock.js';
import { hearMatch } from '../../../../src/audio/hear/hear-match.js';
import { pauseAudio } from '../../../../src/audio/context/unlock.js';
import { setMood } from '../../../../src/audio/music/player.js';
import { createAudioState } from '../../../../src/audio/state.js';
import { AUDIO, DUCKS } from '../../../../src/data/audio.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { FakeAudioContext, fakeTimers } from '../../../support/fake-audio.js';

const PUMP = AUDIO.pumpMs / 1000;

function musicRunning() {
  const timers = fakeTimers();
  const audio = createAudioState({ AudioContext: FakeAudioContext, timers });

  unlockAudio(audio);

  const playFor = (seconds) => {
    for (let time = 0; time < seconds; time += PUMP) {
      audio.context.advance(PUMP);
      timers.run();
    }
  };

  return { audio, context: audio.context, playFor };
}

const sourcesAfter = (context, time) => context.sources().filter((source) => source.startAt > time);

describe('the music player', () => {
  it('schedules notes a little ahead while a theme plays', () => {
    const { audio, context, playFor } = musicRunning();

    setMood(audio, 'title');
    playFor(2);

    const ahead = sourcesAfter(context, context.currentTime);
    const furthest = Math.max(...ahead.map((source) => source.startAt));

    expect(ahead.length).toBeGreaterThan(0);
    expect(furthest).toBeLessThanOrEqual(context.currentTime + AUDIO.lookahead + PUMP);
  });

  it('crossfades: the old theme fades to nothing and is let go, the new one plays on', () => {
    const { audio, context, playFor } = musicRunning();

    setMood(audio, 'calm');
    playFor(3);

    const calm = audio.music.playing.channels.output;
    const switchedAt = context.currentTime;

    setMood(audio, 'tense');

    expect(calm.gain.valueAt(switchedAt + AUDIO.crossfade)).toBeLessThan(0.05);

    const tense = audio.music.playing.channels.output;

    expect(tense.gain.valueAt(switchedAt + AUDIO.crossfade)).toBeCloseTo(0.9);

    playFor(AUDIO.crossfade + 1);

    expect(calm.disconnected).toBe(true);
    expect(audio.music.fading).toEqual([]);
    expect(audio.music.playing.id).toBe('tense');
    expect(sourcesAfter(context, context.currentTime).length).toBeGreaterThan(0);
  });

  it('schedules no note of the old theme once the new one is asked for', () => {
    const { audio, context, playFor } = musicRunning();

    setMood(audio, 'title');
    playFor(1);

    const old = audio.music.playing;
    const notes = old.notes.length;

    setMood(audio, 'sad');
    playFor(1);

    expect(old.notes.length).toBeLessThanOrEqual(notes);
    expect(context.currentTime).toBeGreaterThan(1.9);
  });

  it('fades out to silence for no mood, and for a mood it has no theme for', () => {
    const { audio, playFor } = musicRunning();

    setMood(audio, 'title');
    playFor(1);
    setMood(audio, null);

    expect(audio.music.playing).toBe(null);
    expect(audio.music.fading).toHaveLength(1);

    setMood(audio, 'opera');

    expect(audio.music.playing).toBe(null);
  });

  it('plays a jingle once and leaves it be when asked for again', () => {
    const { audio, context, playFor } = musicRunning();

    setMood(audio, 'victory');
    playFor(6);
    setMood(audio, 'victory');
    playFor(1);

    expect(audio.music.playing.cursor.done).toBe(true);
    expect(sourcesAfter(context, context.currentTime - 1)).toEqual([]);
  });

  it('schedules nothing while suspended', () => {
    const { audio, context, playFor } = musicRunning();

    setMood(audio, 'training');
    playFor(1);
    pauseAudio(audio);

    const made = context.sources().length;

    playFor(3);

    expect(context.sources().length).toBe(made);
  });

  it('steps back under a goal and comes back after it', () => {
    const { audio, context, playFor } = musicRunning();
    const match = createMatch({ seed: 1, humanTeam: 0 });

    setMood(audio, 'match');
    playFor(1);
    hearMatch(audio, [{ type: 'goal', team: 0, scorer: 9, move: null }], match);

    const duck = audio.chain.duck.gain;
    const at = context.currentTime;

    expect(duck.valueAt(at + 1)).toBeCloseTo(DUCKS.goal.depth, 1);
    expect(duck.valueAt(at + DUCKS.goal.hold + DUCKS.goal.release * 6)).toBeGreaterThan(0.95);
  });

  it('lets a lighter duck pass under a deeper one still on', () => {
    const { audio, context, playFor } = musicRunning();
    const match = createMatch({ seed: 1, humanTeam: 0 });

    playFor(1);
    hearMatch(audio, [{ type: 'goal', team: 0, scorer: 9, move: null }], match);
    hearMatch(audio, [{ type: 'duel', duel: { id: 1 } }], match);

    expect(audio.chain.duck.gain.valueAt(context.currentTime + 1)).toBeCloseTo(DUCKS.goal.depth, 1);
  });
});
