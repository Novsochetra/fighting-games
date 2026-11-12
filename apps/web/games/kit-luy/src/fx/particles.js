const GRAVITY = 420;
const COIN_FLIGHT = 0.24;
const COIN_HOMING = 0.34;
const SHARDS = 10;
const NOTE_LIFE = 5;

const spread = (random, reach) => (random() - 0.5) * 2 * reach;

// Positions are pixels of the art and times seconds. `banked` counts the coins that have landed
// in the pig since it was last read.
export function createFx() {
  return { particles: [], banked: 0 };
}

export function throwCoins(fx, random, { from, to, count }) {
  for (let i = 0; i < count; i++) {
    fx.particles.push({
      kind: 'coin',
      x: from.x,
      y: from.y,
      vx: spread(random, 70),
      vy: -50 - random() * 90,
      age: -i * 0.025,
      spin: random() * 6,
      to,
    });
  }
}

export function scatterShards(fx, random, at) {
  for (let i = 0; i < SHARDS; i++) {
    fx.particles.push({
      kind: 'shard',
      x: at.x,
      y: at.y,
      vx: spread(random, 90),
      vy: spread(random, 90) - 30,
      age: 0,
      life: 0.35 + random() * 0.25,
    });
  }
}

export function burstSparks(fx, random, { at, count }) {
  for (let i = 0; i < count; i++) {
    fx.particles.push({
      kind: 'spark',
      x: at.x + spread(random, 6),
      y: at.y + spread(random, 6),
      vx: spread(random, 40),
      vy: spread(random, 40),
      age: 0,
      life: 0.3 + random() * 0.3,
    });
  }
}

export function dropNotes(fx, random, { width, count }) {
  for (let i = 0; i < count; i++) {
    fx.particles.push({
      kind: 'note',
      x: random() * width,
      y: -random() * 60,
      vx: spread(random, 14),
      vy: 35 + random() * 55,
      age: 0,
      life: NOTE_LIFE,
      sway: random() * 6,
      color: i,
    });
  }
}

function fall(particle, seconds, gravity) {
  particle.vy += gravity * seconds;
  particle.x += particle.vx * seconds;
  particle.y += particle.vy * seconds;
}

function moveCoin(coin, seconds) {
  if (coin.age < COIN_FLIGHT) {
    fall(coin, seconds, GRAVITY);
    coin.from = { x: coin.x, y: coin.y };

    return true;
  }

  const share = Math.min(1, (coin.age - COIN_FLIGHT) / COIN_HOMING);
  const eased = share * share;

  coin.x = coin.from.x + (coin.to.x - coin.from.x) * eased;
  coin.y = coin.from.y + (coin.to.y - coin.from.y) * eased;

  return share < 1;
}

function moveDebris(particle, seconds) {
  fall(particle, seconds, particle.kind === 'shard' ? GRAVITY : 0);

  return particle.age < particle.life;
}

const MOVERS = { coin: moveCoin, shard: moveDebris, spark: moveDebris, note: moveDebris };

function step(fx, particle, seconds) {
  particle.age += seconds;

  if (particle.age < 0) {
    return true;
  }

  const alive = MOVERS[particle.kind](particle, seconds);

  if (!alive && particle.kind === 'coin') {
    fx.banked += 1;
  }

  return alive;
}

export function stepFx(fx, seconds) {
  fx.particles = fx.particles.filter((particle) => step(fx, particle, seconds));
}

export function takeBanked(fx) {
  const banked = fx.banked;

  fx.banked = 0;

  return banked;
}
