import { randomBetween } from '../../lib/math.js';
import { SOUND_DEFINITIONS } from './definitions.js';
import { synthesizeTake } from './synthesize.js';

const SLICE_MS = 8;
const NEXT_SLICE_MS = 30;

const browserClock = {
  now: () => performance.now(),
  later: (callback, milliseconds) => setTimeout(callback, milliseconds),
};

// combat sounds are synthesized once (a few takes each) and then played as one buffer: building
// 15-20 live nodes for every hit of a fast combo made phones stutter and crackle
export function createBank(context, clock = browserClock) {
  const built = {};

  function get(key) {
    if (built[key]) {
      return built[key];
    }
    const definition = SOUND_DEFINITIONS[key];
    if (!definition) {
      return null;
    }
    const takes = [];
    for (let take = 0; take < definition.takes; take++) {
      const pitch = randomBetween(0.94, 1.06);
      const samples = synthesizeTake(key, { pitch, take, sampleRate: context.sampleRate });
      const buffer = context.createBuffer(1, samples.length, context.sampleRate);
      buffer.getChannelData(0).set(samples);
      takes.push(buffer);
    }
    built[key] = takes;
    return takes;
  }

  // builds a few sounds at a time, so the title screen never hitches
  function warm() {
    const started = clock.now();
    for (const key of Object.keys(SOUND_DEFINITIONS)) {
      if (built[key]) {
        continue;
      }
      get(key);
      if (clock.now() - started > SLICE_MS) {
        clock.later(warm, NEXT_SLICE_MS);
        return;
      }
    }
  }

  return { get, warm, builtCount: () => Object.keys(built).length };
}
