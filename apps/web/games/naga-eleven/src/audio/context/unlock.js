import { AUDIO } from '../../data/audio.js';
import { pumpMusic } from '../music/player.js';
import { buildChain } from './chain.js';
import { applyVolumes } from './volumes.js';

// iPhone: play like a music app, so the silent switch does not cut the game's sound (Safari 17+)
function playThroughSilentSwitch(navigator) {
  try {
    if (navigator?.audioSession) {
      navigator.audioSession.type = 'playback';
    }
  } catch {
    // older WebKit has audioSession read-only; the context plays all the same
  }
}

function startContext(audio) {
  try {
    playThroughSilentSwitch(audio.navigator);
    audio.context = new audio.AudioContext({ latencyHint: 'interactive' });
    audio.chain = buildChain(audio.context);
    applyVolumes(audio);
    audio.pump = audio.timers.setInterval(() => pumpMusic(audio), AUDIO.pumpMs);
  } catch {
    // no Web Audio here, or the browser refused it: the game plays on silent
    audio.context = null;
    audio.chain = null;
  }
}

// a silent sample played inside the tap is what wakes audio on iOS
function playSilence(context) {
  const source = context.createBufferSource();

  source.buffer = context.createBuffer(1, 1, context.sampleRate);
  source.connect(context.destination);
  source.start(0);
}

function wake(context) {
  try {
    context.resume()?.catch?.(() => {});
    playSilence(context);
  } catch {
    // a context that will not wake stays silent; the next tap tries again
  }
}

// 'suspended' before the first tap, 'interrupted' after a call or an app switch on iPhone
export function unlockAudio(audio) {
  if (!audio.context && audio.AudioContext) {
    startContext(audio);
  }

  if (audio.context && audio.context.state !== 'running') {
    wake(audio.context);
  }

  pumpMusic(audio);
}

export function pauseAudio(audio) {
  try {
    audio.context?.suspend()?.catch?.(() => {});
  } catch {
    // a context already closed has nothing to pause
  }
}

export function resumeAudio(audio) {
  if (audio.context && audio.context.state !== 'running') {
    wake(audio.context);
  }
}
