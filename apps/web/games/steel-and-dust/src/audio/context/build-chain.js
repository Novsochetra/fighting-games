import { crunchCurve, softClipCurve } from './shaper-curves.js';
import { createImpulseResponse, createNoiseBuffer } from './impulse-response.js';

const SOFT_CLIP = softClipCurve();
const CRUNCH = crunchCurve();

function compressor(context, { threshold, knee, ratio, attack, release }) {
  const node = context.createDynamicsCompressor();
  node.threshold.value = threshold;
  node.knee.value = knee;
  node.ratio.value = ratio;
  node.attack.value = attack;
  node.release.value = release;
  return node;
}

function highShelf(context, frequency, decibels) {
  const node = context.createBiquadFilter();
  node.type = 'highshelf';
  node.frequency.value = frequency;
  node.gain.value = decibels;
  return node;
}

function gain(context, value) {
  const node = context.createGain();
  if (value !== undefined) {
    node.gain.value = value;
  }
  return node;
}

function connectChain(...nodes) {
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }
}

// the music and the master: a soft top-end roll-off, a compressor, then the soft clip
function buildMaster(context) {
  const squeeze = compressor(context, {
    threshold: -16,
    knee: 14,
    ratio: 4,
    attack: 0.002,
    release: 0.2,
  });
  // takes the fizz off the top
  const tone = highShelf(context, 6500, -5);
  const out = context.createWaveShaper();
  out.curve = SOFT_CLIP;
  out.connect(context.destination);
  const master = gain(context);
  connectChain(master, tone, squeeze, out);
  const reverb = context.createConvolver();
  reverb.buffer = createImpulseResponse(context, 1.0, 3.5);
  connectChain(reverb, gain(context, 0.5), master);
  return { master, out, reverb };
}

// effects have their own gentler compressor: the first crack of a hit gets through, and a burst of
// hits no longer pumps the music
function buildEffects(context, out) {
  const squeeze = compressor(context, {
    threshold: -12,
    knee: 8,
    ratio: 3,
    attack: 0.006,
    release: 0.12,
  });
  const tone = highShelf(context, 9000, -2);
  const effectsBus = gain(context);
  const effectsOut = gain(context, 0.9);
  connectChain(effectsBus, tone, squeeze, effectsOut, out);
  return { effectsBus, effectsOut };
}

// a dotted-eighth echo for the music's arpeggio and lead
function buildEcho(context, musicBus) {
  const echoInput = gain(context);
  const delay = context.createDelay(1);
  delay.delayTime.value = 0.33;
  const feedback = gain(context, 0.32);
  const darken = context.createBiquadFilter();
  darken.type = 'lowpass';
  darken.frequency.value = 2400;
  const wet = gain(context, 0.38);
  connectChain(echoInput, delay, darken, feedback, delay);
  connectChain(darken, wet, musicBus);
  return echoInput;
}

export function buildChain(context) {
  const { master, out, reverb } = buildMaster(context);
  const { effectsBus, effectsOut } = buildEffects(context, out);
  const musicBus = gain(context);
  musicBus.connect(master);
  connectChain(effectsBus, gain(context, 0.05), reverb);
  connectChain(musicBus, gain(context, 0.12), reverb);
  const echoInput = buildEcho(context, musicBus);
  const noiseBuffer = createNoiseBuffer(context);
  return { master, effectsBus, effectsOut, musicBus, echoInput, noiseBuffer, crunchCurve: CRUNCH };
}
