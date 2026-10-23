function turn(particle, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const { vx, vy } = particle;
  particle.vx = vx * cos - vy * sin;
  particle.vy = vx * sin + vy * cos;
}

// a firefly darts off as it is thrown, then slows and flutters, drifting up as it blinks out
function fireflyBug(particle) {
  const age = particle.maxLife - particle.life;
  if (particle.turn) {
    turn(particle, particle.turn);
  }
  particle.vx *= particle.drag;
  particle.vy = particle.vy * particle.drag - particle.lift;
  const flutter = particle.wobble * Math.min(1, age / 6);
  particle.x += particle.vx + Math.sin(age * 0.8 + particle.seed) * flutter;
  particle.y += particle.vy + Math.cos(age * 1.1 + particle.seed) * flutter;
}

function fireflyGlint(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
}

function fireflyFlash() {}

export const FIREFLY_PARTICLE_MOVERS = { fireflyBug, fireflyGlint, fireflyFlash };
