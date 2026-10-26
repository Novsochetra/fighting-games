import { createAudio } from '../audio/index.js';
import { createHaptics } from '../platform/haptics.js';
import { persistencePorts, loadSaved } from '../platform/persistence.js';
import { createGame } from '../sim/create-game.js';
import { placeOnTitle } from '../sim/stage/flow.js';
import { createUiState } from '../ui/ui-state.js';

export function createSession({ window }) {
  const coarsePointer = !!window.matchMedia?.('(pointer:coarse)').matches;
  const saved = loadSaved(window.localStorage, coarsePointer);
  const ports = { audio: null, haptics: null };
  const game = createGame({
    ...saved,
    device: { coarsePointer, touchUsed: false },
    io: {
      ...persistencePorts(window.localStorage),
      sfx: (key, big, options) => ports.audio.sfx(key, big, options),
      announce: (call) => ports.audio.announce(call),
      setMuted: () => ports.audio.syncVolumes(),
      vibrate: (cue) => ports.haptics.play(cue),
      now: () => Date.now(),
    },
  });
  ports.audio = createAudio(game);
  const ui = createUiState(game);
  ports.haptics = createHaptics({ navigator: window.navigator, ui });
  placeOnTitle(game);
  return { game, audio: ports.audio, ui };
}
