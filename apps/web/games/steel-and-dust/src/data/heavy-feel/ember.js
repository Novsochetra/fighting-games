// how the Ember Shade moves through a heavy: its sprite leans back `lean` pixels over `leanTicks` as it winds
// up (drawn only, so its reach is the same) and it lunges as it strikes (a move with a lunge of its
// own keeps it); `moves` tunes one move by id. Wildfire is quick and fierce: it snaps back fast,
// coils there, and springs in hard
export const EMBER_HEAVY_FEEL = {
  lean: 4,
  leanTicks: 3,
  lunge: 2.2,
  afterimageEvery: 2,
  afterimageLife: 10,
  moves: {
    // the roundhouse steps right into the kick
    K1: { lunge: 2.6 },
    // the launcher drives up, not on
    UK: { lunge: 1 },
  },
};
