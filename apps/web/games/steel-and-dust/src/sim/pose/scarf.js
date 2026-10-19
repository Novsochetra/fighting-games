const LINKS = 7;
const LINK_LENGTH = 3;

export function attachScarf(fighter) {
  fighter.scarf = [];
  for (let i = 0; i < LINKS; i++) {
    const y = fighter.y - 26;
    fighter.scarf.push({ x: fighter.x, y, prevX: fighter.x, prevY: y });
  }
}

function integrate(fighter, tickCount) {
  const scarf = fighter.scarf;
  for (let i = 1; i < scarf.length; i++) {
    const link = scarf[i];
    const vx = (link.x - link.prevX) * 0.86;
    const vy = (link.y - link.prevY) * 0.86;
    link.prevX = link.x;
    link.prevY = link.y;
    link.x += vx - fighter.facing * 0.16 + Math.sin(tickCount * 0.15 + i) * 0.07;
    link.y += vy + 0.14;
  }
}

function constrain(scarf) {
  for (let i = 1; i < scarf.length; i++) {
    const anchor = scarf[i - 1];
    const link = scarf[i];
    const dx = link.x - anchor.x;
    const dy = link.y - anchor.y;
    const distance = Math.hypot(dx, dy) || 1;
    const stretch = (distance - LINK_LENGTH) / distance;
    link.x -= dx * stretch;
    link.y -= dy * stretch;
  }
}

// a tiny verlet rope: free secondary motion
export function updateScarf(fighter, tickCount) {
  const scarf = fighter.scarf;
  const neck = fighter.joints.neck;
  const anchorX = neck.x - fighter.facing * 2 * fighter.scale;
  const anchorY = neck.y + 2;
  scarf[0].x = scarf[0].prevX = anchorX;
  scarf[0].y = scarf[0].prevY = anchorY;
  integrate(fighter, tickCount);
  constrain(scarf);
  constrain(scarf);
}
