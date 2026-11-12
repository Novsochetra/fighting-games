import { openRig } from './rig.js';
import { voicesFor } from './strikes.js';
import { playVoice } from './voice.js';

// a phone may refuse (a call in progress); the next tap asks again
const settle = (asked) => Promise.resolve(asked).catch(() => {});

// A context that has yet to start plays what the first tap asked for as soon as it does. One that
// stopped later (the page hidden, a phone call) would play all it missed in one burst when it woke.
function isListening(rig) {
  const running = rig.context.state === 'running';

  rig.hasRun = rig.hasRun || running;

  return running || !rig.hasRun;
}

export function createAudio({ window, settings }) {
  let rig = null;

  function resume() {
    if (rig && rig.context.state !== 'running') {
      settle(rig.context.resume());
    }
  }

  function unlock() {
    rig = rig || openRig(window);
    resume();
  }

  function suspend() {
    if (rig && rig.context.state === 'running') {
      settle(rig.context.suspend());
    }
  }

  function play(name, detail = {}) {
    if (!rig || !settings.sound || !isListening(rig)) {
      return;
    }

    const now = rig.context.currentTime;

    for (const voice of voicesFor(name, detail)) {
      playVoice(rig, voice, now);
    }
  }

  return { unlock, play, suspend, resume };
}
