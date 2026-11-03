// the shootout seen from behind the kicker, on the same grid of art pixels as the cut-ins
export const PEN_GOAL = { left: 40, right: 216, bar: 30, line: 100 };
export const SPOT = { x: 128, y: 122 };
export const KEEPER_SPOT = { x: 128, y: PEN_GOAL.line };

// where a kick to each side ends up, by how hard it was struck
export const aimPoint = (aim, power = 0.6) => ({
  x: 128 + aim * 58,
  y: Math.round(PEN_GOAL.line - 16 - power * 34),
});

export const AIM_KEYS = [-1, 0, 1];
