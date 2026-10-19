import { describe, expect, it } from 'vitest';
import {
  createMusicState,
  selectSong,
  tickMusic,
  updateMusic,
} from '../../../src/audio/music/music-player.js';
import { SONGS } from '../../../src/audio/music/songs.js';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { createFakeAudioContext, nodesOfKind } from './fake-audio-context.js';

function fakeAudio(state = 'running') {
  const context = createFakeAudioContext({ state });
  const audio = { context, chain: buildChain(context), music: createMusicState(), ducked: null };
  context.nodes.length = 0;
  return audio;
}

const gameIn = (mode) => ({
  mode,
  clearTime: 0,
  boss: null,
  muted: false,
  settings: { music: 100, sfx: 100 },
});

describe('selectSong', () => {
  it('restarts the sequencer only when the song changes', () => {
    const audio = fakeAudio();
    audio.context.currentTime = 3;
    selectSong(audio, 'battle');
    expect(audio.music).toEqual({ name: 'battle', step: 0, next: 3.08 });
    audio.music.step = 9;
    selectSong(audio, 'battle');
    expect(audio.music.step).toBe(9);
  });
});

describe('tickMusic', () => {
  it('schedules every step inside the lookahead and no further', () => {
    const audio = fakeAudio();
    selectSong(audio, 'battle');
    tickMusic(audio);
    const beat = 60 / SONGS.battle.bpm / 4;
    expect(audio.music.step).toBe(2);
    expect(audio.music.next).toBeCloseTo(0.08 + 2 * beat, 12);
    tickMusic(audio);
    expect(audio.music.step).toBe(2);
  });

  it('catches up after a stall instead of scheduling in the past', () => {
    const audio = fakeAudio();
    selectSong(audio, 'title');
    audio.context.currentTime = 10;
    tickMusic(audio);
    const kickStarts = nodesOfKind(audio.context, 'oscillator').map((node) => node.starts[0][0]);
    expect(Math.min(...kickStarts)).toBeCloseTo(10.05, 12);
  });

  it('stays quiet without a running context or a song', () => {
    const suspended = fakeAudio('suspended');
    selectSong(suspended, 'battle');
    tickMusic(suspended);
    expect(suspended.context.nodes).toEqual([]);
    const silent = fakeAudio();
    tickMusic(silent);
    expect(silent.context.nodes).toEqual([]);
  });
});

describe('updateMusic', () => {
  it('ducks the music in pause and lifts it again on play', () => {
    const audio = fakeAudio();
    updateMusic(audio, gameIn('play'));
    expect(audio.chain.musicBus.gain.value).toBe(0.5);
    updateMusic(audio, gameIn('pause'));
    expect(audio.chain.musicBus.gain.value).toBeCloseTo(0.2, 12);
    expect(audio.music.name).toBe('battle');
    updateMusic(audio, gameIn('title'));
    expect(audio.chain.musicBus.gain.value).toBe(0.5);
    expect(audio.music.name).toBe('title');
  });
});
