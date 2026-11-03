const GESTURES = ['pointerdown', 'touchend', 'keydown'];

// browsers start sound only inside a gesture, and an iPhone call or app switch needs another, so
// every gesture tries; once running it costs nothing
export function installAudioUnlock(target, audio) {
  const unlock = () => audio.unlock();

  for (const type of GESTURES) {
    target.addEventListener(type, unlock, { passive: true });
  }

  return () => {
    for (const type of GESTURES) {
      target.removeEventListener(type, unlock);
    }
  };
}
