export const firstTurn = () => ({ current: 0, previous: null });

export const nextTurn = ({ current }, count) => ({
  current: (current + 1) % count,
  previous: current,
});

// The banners a turn draws, by their place in the list: the one shown, fading in over the one it
// follows (leaving, still whole under it), and the next, unseen, so it is loaded before its turn.
// The rest are not drawn at all, so a visitor loads three pictures, not every one.
export function bannerStates({ current, previous }, count) {
  const states = new Map([[current, 'shown']]);
  const next = (current + 1) % count;

  if (previous !== null && previous !== current) {
    states.set(previous, 'leaving');
  }

  if (!states.has(next)) {
    states.set(next, 'waiting');
  }

  return states;
}
