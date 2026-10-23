import { clearCall, startCall } from '../data/mission-handoff.js';
import { MISSIONS } from '../data/missions/index.js';
import { startTime } from './timing.js';

const CLIPS = 'assets/audio/announcer/';
const VOLUME = 0.9;

// the announcer's calls are the one recorded sound: oscillators and noise cannot say words
export function createAnnouncer() {
  return { clips: new Map(), loadedFor: null, playing: null };
}

// a call is fetched and decoded once; one still on its way, or one that failed, stays silent
function loadCall(audio, announcer, call) {
  if (announcer.clips.has(call)) {
    return;
  }
  announcer.clips.set(call, null);
  Promise.resolve()
    .then(() => globalThis.fetch(`${CLIPS}${call}.mp3`))
    .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(response.status)))
    .then((data) => audio.context.decodeAudioData(data))
    .then((clip) => announcer.clips.set(call, clip))
    .catch(() => {});
}

// a mission's own calls and the next one's start come in while it is played, as its road does
export function preloadCalls(audio, announcer, game) {
  const index = game.missionIndex;
  if (!audio.context || announcer.loadedFor === index) {
    return;
  }
  announcer.loadedFor = index;
  const next = MISSIONS[index + 1];
  const calls = [
    startCall(index + 1),
    clearCall(index + 1),
    ...(next ? [startCall(index + 2)] : []),
  ];
  calls.forEach((call) => loadCall(audio, announcer, call));
}

function stopPlaying(announcer) {
  try {
    announcer.playing?.stop();
  } catch {
    // it had already ended
  }
}

// through the effects bus, so it keeps to the sound effects volume and stands in the same room
export function playCall(audio, announcer, { game, call }) {
  const clip = announcer.clips.get(call);
  if (!clip || !audio.chain || game.muted || audio.context.state !== 'running') {
    return;
  }
  stopPlaying(announcer);
  const source = audio.context.createBufferSource();
  const gain = audio.context.createGain();
  source.buffer = clip;
  gain.gain.value = VOLUME;
  source.connect(gain).connect(audio.chain.effectsBus);
  source.onended = () => {
    gain.disconnect();
    if (announcer.playing === source) {
      announcer.playing = null;
    }
  };
  source.start(startTime(audio, 0.005));
  announcer.playing = source;
}
