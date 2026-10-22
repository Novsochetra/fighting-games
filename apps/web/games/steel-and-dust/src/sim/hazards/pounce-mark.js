// the spot a pounce will land on, marked while the pouncer is in the air: it strikes nothing itself
export function markPounce(game, { x, y, side, life }) {
  game.projectiles.push({
    kind: 'pounceMark',
    x,
    y,
    direction: 1,
    speed: 0,
    side,
    time: 0,
    life,
  });
}

export function fadeMark(_game, mark) {
  mark.dead = mark.time >= mark.life;
}
