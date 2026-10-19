import { GROUND_Y } from '../../config.js';

const MAX_PARTICLES = 500;

const MOVE_PARTICLE = {
  spark(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.86;
    particle.vy *= 0.86;
  },
  dust(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.92;
    particle.vy -= 0.005;
    if (particle.life % 5 === 0 && particle.size < 5) {
      particle.size++;
    }
  },
  chunk(particle) {
    particle.vy += 0.25;
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.y > GROUND_Y) {
      particle.y = GROUND_Y;
      particle.vy *= -0.4;
      particle.vx *= 0.7;
    }
  },
  mote(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
  },
};
MOVE_PARTICLE.streak = MOVE_PARTICLE.mote;

function updateParticles(game) {
  for (const particle of game.particles) {
    particle.life--;
    MOVE_PARTICLE[particle.kind](particle);
  }
  game.particles = game.particles.filter((particle) => particle.life > 0);
  if (game.particles.length > MAX_PARTICLES) {
    game.particles.splice(0, game.particles.length - MAX_PARTICLES);
  }
}

function updateFloaters(game) {
  for (const effect of game.effects) {
    effect.time++;
  }
  game.effects = game.effects.filter((effect) => effect.time < effect.duration);
  for (const floater of game.floaters) {
    floater.time++;
    if (floater.vx && floater.time < 20) {
      floater.x += floater.vx;
    }
  }
  game.floaters = game.floaters.filter((floater) => floater.time < (floater.big ? 70 : 40));
}

function settleCamera(camera) {
  if (camera.zoom.time > 0) {
    camera.zoom.time--;
  }
  camera.kickX *= 0.75;
  camera.kickY *= 0.75;
  if (Math.abs(camera.kickX) < 0.05) {
    camera.kickX = 0;
  }
  if (Math.abs(camera.kickY) < 0.05) {
    camera.kickY = 0;
  }
}

export function updateEffects(game) {
  updateParticles(game);
  updateFloaters(game);
  if (game.comboResult && ++game.comboResult.time > 110) {
    game.comboResult = null;
  }
  if (game.weaponPopup > 0) {
    game.weaponPopup--;
  }
  if (game.hurtFlash > 0) {
    game.hurtFlash--;
  }
  settleCamera(game.camera);
}
