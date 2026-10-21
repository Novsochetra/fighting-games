// a flight is a list of [tick, x, y] points; between two points the summon moves in a straight line,
// and each stretch between them is a leg
export function legAt(flight, time) {
  let leg = 0;
  while (leg < flight.length - 2 && time >= flight[leg + 1][0]) {
    leg++;
  }
  return leg;
}

export function pointOnLeg(flight, leg, time) {
  const [from, x0, y0] = flight[leg];
  const [to, x1, y1] = flight[leg + 1];
  const along = Math.min(1, Math.max(0, (time - from) / (to - from)));
  return [x0 + (x1 - x0) * along, y0 + (y1 - y0) * along];
}

export function flightOver(flight, time) {
  return time >= flight[flight.length - 1][0];
}
