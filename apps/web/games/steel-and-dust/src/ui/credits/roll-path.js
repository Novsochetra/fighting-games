// the time a line takes to cross the whole screen, so a phone and a wide screen roll alike
export const SCREEN_SECONDS = 9;

// the roll comes up from just under the screen and stops with its finale in the middle, at one
// steady speed; a window with no height yet (laid out later) still gets a path it can end
export function rollPath({ windowHeight, finaleCenter }) {
  const screen = Math.max(windowHeight, 1);
  const to = Math.round(screen / 2 - finaleCenter);
  const seconds = ((screen - to) / screen) * SCREEN_SECONDS;

  return { from: screen, to, seconds: Math.round(seconds * 100) / 100 };
}
