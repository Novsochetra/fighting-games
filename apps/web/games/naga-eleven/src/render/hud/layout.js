import { VIEW } from '../../config.js';
import { PASS_COMBO } from '../../data/combos.js';

// The score and the player card keep to the top left, clear of the pause button a phone shows in
// the top right corner, and the minimap stands in the middle of the foot of the view, between the
// stick under the left thumb and the kicks under the right (src/data/skins/pitch-side.js)
export const MARGIN = { left: 10, top: 9 };
export const PAUSE_CLEARANCE = 66;
export const BAR_HEIGHT = 18;

export const SCORE_BUG = { x: MARGIN.left, y: MARGIN.top };
export const PLAYER_CARD = { x: MARGIN.left, y: MARGIN.top + BAR_HEIGHT + 6 };
export const RESTART_TAG = { y: MARGIN.top };

const MINIMAP_WIDTH = 116;
// no pitch is wider than this share of its length, so no minimap runs deeper
const DEEPEST_PITCH = 0.6;
// an iPhone held sideways keeps its home bar 21 points over the foot of the screen, 23 of the
// view's pixels, and the minimap stands a little over that
const MINIMAP_FOOT = 30;
// the score bug and the player card, with room for a long name and a Khmer line
const LEFT_BOXES = { width: 160, height: PLAYER_CARD.y + 34 };
const PAUSE_BUTTON = { width: PAUSE_CLEARANCE, height: 52 };

// the lowest row the boxes along the top reach, in the view's pixels
export const HUD_BOTTOM = LEFT_BOXES.height;
// the highest row the minimap's frame reaches, on the deepest pitch
export const MINIMAP_TOP =
  VIEW.height - MINIMAP_FOOT - Math.round(MINIMAP_WIDTH * DEEPEST_PITCH) - 2;

// the big banners (GOAL, KICK OFF) cross the lower third, just over the minimap even with a
// scorer's Khmer line under the band (`tallest`): the camera frames a goal's scorer and the ball
// in the net by the middle of the view, and the HUD holds the top. A goal whose scorer stood low
// in the view crosses just under the HUD instead (banner-slot.js).
const BANNER_HEIGHT = 38;
const TALLEST_BANNER = BANNER_HEIGHT + 16;

export const BANNER = {
  y: MINIMAP_TOP - 6 - TALLEST_BANNER,
  height: BANNER_HEIGHT,
  tallest: TALLEST_BANNER,
};
export const HIGH_BANNER = { y: 92 };

// the minimap keeps the pitch's shape, centred along the foot of the view
export function minimapRect(match) {
  const height = Math.round((MINIMAP_WIDTH * match.pitch.width) / match.pitch.length);

  return {
    x: Math.round((VIEW.width - MINIMAP_WIDTH) / 2),
    y: VIEW.height - MINIMAP_FOOT - height,
    width: MINIMAP_WIDTH,
    height,
  };
}

// a side's combo counter: the steered side's under the player card, the other's in the top right
// corner by the pause button, where it reads as the one being built against him
export const COMBO_COUNTER = { width: 96, height: 48 };

const counterSide = (match, team) => (team === (match.humanTeam ?? 0) ? 'left' : 'right');

export function comboRect(match, team) {
  const x =
    counterSide(match, team) === 'left'
      ? MARGIN.left
      : VIEW.width - PAUSE_CLEARANCE - COMBO_COUNTER.width;
  const y = counterSide(match, team) === 'left' ? HUD_BOTTOM + 5 : MARGIN.top;

  return { x, y, ...COMBO_COUNTER, side: counterSide(match, team) };
}

const comboBoxes = (match) =>
  match.combo && match.combo.level >= PASS_COMBO.showFrom
    ? [comboRect(match, match.combo.team)]
    : [];

// what covers the view, frames and all: the score and the card at the top left, the pause button
// a phone shows in the corner, the minimap at the foot, and a combo counter while one shows
export function hudBoxes(match) {
  const minimap = minimapRect(match);

  return [
    { x: 0, y: 0, ...LEFT_BOXES },
    { x: VIEW.width - PAUSE_BUTTON.width, y: 0, ...PAUSE_BUTTON },
    { x: minimap.x - 2, y: minimap.y - 2, width: minimap.width + 4, height: minimap.height + 4 },
    ...comboBoxes(match),
  ];
}
