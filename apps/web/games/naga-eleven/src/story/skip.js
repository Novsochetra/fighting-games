// about half a second at 60 ticks a second
export const SKIP_TICKS = 30;

// a tap on the skip tag only asks; a second tap within two seconds skips, so a stray thumb never
// throws a scene away
export const SKIP_ASK_TICKS = 120;

export const freshSkip = () => ({ skipCarried: true, skipHeld: 0, skipAskedAt: null });

export const skipProgress = (state) => Math.min(1, state.skipHeld / SKIP_TICKS);

export const isSkipAsked = (state) =>
  state.skipAskedAt !== null && state.tick - state.skipAskedAt < SKIP_ASK_TICKS;

// a held skip (a pad's B) fills the tag's bar; one already held as the scene came up must be let go
export function holdSkip(state, skip) {
  state.skipHeld = skip && !state.skipCarried ? state.skipHeld + 1 : 0;
  state.skipCarried = skip && state.skipCarried;

  return state.skipHeld >= SKIP_TICKS;
}

export function tapEndsScene(state) {
  if (isSkipAsked(state)) {
    return true;
  }

  state.skipAskedAt = state.tick;

  return false;
}

export function forgetSkip(state) {
  state.skipAskedAt = null;
}
