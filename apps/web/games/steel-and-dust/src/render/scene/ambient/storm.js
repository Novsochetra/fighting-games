// three slow swells of different lengths never quite line up, so the storm thickens and thins
// on an irregular beat instead of a steady pulse; every sand effect reads the same strength
const SWELLS = [
  { rate: 0.0045, phase: 0, weight: 0.55 },
  { rate: 0.0117, phase: 1.7, weight: 0.3 },
  { rate: 0.031, phase: 0.4, weight: 0.15 },
];

export function stormStrength(tick) {
  let sum = 0;
  for (const { rate, phase, weight } of SWELLS) {
    sum += Math.sin(tick * rate + phase) * weight;
  }
  return (sum + 1) / 2;
}
