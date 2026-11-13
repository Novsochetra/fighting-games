import { SHOT_ART } from '../../colors.js';
import { PROFILE } from './shape.js';

const { ink } = SHOT_ART;

const POST = SHOT_ART.stadium.post;

// stepped on whole pixels, as a sprite's line, never a smoothed one
function tube(pen, { from, to, colours, thick = 2 }) {
  const steps = Math.max(1, Math.round(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))));
  const upright = Math.abs(to.y - from.y) >= Math.abs(to.x - from.x);

  for (const [layer, grow] of [
    [ink, 1],
    [null, 0],
  ]) {
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.round(from.x + ((to.x - from.x) * i) / steps);
      const y = Math.round(from.y + ((to.y - from.y) * i) / steps);

      pen.rect(
        upright ? [x - grow, y, thick + grow * 2, 1] : [x, y - grow, 1, thick + grow * 2],
        layer,
      );

      if (!layer) {
        pen.dot(x, y, colours.lit);
        pen.rect(upright ? [x + 1, y, thick - 1, 1] : [x, y + 1, 1, thick - 1], colours.shade);
      }
    }
  }
}

const NEAR = { lit: POST[3], shade: POST[2] };

const FAR = { lit: POST[2], shade: POST[1] };

// the Naga's light catches the white on the side it comes from
export function frameColours(side, lit) {
  const colours = side === 'near' ? NEAR : FAR;

  if (lit >= 0.75) {
    return { ...colours, lit: SHOT_ART.emerald[4] };
  }

  return lit >= 0.45 ? { ...colours, lit: SHOT_ART.emerald[3] } : colours;
}

// `sway` bends its top, as the bar shudders from a shot
export function drawSideFrame(pen, { view, side, colours, sway = 0 }) {
  const at = (name) => view.at(PROFILE[name], side);
  const top = (point) => ({ x: point.x + sway, y: point.y });
  const thick = side === 'near' ? 3 : 2;

  tube(pen, { from: at('post'), to: at('back'), colours: FAR, thick: 1 });
  tube(pen, { from: top(at('support')), to: at('back'), colours: FAR, thick: 1 });
  tube(pen, { from: top(at('bar')), to: top(at('support')), colours: FAR, thick: 1 });
  tube(pen, { from: top(at('bar')), to: at('post'), colours, thick });
}

export function drawCrossbar(pen, { view, colours, sway = 0 }) {
  const near = view.at(PROFILE.bar, 'near');
  const far = view.at(PROFILE.bar, 'far');

  tube(pen, {
    from: { x: far.x + sway, y: far.y - 1 },
    to: { x: near.x + sway, y: near.y - 1 },
    colours,
    thick: 3,
  });
}

export function drawBackBar(pen, { view }) {
  tube(pen, {
    from: view.at(PROFILE.back, 'far'),
    to: view.at(PROFILE.back, 'near'),
    colours: FAR,
    thick: 1,
  });
}
