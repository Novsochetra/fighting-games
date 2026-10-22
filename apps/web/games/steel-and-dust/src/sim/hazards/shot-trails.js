import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';

function sparkTrail(game, shot) {
  if (shot.time % 2 === 0) {
    game.particles.push({
      kind: 'spark',
      x: shot.x - shot.direction * 6,
      y: shot.y + randomBetween(-12, 12),
      vx: -shot.direction * randomBetween(0.5, 1.5),
      vy: 0,
      life: 10,
      maxLife: 14,
      color: shot.color,
    });
  }
}

function streakTrail(every, length) {
  return (game, shot) => {
    if (shot.time % every === 0) {
      game.particles.push({
        kind: 'streak',
        x: shot.x - shot.direction * 4,
        y: shot.y,
        vx: -shot.direction * 0.6,
        vy: 0,
        life: 8,
        maxLife: 8,
        length,
      });
    }
  };
}

function sandTrail(game, shot) {
  if (shot.time % 2 === 0) {
    game.particles.push({
      kind: 'dust',
      x: shot.x - shot.direction * randomBetween(2, 10),
      y: shot.y + randomBetween(-14, 12),
      vx: -shot.direction * randomBetween(0.2, 0.8),
      vy: randomBetween(-0.5, 0.2),
      life: randomBetween(10, 18) | 0,
      maxLife: 18,
      size: 2,
      color: shot.time % 4 ? FX_COLORS.mirage : FX_COLORS.mirageDust,
    });
  }
}

function fuseTrail(game, shot) {
  if (shot.time % 3 === 0) {
    game.particles.push({
      kind: 'spark',
      x: shot.x,
      y: shot.y - 3,
      vx: randomBetween(-0.4, 0.4),
      vy: randomBetween(-0.8, -0.2),
      life: 8,
      maxLife: 10,
      color: COLORS.orange,
    });
  }
}

function emberTrail(game, shot) {
  if (shot.time % 3 === 0) {
    game.particles.push({
      kind: 'spark',
      x: shot.x + randomBetween(-14, 14),
      y: shot.y - randomBetween(0, 6),
      vx: randomBetween(-0.2, 0.2),
      vy: randomBetween(-1.2, -0.5),
      life: randomBetween(8, 16) | 0,
      maxLife: 16,
      color: shot.time % 2 ? COLORS.tangerine : COLORS.gold,
    });
  }
}

// the glob sheds drops that fall away behind it
function venomTrail(game, shot) {
  if (shot.time % 3 === 0) {
    game.particles.push({
      kind: 'dust',
      x: shot.x - shot.direction * randomBetween(2, 5),
      y: shot.y + randomBetween(-1, 2),
      vx: -shot.direction * 0.2,
      vy: randomBetween(0.3, 0.8),
      life: 14,
      maxLife: 14,
      size: 1,
      color: shot.time % 2 ? FX_COLORS.venom : FX_COLORS.venomDark,
    });
  }
}

// gravel thrown up behind a wave skimming the road
function gravelTrail(game, shot) {
  if (shot.time % 3 === 0) {
    game.particles.push({
      kind: 'dust',
      x: shot.x - shot.direction * randomBetween(6, 16),
      y: shot.y - randomBetween(0, 3),
      vx: -shot.direction * randomBetween(0.2, 0.7),
      vy: randomBetween(-1.1, -0.4),
      life: randomBetween(10, 16) | 0,
      maxLife: 16,
      size: 2,
      color: shot.time % 2 ? FX_COLORS.gravel : FX_COLORS.gravelDark,
    });
  }
}

// chips of stone crumble off a flying boulder
function rockTrail(game, shot) {
  if (shot.time % 4 === 0) {
    game.particles.push({
      kind: 'dust',
      x: shot.x + randomBetween(-4, 4),
      y: shot.y + randomBetween(-2, 4),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(0.2, 0.6),
      life: 12,
      maxLife: 12,
      size: 1,
      color: shot.time % 8 ? FX_COLORS.rock : FX_COLORS.rockDark,
    });
  }
}

const TRAILS = {
  knife: streakTrail(3, 4),
  wave: sparkTrail,
  bolt: streakTrail(1, 7),
  sand: sandTrail,
  venom: venomTrail,
  bomb: fuseTrail,
  fire: emberTrail,
  crescent: gravelTrail,
  boulder: rockTrail,
  shard: () => {},
  spike: () => {},
};

export function leaveTrail(game, shot) {
  TRAILS[shot.kind](game, shot);
}
