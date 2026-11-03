import { CROWD } from '../../data/audio.js';
import { bedLevelOf } from '../hear/crowd-mood.js';

// a change smaller than this is not worth an automation event; the hear call runs every tick
const STEP = 0.02;
const FOLLOW_SECONDS = 0.6;

const clampShare = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

function startBed({ context, chain }) {
  const source = context.createBufferSource();
  const band = context.createBiquadFilter();
  const level = context.createGain();

  source.buffer = chain.murmur;
  source.loop = true;
  band.type = 'bandpass';
  band.frequency.value = 700;
  band.Q.value = 0.5;
  level.gain.value = 0;
  source.connect(band);
  band.connect(level);
  level.connect(chain.crowd);
  source.start(context.currentTime, Math.random() * chain.murmur.duration);

  return { source, level, nodes: [source, band, level], value: 0 };
}

function stopBed(audio) {
  const { bed, context } = audio;
  const now = context.currentTime;

  bed.level.gain.setTargetAtTime(0, now, 0.3);
  bed.source.stop(now + 2);
  bed.source.onended = () => bed.nodes.forEach((node) => node.disconnect());
  audio.bed = null;
}

function followBed(audio, wanted) {
  if (wanted <= 0) {
    if (audio.bed) {
      stopBed(audio);
    }

    return;
  }

  audio.bed ??= startBed(audio);

  if (Math.abs(audio.bed.value - wanted) < STEP) {
    return;
  }

  audio.bed.value = wanted;
  audio.bed.level.gain.setTargetAtTime(
    wanted * CROWD.bedPeak,
    audio.context.currentTime,
    FOLLOW_SECONDS,
  );
}

// the crowd's ambient bed, started when it is first wanted and stopped when it is not
export function setBed(audio, wanted) {
  if (!audio.chain) {
    return;
  }

  try {
    followBed(audio, wanted);
  } catch {
    // a crowd the browser will not play is a quiet stadium, never a stopped game
  }
}

export const updateBed = (audio) => setBed(audio, bedLevelOf(audio.crowdLevel, audio.excitement));

// the venue's crowd, 0 (nobody) to 1 (a full world stadium)
export function setCrowdLevel(audio, level) {
  audio.crowdLevel = clampShare(level);
  updateBed(audio);
}
