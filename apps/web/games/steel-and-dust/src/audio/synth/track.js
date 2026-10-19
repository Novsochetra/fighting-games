export function createTrack(length, sampleRate) {
  return { samples: new Float32Array(length), sampleRate };
}
