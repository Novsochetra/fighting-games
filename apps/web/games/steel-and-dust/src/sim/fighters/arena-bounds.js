import { VIEW_WIDTH } from '../../config.js';

const MARGIN = 6;
// a boss keeps his whole body on the screen: half his width, in his own units (body-point.js)
const BOSS_HALF_WIDTH = 24;

function isLockedScreen(arena) {
  return arena.right - arena.left <= VIEW_WIDTH;
}

// the part of the road the fight happens in: a locked screen, or what the camera shows of a
// zone that scrolls
export function screenEdges(game) {
  const { arena, camera } = game;
  if (arena && isLockedScreen(arena)) {
    return { left: arena.left, right: arena.right };
  }
  const view = { left: camera.x, right: camera.x + VIEW_WIDTH };
  if (!arena) {
    return view;
  }
  return { left: Math.max(arena.left, view.left), right: Math.min(arena.right, view.right) };
}

// raiders walking in from off screen are free until they are well inside; checking that here
// is what ends their entrance
export function arenaBounds(game, fighter) {
  const { left, right } = screenEdges(game);
  if (fighter.side === 'enemy' && fighter.entering) {
    if (fighter.x > left + 10 && fighter.x < right - 10) {
      fighter.entering = false;
    }
    return { min: -999, max: 99999 };
  }
  const margin = fighter.def?.boss ? BOSS_HALF_WIDTH * fighter.scale : MARGIN;
  return { min: left + margin, max: right - margin };
}
