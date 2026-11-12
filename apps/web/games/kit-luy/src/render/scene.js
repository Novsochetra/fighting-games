const HORIZON = 0.86;
const STAR_AREA = 320;
const STARS_DOWN_TO = 0.6;
const MOTES = 14;
const PALM_CHANCE = 0.45;

const between = (random, low, high) => low + random() * (high - low);
const whole = (random, low, high) => Math.round(between(random, low, high));

function starsOf(random, { width, height }) {
  const count = Math.round((width * height * STARS_DOWN_TO) / STAR_AREA);

  return Array.from({ length: count }, () => ({
    x: whole(random, 0, width - 1),
    y: whole(random, 0, height * STARS_DOWN_TO),
    phase: between(random, 0, Math.PI * 2),
    speed: between(random, 0.6, 2.2),
  }));
}

function marketOf(random, width) {
  const stalls = [];
  const palms = [];

  for (let x = whole(random, -8, 0); x < width;) {
    const stall = { x, width: whole(random, 16, 26), height: whole(random, 10, 18) };
    const gap = whole(random, 3, 9);

    stalls.push(stall);

    if (random() < PALM_CHANCE) {
      palms.push({ x: x + stall.width + Math.floor(gap / 2), height: whole(random, 20, 32) });
    }

    x += stall.width + gap;
  }

  return { stalls, palms };
}

const motesOf = (random, { width, height }) =>
  Array.from({ length: MOTES }, () => ({
    x: whole(random, 0, width - 1),
    y: between(random, 0, height),
    speed: between(random, 2, 7),
    phase: between(random, 0, Math.PI * 2),
  }));

export function buildScene(random, { width, height }) {
  return {
    width,
    height,
    horizon: Math.round(height * HORIZON),
    stars: starsOf(random, { width, height }),
    ...marketOf(random, width),
    motes: motesOf(random, { width, height }),
    strings: [
      { y: Math.round(height * 0.07), sag: 7 },
      { y: Math.round(height * 0.13), sag: 10 },
    ],
  };
}

const BULB_SPACING = 8;

export function bulbsOf(scene, string) {
  const count = Math.floor(scene.width / BULB_SPACING);

  return Array.from({ length: count }, (_, i) => {
    const x = Math.round((i + 0.5) * BULB_SPACING);
    const across = (x / scene.width) * 2 - 1;

    return { x, y: Math.round(string.y + string.sag * (1 - across * across)), index: i };
  });
}
