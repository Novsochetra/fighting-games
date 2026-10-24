import { createAnnouncer, playCall, preloadCalls } from './announcer.js';
import { SOUND_DEFINITIONS } from './bank/definitions.js';
import { applyVolumes } from './context/volumes.js';
import { resumeAudio, suspendAudio, unlockAudio } from './context/unlock.js';
import { createMusicState, updateMusic } from './music/music-player.js';
import { playSound } from './play-sound.js';

export { SOUND_TAKES } from './bank/definitions.js';
export { synthesizeTake } from './bank/synthesize.js';
export { installAudioUnlock } from './context/unlock-listeners.js';

const SOUND_COUNT = Object.keys(SOUND_DEFINITIONS).length;

function describeState(audio) {
  const built = audio.bank ? audio.bank.builtCount() : 0;
  return {
    state: audio.context ? audio.context.state : 'none',
    voices: audio.voices.length,
    bank: `${built}/${SOUND_COUNT}`,
  };
}

// game is only read: camera.x, muted, settings.music, settings.sfx, mode, clearTime, boss,
// missionIndex
export function createAudio(game) {
  const audio = {
    context: null,
    chain: null,
    bank: null,
    voices: [],
    lastTakes: {},
    liveStarts: {},
    tickOffset: 0,
    music: createMusicState(),
    ducked: null,
  };
  const announcer = createAnnouncer();
  return {
    unlock: () => {
      unlockAudio(audio, game);
      preloadCalls(audio, announcer, game);
    },
    resume: () => resumeAudio(audio),
    suspend: () => suspendAudio(audio),
    sfx: (key, big, options) => playSound(audio, game, { key, big, options }),
    announce: (call) => playCall(audio, announcer, { game, call }),
    setTickOffset: (seconds) => {
      audio.tickOffset = seconds;
    },
    update: () => {
      updateMusic(audio, game);
      preloadCalls(audio, announcer, game);
    },
    syncVolumes: () => applyVolumes(audio.chain, game),
    debugState: () => describeState(audio),
  };
}
