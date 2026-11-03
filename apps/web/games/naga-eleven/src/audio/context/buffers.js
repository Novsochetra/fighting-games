export function createNoiseBuffer(context, seconds = 1) {
  const buffer = context.createBuffer(
    1,
    Math.floor(context.sampleRate * seconds),
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// a crowd far off: noise darkened to voices, swelling and settling as many people talk at once
export function createMurmurBuffer(context, seconds = 3) {
  const buffer = createNoiseBuffer(context, seconds);
  const data = buffer.getChannelData(0);
  const rate = context.sampleRate;
  const turn = Math.PI * 2;
  const swells = [0.31, 0.77, 1.43].map((speed) => ({ speed, phase: Math.random() * turn }));
  let darkened = 0;
  let loudest = 0;

  for (let i = 0; i < data.length; i += 1) {
    const time = i / rate;
    const swell = swells.reduce(
      (sum, wave) => sum + Math.sin(wave.phase + time * wave.speed * turn),
      0,
    );

    darkened += (data[i] - darkened) * 0.09;
    data[i] = darkened * (1 + swell * 0.12);
    loudest = Math.max(loudest, Math.abs(data[i]));
  }

  for (let i = 0; i < data.length; i += 1) {
    data[i] = loudest > 0 ? (data[i] / loudest) * 0.9 : 0;
  }

  return buffer;
}
