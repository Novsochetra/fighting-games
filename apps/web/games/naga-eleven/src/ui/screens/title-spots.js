import { isPortrait } from '../../../../../packages/screen/src/stage-fit.js';

// where the title art (src/render/title/, 216 art px high) leaves room for words, as shares of
// the stage: its sky ends at the crown of the Naga's middle head, the boy stands from his hair to
// his feet just over the foot of the picture, and right of his ball lies the empty causeway
export const TITLE_ART_LAYOUT = Object.freeze({
  headsTop: 41 / 216,
  boyTop: 161 / 216,
  feet: 205 / 216,
  pastBall: 0.56,
});

// the least the smallest logo with its subtitle, and the smallest prompt, stand in (title.css);
// the prompt's least keeps Khmer's marks a pixel clear of the boy's feet and of the screen's foot
export const HEAD_ROOM = 64;
export const PROMPT_ROOM = 24;
const PROMPT_ROOM_OUTSIDE = 30;
const SIDE = 16;
const GAP = 8;
const OVER_CROWN = 2;

// under a stage at the top, the logo takes the upper part of the dark and the prompt the rest
const LOGO_SHARE_UNDER = 0.45;

const box = ({ left, top, right, bottom }) => ({
  x: left,
  y: top,
  width: Math.max(0, right - left),
  height: Math.max(0, bottom - top),
});

function frameOf({ stage, screen, safe }) {
  const right = screen.width - safe.right;

  return {
    left: safe.left,
    top: safe.top,
    right,
    bottom: screen.height - safe.bottom,
    stageLeft: Math.max(stage.x, safe.left),
    stageRight: Math.min(stage.x + stage.width, right),
    stageBottom: stage.y + stage.height,
    at: (share) => stage.y + share * stage.height,
  };
}

function headBoxes(stage, frame) {
  const wide = { left: frame.left + SIDE, right: frame.right - SIDE };
  const sky = box({
    left: frame.stageLeft + SIDE,
    right: frame.stageRight - SIDE,
    top: Math.max(stage.y, frame.top),
    bottom: frame.at(TITLE_ART_LAYOUT.headsTop) - OVER_CROWN,
  });
  const below = frame.stageBottom + GAP;

  return {
    sky,
    above: box({ ...wide, top: frame.top, bottom: stage.y - GAP }),
    below: box({ ...wide, top: below, bottom: below + (frame.bottom - below) * LOGO_SHARE_UNDER }),
  };
}

// sideways, the logo stands in the art's own sky; upright, the sky is too low for it, and it
// stands over the stage, or under it when the stage stands at the top over the touch controls
function headSpot({ stage, screen }, frame) {
  const boxes = headBoxes(stage, frame);
  const order = isPortrait(screen.width, screen.height)
    ? ['above', 'below', 'sky']
    : ['sky', 'above', 'below'];
  const fits = order.find((place) => boxes[place].height >= HEAD_ROOM);
  const tallest = [...order].sort((one, other) => boxes[other].height - boxes[one].height)[0];
  const place = fits ?? tallest;

  return { place, ...boxes[place] };
}

// the prompt stands under the boy: under the stage where there is room, else on the causeway
// under his feet; a phone held sideways has too little of either (and a home bar over what there
// is), so there it stands on the causeway past his ball, at his feet
function promptSpot(stage, frame, head) {
  const outside = { left: frame.left, right: frame.right, bottom: frame.bottom };
  const feet = frame.at(TITLE_ART_LAYOUT.feet);

  if (head.place === 'below') {
    return { place: 'below', ...box({ ...outside, top: head.y + head.height }) };
  }

  const under = box({ ...outside, top: frame.stageBottom });

  if (under.height >= PROMPT_ROOM_OUTSIDE) {
    return { place: 'below', ...under };
  }

  const atFeet = box({
    left: frame.stageLeft,
    right: frame.stageRight,
    top: feet,
    bottom: Math.min(frame.stageBottom, frame.bottom),
  });

  if (atFeet.height >= PROMPT_ROOM) {
    return { place: 'feet', ...atFeet };
  }

  return {
    place: 'beside',
    ...box({
      left: stage.x + TITLE_ART_LAYOUT.pastBall * stage.width,
      right: frame.stageRight,
      top: frame.at(TITLE_ART_LAYOUT.boyTop),
      bottom: Math.min(feet, frame.bottom),
    }),
  };
}

// `stage` is where the canvas stands, `screen` the window's size and `safe` its insets, all in
// CSS px; each spot is a box { place, x, y, width, height } the words are set in
export function titleSpots({ stage, screen, safe }) {
  const frame = frameOf({ stage, screen, safe });
  const head = headSpot({ stage, screen }, frame);

  return { head, prompt: promptSpot(stage, frame, head) };
}
