import { applyVolumes, isDucked } from '../context/volumes.js';
import { playStep } from './sequencer.js';
import { songFor } from './song-for.js';
import { SONGS } from './songs.js';

const LOOKAHEAD_SECONDS = 0.22;

export function createMusicState() {
  return { name: null, step: 0, next: 0 };
}

export function selectSong(audio, name) {
  const { music } = audio;
  if (music.name === name) {
    return;
  }
  music.name = name;
  music.step = 0;
  music.next = audio.context ? audio.context.currentTime + 0.08 : 0;
}

// schedules every step that falls inside a little lookahead, so a slow frame does not stall the music
export function tickMusic(audio) {
  const { context, music } = audio;
  if (!context || context.state !== 'running' || !music.name) {
    return;
  }
  const song = SONGS[music.name];
  const beat = 60 / song.bpm / 4;
  if (music.next < context.currentTime) {
    music.next = context.currentTime + 0.05;
  }
  while (music.next < context.currentTime + LOOKAHEAD_SECONDS) {
    try {
      playStep(audio, { song, index: music.step, time: music.next });
    } catch {
      // a node the browser refuses to schedule must not stop the music loop
    }
    music.step = (music.step + 1) % 64;
    music.next += beat;
  }
}

// once per sim tick: pick the song, duck the music in pause and game over, run the sequencer
export function updateMusic(audio, game) {
  selectSong(audio, songFor(game));
  const ducked = isDucked(game);
  if (ducked !== audio.ducked) {
    audio.ducked = ducked;
    applyVolumes(audio.chain, game);
  }
  tickMusic(audio);
}
