import { finish } from '../synth/finish.js';
import { createTrack } from '../synth/track.js';
import { SOUND_DEFINITIONS } from './definitions.js';

// one take of a bank sound, finished: what the bank copies into an AudioBuffer
export function synthesizeTake(key, { pitch, take, sampleRate }) {
  const definition = SOUND_DEFINITIONS[key];
  const track = createTrack(Math.ceil(definition.seconds * sampleRate), sampleRate);
  const shape = definition.build(track, pitch, take) || {};
  finish(track, shape);
  return track.samples;
}
