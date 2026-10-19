// decaying stereo noise, darkened with a one-pole filter: a small room for the reverb send
export function createImpulseResponse(context, seconds, decay) {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let smoothed = 0;
    for (let i = 0; i < length; i++) {
      smoothed += (Math.random() * 2 - 1 - smoothed) * 0.35;
      data[i] = smoothed * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

export function createNoiseBuffer(context) {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}
