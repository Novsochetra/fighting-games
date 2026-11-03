// light on the grass, as tone added to its stripe: a day stand's shadow over the far side, or the
// pools of floodlights at night, brightest in the middle and round the towers, darker at the ends
export const standShadow =
  ({ pitch }, { reach = 70, slope = 50, depth = 1.8 } = {}) =>
  (x, y) =>
    y < reach + (x / pitch.length) * slope ? -depth : 0;

export function floodlit({ pitch }, { strength = 2.2, lift = -0.6 } = {}) {
  const towers = [0, pitch.length].flatMap((x) => [-60, pitch.width + 60].map((y) => ({ x, y })));
  const spread = (pitch.length * 0.32) ** 2;

  return (x, y) => {
    const along = (x - pitch.length / 2) / (pitch.length * 0.7);
    const across = (y - pitch.width / 2) / pitch.width;
    const pools = towers.reduce(
      (sum, tower) => sum + Math.exp(-((x - tower.x) ** 2 + (y - tower.y) ** 2) / spread),
      0,
    );

    return lift + strength * (0.5 - along * along * 1.1 - across * across * 0.8 + pools * 0.45);
  };
}
