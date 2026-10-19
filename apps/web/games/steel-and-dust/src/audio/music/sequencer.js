import { playKick, playHat, playSnare } from './drums.js';
import { playArpeggio, playBass, playPad } from './instruments.js';
import { playLead } from './lead.js';

// one 16th-note step of a song at an absolute context time; index runs 0-63 over four bars
export function playStep(live, { song, index, time }) {
  const step = {
    song,
    time,
    beat: 60 / song.bpm / 4,
    position: index & 15,
    chord: song.chords[(index >> 4) & 3],
    leadBar: ((index >> 4) & 1) === 1,
    bus: live.chain.musicBus,
    echo: live.chain.echoInput,
  };
  playBass(live, step);
  playArpeggio(live, step);
  playPad(live, step);
  playLead(live, step);
  playKick(live, step);
  playSnare(live, step);
  playHat(live, step);
}
