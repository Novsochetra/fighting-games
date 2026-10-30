import { createAudio } from '../audio/index.js';
import { createBoardApi } from '../online/board-api.js';
import { createOnlineBoard } from '../online/online-board.js';
import { createRunTicket } from '../online/run-ticket.js';
import { createHaptics } from '../platform/haptics.js';
import { persistencePorts, loadSaved } from '../platform/persistence.js';
import { createGame } from '../sim/create-game.js';
import { placeOnTitle } from '../sim/stage/flow.js';
import { createBoardPoster } from '../ui/share/board-poster.js';
import { createUiState } from '../ui/ui-state.js';

export function createSession({ window }) {
  const coarsePointer = !!window.matchMedia?.('(pointer:coarse)').matches;
  const storage = window.localStorage;
  const saved = loadSaved(storage, coarsePointer);
  const ports = { audio: null, haptics: null };
  const api = createBoardApi((address, options) => window.fetch(address, options));
  const online = createOnlineBoard({
    api,
    ticket: createRunTicket({ api, storage }),
    storage,
    drawPoster: createBoardPoster({ window, document: window.document }),
  });

  const game = createGame({
    ...saved,
    device: { coarsePointer, touchUsed: false },
    io: {
      ...persistencePorts(storage),
      sfx: (key, big, options) => ports.audio.sfx(key, big, options),
      announce: (call) => ports.audio.announce(call),
      setMuted: () => ports.audio.syncVolumes(),
      vibrate: (cue) => ports.haptics.play(cue),
      now: () => Date.now(),
      runStarted: () => online.startRun(),
    },
  });

  ports.audio = createAudio(game);
  const ui = createUiState(game);
  ports.haptics = createHaptics({ navigator: window.navigator, ui });
  placeOnTitle(game);

  return { game, audio: ports.audio, ui, online };
}
