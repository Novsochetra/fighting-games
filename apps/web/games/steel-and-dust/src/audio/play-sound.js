import { isBankSound } from './bank/definitions.js';
import { playBankSound } from './bank/play-bank-sound.js';
import { isLiveSound, LIVE_SOUNDS } from './live/live-sounds.js';
import { playOneShot } from './live/one-shot.js';
import { startTime } from './timing.js';

// a burst of the same live sound (two thorns erupting together, a herd of stags) plays once
const MERGE_SECONDS = 0.035;

function playLiveSound(audio, key) {
  const start = startTime(audio, 0.005);
  if (!isLiveSound(key) || start - (audio.liveStarts[key] ?? -1) < MERGE_SECONDS) {
    return;
  }
  audio.liveStarts[key] = start;
  try {
    playOneShot(audio, (live) => LIVE_SOUNDS[key](live, start));
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
