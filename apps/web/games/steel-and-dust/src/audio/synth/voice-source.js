// the glottal source: the vocal folds opening and snapping shut once a period. openQuotient is how
// long they stay open (lower is a pressed, shouting voice)

export function createGlottis() {
  return {
    phase: 0,
    odd: false,
    jitter: 1,
    shimmer: 1,
    wander: 0,
    wanderUntil: 0,
    wanderTarget: 0,
    flow: 0,
  };
}

export function retargetWander(glottis, shape, time) {
  if (time >= glottis.wanderUntil) {
    glottis.wanderUntil = time + 0.05;
    glottis.wanderTarget = (Math.random() * 2 - 1) * shape.wander;
  }
}

function startPulse(glottis, shape, time) {
  glottis.phase -= 1;
  glottis.odd = !glottis.odd;
  glottis.jitter = 1 + (Math.random() * 2 - 1) * shape.jitter;
  glottis.shimmer = (glottis.odd ? 1 - shape.sub(time) : 1) * (1 + (Math.random() * 2 - 1) * 0.07);
}

// advances one sample and returns the phase step (frequency / sample rate)
export function advanceGlottis(glottis, shape, time) {
  glottis.wander += (glottis.wanderTarget - glottis.wander) * 0.0015;
  const vibrato = Math.sin(time * shape.vibrato.rate * 6.2832) * shape.vibrato.depth;
  const frequency =
    shape.pitch(time) * shape.pitchScale * glottis.jitter * (1 + glottis.wander + vibrato);
  const step = frequency * shape.period;
  glottis.phase += step;
  if (glottis.phase >= 1) {
    startPulse(glottis, shape, time);
  }
  return step;
}

// rounds off the snap shut so high notes do not fizz (polyBLEP)
function smoothClosure(slope, phase, openQuotient, step) {
  let distance = phase - openQuotient;
  if (distance < 0) {
    distance += 1;
  }
  if (distance < step) {
    const ratio = distance / step;
    return slope + 0.5 * (ratio + ratio - ratio * ratio - 1);
  }
  if (distance > 1 - step) {
    const ratio = (distance - 1) / step;
    return slope + 0.5 * (ratio * ratio + ratio + ratio + 1);
  }
  return slope;
}

// the airflow slope (what the ear hears); the airflow itself is kept in glottis.flow for the breath
export function glottalSlope(glottis, openQuotient, step) {
  const { phase } = glottis;
  let slope = 0;
  glottis.flow = 0;
  if (phase < openQuotient) {
    const opening = phase / openQuotient;
    slope = opening * (2 - 3 * opening);
    glottis.flow = 6.75 * opening * opening * (1 - opening);
  }
  return smoothClosure(slope, phase, openQuotient, step);
}
