export function addRing(game, { x, y, color, big }) {
  game.effects.push({ kind: 'ring', x, y, time: 0, duration: big ? 16 : 12, color, big });
}

export function addSpeedLines(game, x, y) {
  game.effects.push({
    kind: 'lines',
    x,
    y,
    time: 0,
    duration: 9,
    seed: (Math.random() * 1000) | 0,
  });
}

export function addImpact(game, { x, y, big, color, bladed, direction }) {
  game.effects.push({
    kind: 'impact',
    x,
    y,
    time: 0,
    duration: big ? 12 : 9,
    big,
    color,
    bladed,
    direction: direction || 1,
  });
}

// the line an iai cut leaves through its target, drawn long and thin across the body
export function addCutLine(game, { x, y, angle, color }) {
  game.effects.push({ kind: 'cut', x, y, angle, color, time: 0, duration: 12 });
}

// one great curved slash across the whole field, through (x, y), as an ultimate's cuts all land
export function addScreenCut(game, { x, y, angle, color }) {
  game.effects.push({ kind: 'screenCut', x, y, angle, color, time: 0, duration: 16 });
}

export function addFloatText(game, { x, y, text, color }) {
  game.floaters.push({ x, y, text, color, time: 0, big: true });
}

export function showBanner(game, { text, color, time, sub }) {
  game.banner = { text, color, time, sub };
}
