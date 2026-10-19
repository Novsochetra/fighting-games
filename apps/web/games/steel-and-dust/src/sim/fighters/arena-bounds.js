import { VIEW_WIDTH, WORLD_WIDTH } from '../../config.js';

const MARGIN = 6;

function playerBounds(game) {
  if (game.arena) {
    return { min: game.arena.left + MARGIN, max: game.arena.right - MARGIN };
  }
  const cameraX = game.camera.x;
  return {
    min: Math.max(MARGIN, cameraX + MARGIN),
    max: Math.min(WORLD_WIDTH - MARGIN, cameraX + VIEW_WIDTH - MARGIN),
  };
}

export function screenEdges(game) {
  if (game.arena) {
    return { left: game.arena.left, right: game.arena.right };
  }
  return { left: game.camera.x, right: game.camera.x + VIEW_WIDTH };
}

// raiders walking in from off screen are free until they are well inside; checking that here
// is what ends their entrance
export function arenaBounds(game, fighter) {
  if (fighter.side === 'player') {
    return playerBounds(game);
  }
  const { left, right } = screenEdges(game);
  if (fighter.entering) {
    if (fighter.x > left + 10 && fighter.x < right - 10) {
      fighter.entering = false;
    }
    return { min: -999, max: 99999 };
  }
  return { min: left + MARGIN, max: right - MARGIN };
}
