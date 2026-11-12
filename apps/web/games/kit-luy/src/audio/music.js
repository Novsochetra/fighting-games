import { parseBars, stepSeconds } from './notes.js';
import { playVoice } from './voice.js';

const LOOK_AHEAD = 0.25;
const SCHEDULE_EVERY_MS = 60;
const LEAD_IN = 0.06;

function playStep({ context, output, tracks }, step, { at, length }) {
  for (const track of tracks) {
    const note = track.notes[step % track.notes.length];

    if (note !== null) {
      const voice = { ...track, note, at: 0, length: length * track.hold };

      playVoice(context, output, voice, { at });
    }
  }
}

// The tune is written a quarter second ahead of the clock, a timer topping it up, so a busy frame
// never makes it stumble. `rate` hurries it when the clock runs low.
export function createMusic({ context, output, song, timers }) {
  const state = { timer: null, step: 0, nextAt: 0, rate: 1 };
  const tracks = song.tracks.map((track) => ({ ...track, notes: parseBars(track.bars) }));

  function schedule() {
    const length = stepSeconds(song, state.rate);

    while (state.nextAt < context.currentTime + LOOK_AHEAD) {
      playStep({ context, output, tracks }, state.step, { at: state.nextAt, length });
      state.step += 1;
      state.nextAt += length;
    }
  }

  return {
    start() {
      this.stop();
      state.step = 0;
      state.rate = 1;
      state.nextAt = context.currentTime + LEAD_IN;
      state.timer = timers.setInterval(schedule, SCHEDULE_EVERY_MS);
      schedule();
    },

    stop() {
      timers.clearInterval(state.timer);
      state.timer = null;
    },

    setRate(rate) {
      state.rate = rate;
    },

    get playing() {
      return state.timer !== null;
    },
  };
}
