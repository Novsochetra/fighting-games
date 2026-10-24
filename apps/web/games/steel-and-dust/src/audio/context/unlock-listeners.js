// phones only let a page start sound from certain gestures: a finger lifting (touchend /
// pointerup), a click or a key press. pointerdown alone is not enough there, so try again on every
// one of these until the audio is running
const GESTURES = ['touchend', 'pointerup', 'click', 'keydown'];

export function installAudioUnlock(target, audio) {
  const retry = () => {
    if (audio.debugState().state !== 'running') {
      audio.unlock();
    }
  };
  for (const type of GESTURES) {
    target.addEventListener(type, retry, { capture: true, passive: true });
  }
  // a running context keeps iOS's 'playback' audio session, and the phone's audio hardware, busy
  // after Safari goes to the background
  target.document.addEventListener('visibilitychange', () => {
    if (target.document.hidden) {
      audio.suspend();
    } else {
      audio.resume();
    }
  });
}
