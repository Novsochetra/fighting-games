import { easeOut } from '../../duel/hash.js';
import { drawBoing, drawRoundBelly, squashOf } from '../../duel/looks/belly.js';
import { pantherParts } from '../../duel/looks/panther.js';
import { drawParts } from '../../duel/parts.js';

// Panther Dive: a panther of shadow springs out of the keeper with his dive, paws reaching for
// the ball, and is gone once he has it
export function pantherFront(pen, { art, flight, since, pose }) {
  const share = since >= 0 ? 1 : easeOut((flight - 0.5) / 0.5);
  const fade = since > 0 ? Math.max(0, 1 - since / 20) : 1;
  const facing = pose.mirror ? -1 : 1;

  if (share <= 0 || fade <= 0) {
    return;
  }

  pen.context.save();
  pen.context.globalAlpha *= Math.min(1, share * 1.5) * fade;
  drawParts(
    pen,
    pantherParts({
      x: pose.gloves.x - facing * (28 - share * 6),
      y: pose.gloves.y + 2,
      facing,
      angle: -0.15 * facing,
      art,
    }),
  );
  pen.context.restore();
}

// Belly Block: Dara blows his belly up round as a ball and the shot bounces off it; stars spin
// round his head
export function bellyFront(pen, { art, flight, since, holds, pose }) {
  const puff = since >= 0 ? 1 : easeOut((flight - 0.3) / 0.6);
  const radius = 17 * (holds || since < 0 ? puff : Math.max(0, 1 - since / 8));
  const at = { x: pose.x, y: pose.y - 26 };

  if (radius < 2) {
    return;
  }

  drawRoundBelly(pen, { ...at, radius, squash: squashOf(since), art });

  if (holds && since >= 0 && since < 40) {
    drawBoing(pen, { at, head: { x: pose.x, y: pose.y - 64 }, radius, since, art });
  }
}
