import { VIEW_WIDTH } from '../../config.js';
import { clamp } from '../../lib/math.js';
import { startTime, vary } from '../timing.js';
import { SOUND_DEFINITIONS } from './definitions.js';
import { chooseTake, isDuplicate, planRoom, pruneFinished } from './voice-pool.js';

export function stopVoice(audio, voice) {
  try {
    voice.volume.gain.setTargetAtTime(0, audio.context.currentTime, 0.006);
    voice.source.stop(audio.context.currentTime + 0.04);
  } catch {
    // a source that already stopped throws; it is gone either way
  }
  const index = audio.voices.indexOf(voice);
  if (index >= 0) {
    audio.voices.splice(index, 1);
  }
}

// heard where it happens on screen; swings and dashes travel the way they go
function stereoPanner(audio, game, { x, dir, start, travel }) {
  const panner = audio.context.createStereoPanner();
  const center = clamp(((x - game.camera.x) / VIEW_WIDTH) * 2 - 1, -1, 1) * 0.55;
  if (dir) {
    panner.pan.setValueAtTime(clamp(center - dir * 0.25, -1, 1), start);
    panner.pan.linearRampToValueAtTime(clamp(center + dir * 0.25, -1, 1), start + travel);
  } else {
    panner.pan.value = center;
  }
  return panner;
}

function startVoice(audio, game, { definition, buffer, start, options }) {
  const { context } = audio;
  const source = context.createBufferSource();
  const volume = context.createGain();
  const rate = (options.rate || 1) * vary(0.035);
  source.buffer = buffer;
  source.playbackRate.value = rate;
  volume.gain.value = definition.level * (options.vol || 1);
  source.connect(volume);
  let out = volume;
  if (options.x !== undefined && context.createStereoPanner) {
    const travel = (buffer.duration / rate) * 0.8;
    out = stereoPanner(audio, game, { x: options.x, dir: options.dir, start, travel });
    volume.connect(out);
  }
  out.connect(audio.chain.effectsBus);
  source.start(start);
  return { source, volume, end: start + buffer.duration / source.playbackRate.value };
}

// options: { vol, rate, take, x (where on the map), dir (which way it travels) }
export function playBankSound(audio, game, key, options) {
  const takes = audio.bank.get(key);
  if (!takes) {
    return;
  }
  const definition = SOUND_DEFINITIONS[key];
  const { group, priority } = definition;
  const start = startTime(audio, 0.008);
  pruneFinished(audio.voices, audio.context.currentTime);
  if (isDuplicate(audio.voices, { key, group, start })) {
    return;
  }
  const room = planRoom(audio.voices, definition);
  room.steal.forEach((voice) => stopVoice(audio, voice));
  if (!room.play) {
    return;
  }
  const last = audio.lastTakes[key];
  const roll = Math.random();
  const count = takes.length;
  const take = chooseTake(audio.voices, { key, count, last, requested: options.take, roll });
  audio.lastTakes[key] = take;
  const playing = startVoice(audio, game, { definition, buffer: takes[take], start, options });
  audio.voices.push({ ...playing, key, take, group, priority, start });
}
