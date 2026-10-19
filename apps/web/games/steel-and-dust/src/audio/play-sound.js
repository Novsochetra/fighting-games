import { isBankSound } from './bank/definitions.js';
import { playBankSound } from './bank/play-bank-sound.js';
import { isLiveSound, LIVE_SOUNDS } from './live/live-sounds.js';
import { startTime } from './timing.js';

function playLiveSound(audio, key) {
  if (!isLiveSound(key)) {
    return;
  }
  try {
    LIVE_SOUNDS[key](audio, startTime(audio, 0.005));
  } catch {
    // a node the browser refuses must not stop the game
  }
}

// a bank sound (big picks its heavy version when there is one) or a live menu or event sound
export function playSound(audio, game, { key, big, options }) {
  const { context } = audio;
  if (!context || game.muted || context.state !== 'running') {
    return;
  }
  if (isBankSound(key)) {
    const bigKey = `${key}Big`;
    playBankSound(audio, game, big && isBankSound(bigKey) ? bigKey : key, options || {});
    return;
  }
  playLiveSound(audio, key);
}
