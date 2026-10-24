import { createBank } from '../bank/bank.js';
import { buildChain } from './build-chain.js';
import { applyVolumes } from './volumes.js';

const WARM_UP_DELAY_MS = 60;

function createContext() {
  try {
    // iPhone: play like a music app, so the sound is not cut by the silent switch (Safari 17+)
    if (globalThis.navigator?.audioSession) {
      globalThis.navigator.audioSession.type = 'playback';
    }
  } catch {
    // older WebKit exposes audioSession read-only; the context still works
  }
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  return new AudioContextClass({ latencyHint: 'interactive' });
}

function start(audio, game) {
  try {
    audio.context = createContext();
    audio.chain = buildChain(audio.context);
    applyVolumes(audio.chain, game);
    audio.bank = createBank(audio.context);
    setTimeout(audio.bank.warm, WARM_UP_DELAY_MS);
  } catch {
    // no Web Audio here: the game runs silent
    audio.context = null;
    audio.chain = null;
    audio.bank = null;
  }
}

// a silent sample played inside the tap wakes iOS audio
function playSilence(context) {
  try {
    const silence = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = silence;
    source.connect(context.destination);
    source.start(0);
  } catch {
    // the resume above is the real unlock; the silent sample only helps iOS
  }
}

// 'suspended' before the first tap, 'interrupted' after a call or an app switch on iPhone
export function unlockAudio(audio, game) {
  if (!audio.context) {
    start(audio, game);
  }
  if (audio.context && audio.context.state !== 'running') {
    audio.context.resume().catch(() => {});
    playSilence(audio.context);
  }
}

export function resumeAudio(audio) {
  if (audio.context && audio.context.state !== 'running') {
    audio.context.resume().catch(() => {});
  }
}

export function suspendAudio(audio) {
  if (audio.context && audio.context.state === 'running') {
    audio.context.suspend().catch(() => {});
  }
}
