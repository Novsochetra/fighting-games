// one art pixel is one pixel of a player's sprite, and the camera draws it a whole number of the
// lab's pixels wide (UNITS), never a share of one, so the art stays square
export const WORLD = { width: 760, height: 300 };

export const VIEW = { width: 768, height: 432 };

export const UNITS = { least: 2, most: 6 };

export const GROUND = 232;

export const KICK_SPOT = { x: 150, y: GROUND };

export const BALL_REST = { x: 163, y: GROUND - 6 };

// a goal stands taller than a man: 2.44 m to his 1.8, the 58 pixels the sprite stands
export const GOAL = { line: 640, height: 78, depth: 34 };

export const KEEPER_SPOT = { x: 616, y: GROUND };

export const CONTACTS = {
  goal: { x: GOAL.line + 2, y: GROUND - 46 },
  catch: { x: KEEPER_SPOT.x - 14, y: GROUND - 40 },
  punch: { x: KEEPER_SPOT.x - 14, y: GROUND - 50 },
  parry: { x: KEEPER_SPOT.x - 14, y: GROUND - 34 },
  post: { x: GOAL.line, y: GROUND - GOAL.height + 2 },
};

export const ENDINGS = Object.keys(CONTACTS);
