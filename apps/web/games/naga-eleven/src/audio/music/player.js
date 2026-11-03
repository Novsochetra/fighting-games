import { AUDIO } from '../../data/audio.js';
import { THEMES } from '../../data/music/index.js';
import { createVoice, holdAt, releaseVoice, SILENT } from '../nodes.js';
import { compileTheme } from './compile.js';
import { PLAYERS } from './instruments.js';
import { catchUp, dueNotes, startCursor } from './scheduler.js';

export const createMusic = () => ({ mood: null, playing: null, fading: [] });

// a theme's own gain (what crossfades) and the soft filter the tro is bowed through
function buildChannels(context, destination) {
  const output = context.createGain();
  const tro = context.createBiquadFilter();

  output.connect(destination);
  tro.type = 'lowpass';
  tro.frequency.value = 1900;
  tro.connect(output);

  return { output, tro, nodes: [output, tro] };
}

function startTheme(audio, theme, now) {
  const channels = buildChannels(audio.context, audio.chain.duck);
  const fade = theme.loop ? AUDIO.crossfade : AUDIO.jingleFade;

  channels.output.gain.setValueAtTime(SILENT, now);
  channels.output.gain.linearRampToValueAtTime(theme.level, now + fade);

  return {
    id: theme.id,
    compiled: compileTheme(theme),
    channels,
    cursor: startCursor(now + 0.06),
    notes: [],
    endsAt: Infinity,
  };
}

function fadeOut(playing, now) {
  const level = playing.channels.output.gain;

  holdAt(level, now);
  level.setTargetAtTime(0, now, AUDIO.crossfade / 4);
  playing.endsAt = now + AUDIO.crossfade + 0.4;
}

function releaseTheme(playing) {
  for (const note of playing.notes) {
    releaseVoice(note);
  }

  for (const node of playing.channels.nodes) {
    node.disconnect();
  }
}

function follow(audio, now) {
  const { music } = audio;

  if ((music.playing?.id ?? null) === music.mood) {
    return;
  }

  if (music.playing) {
    fadeOut(music.playing, now);
    music.fading.push(music.playing);
    music.playing = null;
  }

  if (music.mood) {
    music.playing = startTheme(audio, THEMES[music.mood], now);
  }
}

function playNote(audio, playing, note) {
  const output = note.instrument === 'tro' ? playing.channels.tro : playing.channels.output;
  const voice = createVoice({ context: audio.context, chain: audio.chain, output });

  try {
    PLAYERS[note.instrument](voice, note);
    playing.notes.push(voice);
  } catch {
    // a note the browser refuses is a note missed, never the music stopped
    releaseVoice(voice);
  }
}

function keepUnended(items, now, letGo) {
  return items.filter((item) => {
    if (item.endsAt > now) {
      return true;
    }

    letGo(item);

    return false;
  });
}

function prune(music, now) {
  if (music.playing) {
    music.playing.notes = keepUnended(music.playing.notes, now, releaseVoice);
  }

  music.fading = keepUnended(music.fading, now, releaseTheme);
}

function schedule(audio, playing, now) {
  catchUp(playing.compiled, playing.cursor, now);

  for (const note of dueNotes(playing.compiled, playing.cursor, now + AUDIO.lookahead)) {
    playNote(audio, playing, note);
  }
}

export function pumpMusic(audio) {
  if (audio.context?.state !== 'running') {
    return;
  }

  const now = audio.context.currentTime;
  const { music } = audio;

  try {
    follow(audio, now);
    prune(music, now);

    if (music.playing) {
      schedule(audio, music.playing, now);
    }
  } catch {
    // the pump runs on a timer: a refused node must not throw there every 50 ms
  }
}

// a mood with no theme, or null, lets the music fade out
export function setMood(audio, mood) {
  audio.music.mood = THEMES[mood] ? mood : null;
  pumpMusic(audio);
}
