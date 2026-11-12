// phones only let a page start sound from a finger lifting, a click or a key press, so each of
// these tries again until the audio runs
const GESTURES = ['touchend', 'pointerup', 'click', 'keydown'];

export function installAudioUnlock({ window, document, audio }) {
  for (const type of GESTURES) {
    window.addEventListener(type, audio.unlock, { capture: true, passive: true });
  }

  // a running context keeps the phone's audio hardware busy after the browser goes to the back
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
    } else {
      audio.resume();
    }
  });
}
