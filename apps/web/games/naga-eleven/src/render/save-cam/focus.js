import { hash } from '../duel/hash.js';
import { polygon } from '../duel/shapes.js';
import { channelsOf } from '../venues/kit/colour.js';

const LINES = 36;

// how far out from the aim the lines run, in art pixels: from past the view's edge in to `near`,
// so the goal and the keeper stand in a clear ring
const REACH = { far: 150, near: 62 };

// how strongly the lines are laid over the venue, which shows through the rest
const SHOW = 0.55;

const hexOf = (channels) =>
  `#${channels.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const halfway = (first, second) => {
  const others = channelsOf(second);

  return hexOf(channelsOf(first).map((value, i) => (value + others[i]) / 2));
};

// the lines' light by the sky behind the goal: over a night stand halfway from the move's light
// (its ramp's fourth, which carries its colour) to its palest, so they tint the stand rather than
// grey it; over a bright sky the light itself and stronger, as a pale line fades into the blue
export function focusLight(body, sky) {
  if (sky === 'day') {
    return { color: body[3], show: 0.85 };
  }

  return { color: halfway(body[3], body[4]), show: 0.7 };
}

// one line, a pixel wide where it ends nearest the aim and two at the view's edge
function line(pen, { centre, angle, near, far, color }) {
  const along = { x: Math.cos(angle), y: Math.sin(angle) };
  const side = { x: -along.y, y: along.x };
  const at = (reach, width) => [
    [centre.x + along.x * reach + side.x * width, centre.y + along.y * reach + side.y * width],
    [centre.x + along.x * reach - side.x * width, centre.y + along.y * reach - side.y * width],
  ];
  const [nearLeft, nearRight] = at(near, 0.55);
  const [farLeft, farRight] = at(far, 1.1);

  polygon(pen, [nearLeft, farLeft, farRight, nearRight], color);
}

// a comic's lines rushing in on the aim while the ball flies, thin and in the move's palest light,
// flickering every other tick; more of them the further it has flown
export function drawCamFocus(pen, { centre, color, tick, strength, show = SHOW }) {
  const beat = Math.floor(tick / 2);

  pen.context.save();
  pen.context.globalAlpha *= show;

  for (let i = 0; i < LINES; i += 1) {
    if (hash(i, beat, 71) <= strength) {
      const far = REACH.far + hash(i, 74) * 40;

      line(pen, {
        centre,
        angle: ((i + hash(i, beat, 72) * 0.6) / LINES) * Math.PI * 2,
        near: REACH.near + hash(i, beat, 73) * 40,
        far,
        color,
      });
    }
  }

  pen.context.restore();
}
