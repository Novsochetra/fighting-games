import { AUDIO } from '../../data/audio.js';
import { createMurmurBuffer, createNoiseBuffer } from './buffers.js';

function gainOf(context, value, destination) {
  const node = context.createGain();

  node.gain.value = value;
  node.connect(destination);

  return node;
}

// a gentle squeeze before the speaker, so a goal's roar over the music never clips
function compressorOf(context) {
  const node = context.createDynamicsCompressor();

  node.threshold.value = -14;
  node.knee.value = 12;
  node.ratio.value = 4;
  node.attack.value = 0.004;
  node.release.value = 0.25;
  node.connect(context.destination);

  return node;
}

// effects and the crowd under the sound volume, every theme through the duck under the music volume
export function buildChain(context) {
  const master = gainOf(context, 1, compressorOf(context));
  const effects = gainOf(context, 0, master);
  const music = gainOf(context, 0, master);

  return {
    master,
    effects,
    crowd: gainOf(context, AUDIO.levels.crowd, effects),
    music,
    duck: gainOf(context, 1, music),
    noise: createNoiseBuffer(context, 1),
    murmur: createMurmurBuffer(context, 3),
  };
}
