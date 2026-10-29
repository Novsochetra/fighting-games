import { hasOwn } from '../../../lib/objects.js';

// the cut of an iai draw runs flat ahead, except where the move rises (the launchers) or drops
const STRIKE_ANGLE = { UK: -1.25, LLK: -1.1, AK: 0.7, ADK: 0.55 };
const FLAT_ANGLE = -0.06;
// the cut starts clear of the Shade's own body and runs no higher than its chest, so it never
// crosses the hero or hides a face; a falling cut opens nearer its middle for the same reason
const CLEAR = 8;
const CHEST = 24;
const NO_HITBOX = [4, -28, 20, 12];

// the line the Blue Shade's draw cuts through the air: through the middle of where the blow lands,
// from just ahead of the body to a little past the reach; its cold flash opens where it starts
export function strikeLineOf(fighter, move) {
  const [left, top, width, height] = move.hitbox ?? NO_HITBOX;
  const tilted = hasOwn(STRIKE_ANGLE, move.id);
  const angle = tilted ? STRIKE_ANGLE[move.id] : FLAT_ANGLE;
  const dx = Math.cos(angle) * fighter.facing;
  const dy = Math.sin(angle);
  const half = (tilted ? Math.max(width, height) : width) / 2 + 6;
  const center = {
    x: fighter.x + fighter.facing * (left + width / 2),
    y: Math.max(fighter.y + top + height / 2, fighter.y - CHEST),
  };
  const back = half * (dy > 0.3 ? 0.3 : 0.6);
  const backX = center.x - dx * back;
  const shift = fighter.facing * Math.max(0, CLEAR - (backX - fighter.x) * fighter.facing);
  return {
    from: { x: backX + shift, y: center.y - dy * back },
    to: { x: center.x + dx * half + shift, y: center.y + dy * half },
  };
}
