const SVG = 'http://www.w3.org/2000/svg';
const SKYLINE_HEIGHT = 26;

export function svgShape(document, tag, attributes) {
  const shape = document.createElementNS(SVG, tag);

  Object.entries(attributes).forEach(([name, value]) => shape.setAttribute(name, value));

  return shape;
}

// mulberry32, seeded, so every render paints the same night
export function seededRandom(seed) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;

    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);

    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function moonOf({ width, horizon, unit }) {
  const radius = unit * 5.5;

  return { cx: width * 0.84, cy: horizon * 0.36 + radius, radius, halo: radius + unit * 5 };
}

function paintMoon(document, svg, moon) {
  const rings = [
    [moon.halo, 'moon-halo'],
    [moon.radius + (moon.halo - moon.radius) * 0.4, 'moon-halo'],
    [moon.radius, 'moon'],
  ];

  for (const [radius, className] of rings) {
    svg.append(
      svgShape(document, 'circle', { cx: moon.cx, cy: moon.cy, r: radius, class: className }),
    );
  }
}

function paintStars(document, svg, frame) {
  const { width, height, horizon } = frame;
  const moon = moonOf(frame);
  const random = seededRandom(7);
  const count = Math.round((width * height) / 5200);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  for (let i = 0; i < count; i++) {
    const star = { cx: random() * width, cy: random() * horizon * 0.7, r: 0.6 + random() * 1.1 };

    if (Math.hypot(star.cx - moon.cx, star.cy - moon.cy) > moon.halo) {
      svg.append(svgShape(document, 'circle', { ...star, class: 'star' }));
    }
  }

  paintMoon(document, svg, moon);
}

const wat = (cx) =>
  [
    `M${cx - 8} 26 V18 H${cx + 8} V26 Z`,
    `M${cx - 12} 15.5 L${cx - 10.5} 18 H${cx + 10.5} L${cx + 12} 15.5 L${cx + 6} 12 H${cx - 6} Z`,
    `M${cx - 8} 9.5 L${cx - 6.5} 12 H${cx + 6.5} L${cx + 8} 9.5 L${cx + 3.5} 7 H${cx - 3.5} Z`,
    `M${cx - 1.2} 7 L${cx} 0 L${cx + 1.2} 7 Z`,
  ].join(' ');

function sugarPalm(cx, top) {
  const fronds = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * Math.PI * 2;
    const reach = i % 2 === 0 ? 4.4 : 1.6;

    return `${cx + Math.cos(angle) * reach} ${top + Math.sin(angle) * reach * 0.8}`;
  });

  return `M${cx - 0.35} 26 L${cx - 0.25} ${top} H${cx + 0.25} L${cx + 0.35} 26 Z M${fronds.join(' L')} Z`;
}

function farRoofs(width, random) {
  const roofs = [];

  for (let x = -4; x < width; x += 5 + random() * 7) {
    const span = 6 + random() * 6;
    const eave = 18 + random() * 4;

    roofs.push(`M${x} 26 V${eave} L${x + span / 2} ${eave - 3} L${x + span} ${eave} V26 Z`);
  }

  return roofs.join(' ');
}

function paintSkyline(document, svg, width) {
  const random = seededRandom(11);
  const spots = width < 80 ? [0.06, 0.55] : [0.08, 0.17, 0.62, 0.72, 0.95];
  const palms = spots.map((at, i) => sugarPalm(width * at, 6 + (i % 3) * 3));

  svg.setAttribute('viewBox', `0 0 ${width} ${SKYLINE_HEIGHT}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
  svg.append(svgShape(document, 'path', { d: farRoofs(width, random), class: 'far' }));
  svg.append(
    svgShape(document, 'path', { d: wat(width * (width < 80 ? 0.3 : 0.36)), class: 'far' }),
  );
  svg.append(svgShape(document, 'path', { d: palms.join(' '), class: 'near' }));
}

export function paintSky(document, frame) {
  const skyline = document.getElementById('skyline');
  const box = skyline.getBoundingClientRect();

  paintStars(document, document.getElementById('stars'), frame);

  if (box.height <= 0) {
    throw new Error('the skyline has no height');
  }

  paintSkyline(document, skyline, (box.width / box.height) * SKYLINE_HEIGHT);
}
