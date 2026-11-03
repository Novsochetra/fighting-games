// A slot's `along` is how far up the pitch it stands with the ball on the centre spot (0 on its
// own goal line, 1 on the one it attacks) and `across` a share of the width from its left touchline,
// so each side's shape mirrors the other's through the centre spot.
const FORMATION_7 = [
  { role: 'keeper', along: 0.03, across: 0.5 },
  { role: 'defender', along: 0.2, across: 0.3 },
  { role: 'defender', along: 0.2, across: 0.7 },
  { role: 'midfielder', along: 0.4, across: 0.16 },
  { role: 'midfielder', along: 0.36, across: 0.5 },
  { role: 'midfielder', along: 0.4, across: 0.84 },
  { role: 'forward', along: 0.6, across: 0.5 },
];

const FORMATION_11 = [
  { role: 'keeper', along: 0.03, across: 0.5 },
  { role: 'defender', along: 0.21, across: 0.85 },
  { role: 'defender', along: 0.18, across: 0.62 },
  { role: 'defender', along: 0.18, across: 0.38 },
  { role: 'defender', along: 0.21, across: 0.15 },
  { role: 'midfielder', along: 0.38, across: 0.68 },
  { role: 'midfielder', along: 0.32, across: 0.5 },
  { role: 'midfielder', along: 0.38, across: 0.32 },
  { role: 'forward', along: 0.58, across: 0.84 },
  { role: 'forward', along: 0.62, across: 0.5 },
  { role: 'forward', along: 0.58, across: 0.16 },
];

// world units are drawn as pixels at the near touchline, where a player stands about 40 tall
export const FORMATS = {
  7: {
    id: '7',
    players: 7,
    pitch: { length: 1200, width: 640 },
    goal: { width: 110, height: 50, depth: 30 },
    box: { depth: 180, width: 380 },
    goalArea: { depth: 60, width: 200 },
    penaltySpot: 130,
    centreCircle: 100,
    halfSeconds: 100,
    halfMinutes: 20,
    kicker: 6,
    formation: FORMATION_7,
  },
  11: {
    id: '11',
    players: 11,
    pitch: { length: 1800, width: 1080 },
    goal: { width: 140, height: 56, depth: 34 },
    box: { depth: 270, width: 600 },
    goalArea: { depth: 90, width: 300 },
    penaltySpot: 180,
    centreCircle: 150,
    halfSeconds: 150,
    halfMinutes: 45,
    kicker: 9,
    formation: FORMATION_11,
  },
};
