import { createAudio } from '../audio/index.js';
import { persistencePorts, loadSaved } from '../platform/persistence.js';
import { createGame } from '../sim/create-game.js';
import { placeOnTitle } from '../sim/stage/flow.js';

function vibrate(navigator, pattern) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    return;
  }
}

export function createSession({ window }) {
  const coarsePointer = !!window.matchMedia?.('(pointer:coarse)').matches;
  const saved = loadSaved(window.localStorage, coarsePointer);
  const ports = { audio: null };
  const game = createGame({
    ...saved,
    device: { coarsePointer, touchUsed: false },
    io: {
      ...persistencePorts(window.localStorage),
      sfx: (key, big, options) => ports.audio.sfx(key, big, options),
      announce: (line) => ports.audio.announce(line),
      setMuted: () => ports.audio.syncVolumes(),
      vibrate: (pattern) => vibrate(window.navigator, pattern),
    },
  });
  ports.audio = createAudio(game);
  placeOnTitle(game);
  return { game, audio: ports.audio };
}
