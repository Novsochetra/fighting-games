import { asCurve, toPairs } from './curves.js';
import { applyFormants, createFormants, retuneFormants } from './voice-formants.js';
import { advanceGlottis, createGlottis, glottalSlope, retargetWander } from './voice-source.js';

const BANDWIDTHS = [80, 100, 150, 220, 280];
const DEFAULT_VIBRATO = { rate: 5.5, depth: 0.012 };

function voiceShape(params, sampleRate) {
  return {
    period: 1 / sampleRate,
    pitch: asCurve(params.pitch),
    envelope: asCurve(params.envelope),
    breath: asCurve(params.breath || 0),
    rough: asCurve(params.rough || 0),
    sub: asCurve(params.sub || 0),
    openQuotient: asCurve(params.openQuotient || 0.6),
    vowels: toPairs(params.vowels),
    formantScale: params.formantScale || 1,
    pitchScale: params.pitchScale || 1,
    vibrato: params.vibrato || DEFAULT_VIBRATO,
    bandwidths: BANDWIDTHS.map((bandwidth) => bandwidth * (params.bandwidthScale || 1)),
    wander: params.wander || 0.012,
    jitter: params.jitter || 0.008,
  };
}

function voiceSample(voicing, shape, time) {
  const { glottis } = voicing;
  const step = advanceGlottis(glottis, shape, time);
  const slope = glottalSlope(glottis, shape.openQuotient(time), step);
  const breath = (Math.random() * 2 - 1) * shape.breath(time) * (0.35 + 0.65 * glottis.flow);
  const x = applyFormants(voicing.formants, slope * glottis.shimmer + breath);
  voicing.roughPhase += 6.2832 * (55 + 25 * Math.sin(time * 7.3)) * shape.period;
  // rough shakes the level 30 to 80 times a second, the rasp of a real scream
  const rasp = 1 - shape.rough(time) * 0.5 * (1 + Math.sin(voicing.roughPhase));
  return x * shape.envelope(time) * rasp;
}

// a voice: a glottal pulse with a slow pitch wander, vibrato, jitter and shimmer, through five
// formant resonators that glide between vowels. breath is puffed out with each pulse; sub makes
// every other pulse weaker, the crackle at the end of a shout
export function voice(track, params) {
  const { samples, sampleRate } = track;
  const first = Math.round((params.start || 0) * sampleRate);
  const count = Math.min(samples.length - first, Math.ceil(params.length * sampleRate));
  const shape = voiceShape(params, sampleRate);
  const voicing = {
    glottis: createGlottis(),
    formants: createFormants(),
    roughPhase: Math.random() * 6.28,
  };
  for (let i = 0; i < count; i++) {
    const time = i * shape.period;
    if ((i & 15) === 0) {
      retuneFormants(voicing.formants, shape, time);
      retargetWander(voicing.glottis, shape, time);
    }
    samples[first + i] += voiceSample(voicing, shape, time);
  }
}
