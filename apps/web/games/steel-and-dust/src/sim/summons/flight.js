// a flight is a list of [tick, x, y] points; between two points the summon moves in a straight line,
// and each stretch between them is a leg. A point may carry a fourth number, a hop: the leg into it
// then arcs that many px above the straight line, highest halfway
export function legAt(flight, time) {
  let leg = 0;
  while (leg < flight.length - 2 && time >= flight[leg + 1][0]) {
    leg++;
  }
  return leg;
}

// how far along its leg the summon is, from 0 where the leg starts to 1 where it ends
export function progressOnLeg(flight, leg, time) {
  const from = flight[leg][0];
  const to = flight[leg + 1][0];
  return Math.min(1, Math.max(0, (time - from) / (to - from)));
}

export function pointOnLeg(flight, leg, time) {
  const [, x0, y0] = flight[leg];
  const [, x1, y1, hop = 0] = flight[leg + 1];
  const along = progressOnLeg(flight, leg, time);
  const lift = 4 * hop * along * (1 - along);
  return [x0 + (x1 - x0) * along, y0 + (y1 - y0) * along - lift];
}

export function flightOver(flight, time) {
  return time >= flight[flight.length - 1][0];
}
