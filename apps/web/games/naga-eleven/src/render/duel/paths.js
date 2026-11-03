import { lerp } from './hash.js';

export const GROUND = 116;
export const KICKER = { x: 34, y: GROUND };
export const DEFENDER = { x: 196, y: GROUND };
export const KEEPER = { x: 202, y: GROUND };
export const NET = { x: 228, y: 84 };

// where a shot curls through on its way to the keeper, by the move's look: a naga rears up high,
// a rocket flies flat
const RISE = {
  naga: 18,
  'seven-naga': 50,
  'twin-naga': 44,
  garuda: 24,
  moon: 34,
  rocket: 96,
  sword: 58,
  plain: 74,
};

export function bezier(from, control, to, share) {
  const nearX = lerp(from.x, control.x, share);
  const farX = lerp(control.x, to.x, share);
  const nearY = lerp(from.y, control.y, share);
  const farY = lerp(control.y, to.y, share);

  return { x: lerp(nearX, farX, share), y: lerp(nearY, farY, share) };
}

export function approachPath({ attackKind, look, keeper }) {
  if (attackKind === 'dribble' || attackKind === 'pass') {
    const impact = { x: DEFENDER.x - 22, y: GROUND - 5 };

    return { from: { x: 60, y: GROUND - 5 }, control: { x: 110, y: GROUND - 5 }, impact };
  }

  const impact = keeper ? { x: KEEPER.x - 16, y: 78 } : { x: DEFENDER.x - 16, y: 84 };

  return {
    from: { x: 58, y: GROUND - 6 },
    control: { x: 108, y: RISE[look] ?? RISE.plain },
    impact,
  };
}

// where the ball goes once the moves have met, by what came of it
const AFTER = {
  goal: { control: { x: 214, y: 80 }, to: NET },
  through: { control: { x: 230, y: 90 }, to: { x: 280, y: 84 } },
  broke: { control: { x: 220, y: GROUND - 4 }, to: { x: 250, y: GROUND - 4 } },
  passed: { control: { x: 230, y: GROUND - 4 }, to: { x: 290, y: GROUND - 4 } },
  wide: { control: { x: 214, y: 40 }, to: { x: 250, y: 10 } },
  parried: { control: { x: 176, y: 30 }, to: { x: 140, y: 60 } },
  blocked: { control: { x: 150, y: 60 }, to: { x: 120, y: GROUND - 4 } },
  stolen: { control: { x: 150, y: GROUND - 4 }, to: { x: 130, y: GROUND - 4 } },
};

export function afterPath(word, impact, hold) {
  const path = AFTER[word];

  return path ? { from: impact, ...path } : { from: impact, control: hold, to: hold };
}
