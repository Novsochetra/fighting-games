// The building blocks of every cue and note. A voice is { context, chain, output, nodes,
// sources, endsAt }: what it builds is kept so it can be disconnected once silent, as Safari
// otherwise keeps every node of a long session in its graph and starts to stutter.

// an exponential ramp cannot reach 0, so silence is this
export const SILENT = 0.0001;

export function createVoice({ context, chain, output }) {
  return { context, chain, output, nodes: [], sources: [], endsAt: context.currentTime };
}

function keep(voice, node) {
  voice.nodes.push(node);

  return node;
}

function keepSource(voice, node, stop) {
  voice.sources.push(node);
  voice.endsAt = Math.max(voice.endsAt, stop);

  return keep(voice, node);
}

export function gain(voice, { destination, value = 1 }) {
  const node = keep(voice, voice.context.createGain());

  node.gain.value = value;
  node.connect(destination);

  return node;
}

export function envelope(voice, { destination, start, attack = 0.004, peak, hold = 0, decay }) {
  const node = keep(voice, voice.context.createGain());
  const top = Math.max(peak, SILENT * 2);

  node.gain.setValueAtTime(SILENT, start);
  node.gain.linearRampToValueAtTime(top, start + attack);

  if (hold > 0) {
    node.gain.setValueAtTime(top, start + attack + hold);
  }

  node.gain.exponentialRampToValueAtTime(SILENT, start + attack + hold + decay);
  node.connect(destination);

  return node;
}

// each strike dies away until the next one, the last into silence
function strike(param, { time, next, level, decay }) {
  param.linearRampToValueAtTime(level, time + 0.003);

  if (next === undefined) {
    param.exponentialRampToValueAtTime(SILENT, time + decay);
  } else {
    param.exponentialRampToValueAtTime(level * 0.2, Math.min(time + decay, next - 0.001));
  }
}

// one gain struck again and again (a roll, a flurry, a run of notes): one node, not one a strike;
// every other strike is the off hand's, a little softer
export function strikes(voice, { destination, times, peak, decay }) {
  const node = keep(voice, voice.context.createGain());
  const top = Math.max(peak, SILENT * 2);

  node.gain.setValueAtTime(SILENT, times[0]);

  for (let i = 0; i < times.length; i += 1) {
    const level = i % 2 === 0 ? top : top * 0.8;

    strike(node.gain, { time: times[i], next: times[i + 1], level, decay });
  }

  node.connect(destination);

  return node;
}

export function tone(
  voice,
  { wave = 'sine', from, to = from, start, duration, destination, glide },
) {
  const node = voice.context.createOscillator();

  node.type = wave;
  node.frequency.setValueAtTime(from, start);

  if (to !== from) {
    node.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + (glide ?? duration));
  }

  node.connect(destination);
  node.start(start);
  node.stop(start + duration);

  return keepSource(voice, node, start + duration);
}

// the buffer loops from a random place, so a long wash never runs dry and two hits never match
export function noise(voice, { buffer = voice.chain.noise, start, duration, destination }) {
  const node = voice.context.createBufferSource();

  node.buffer = buffer;
  node.loop = true;
  node.connect(destination);
  node.start(start, Math.random() * buffer.duration);
  node.stop(start + duration);

  return keepSource(voice, node, start + duration);
}

export function filter(
  voice,
  { type = 'lowpass', from, to = from, resonance = 0.7, start, duration, destination },
) {
  const node = keep(voice, voice.context.createBiquadFilter());

  node.type = type;
  node.frequency.setValueAtTime(from, start);

  if (to !== from) {
    node.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + duration);
  }

  node.Q.value = resonance;
  node.connect(destination);

  return node;
}

export function wobble(voice, { param, rate, depth, start, duration, delay = 0 }) {
  const amount = keep(voice, voice.context.createGain());
  const lfo = voice.context.createOscillator();

  amount.gain.setValueAtTime(delay > 0 ? 0 : depth, start);
  amount.gain.linearRampToValueAtTime(depth, start + delay);
  amount.connect(param);
  lfo.frequency.value = rate;
  lfo.connect(amount);
  lfo.start(start);
  lfo.stop(start + duration);

  return keepSource(voice, lfo, start + duration);
}

// holds a parameter where it is now; Firefox has no cancelAndHoldAtTime, so there it is set to
// the value it reads
export function holdAt(param, time) {
  if (param.cancelAndHoldAtTime) {
    param.cancelAndHoldAtTime(time);

    return;
  }

  param.cancelScheduledValues(time);
  param.setValueAtTime(param.value, time);
}

export function releaseVoice(voice) {
  if (voice.released) {
    return;
  }

  voice.released = true;

  for (const node of voice.nodes) {
    node.disconnect();
  }
}
