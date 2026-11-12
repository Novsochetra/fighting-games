import { SONG } from '../data/song.js';
import { SOUNDS } from '../data/sounds.js';
import { createMusic } from './music.js';
import { playVoice } from './voice.js';

const MASTER_VOLUME = 0.9;

function openContext(window) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  try {
    // iPhone: play like a music app, so the silent switch does not mute the game (Safari 17+)
    if (window.navigator.audioSession) {
      window.navigator.audioSession.type = 'playback';
    }
  } catch {
    // older WebKit exposes audioSession read-only; the context still works
  }

  return new AudioContextClass({ latencyHint: 'interactive' });
}

function build(window) {
  const context = openContext(window);
  const master = context.createGain();

  master.gain.value = MASTER_VOLUME;
  master.connect(context.destination);

  return {
    context,
    master,
    music: createMusic({ context, output: master, song: SONG, timers: window }),
  };
}

// Sound starts at the first tap, as a page may not open it sooner, and stays silent where the
// browser has no Web Audio. `settings` is read on every sound, so a switch flipped takes at once.
export function createAudio({ window, settings }) {
  let chain = null;

  function unlock() {
    try {
      chain ??= build(window);

      if (chain.context.state !== 'running') {
        chain.context.resume().catch(() => {});
      }
    } catch {
      chain = null;
    }
  }

  return {
    unlock,

    play(name, transpose = 0) {
      if (chain && settings.sound) {
        for (const voice of SOUNDS[name]) {
          playVoice(chain.context, chain.master, voice, {
            at: chain.context.currentTime,
            transpose,
          });
        }
      }
    },

    startMusic() {
      if (chain && settings.music) {
        chain.music.start();
      }
    },

    stopMusic: () => chain?.music.stop(),
    hurryMusic: (rate) => chain?.music.setRate(rate),
    suspend: () => chain?.context.suspend().catch(() => {}),
    resume: () => chain?.context.resume().catch(() => {}),
  };
}
