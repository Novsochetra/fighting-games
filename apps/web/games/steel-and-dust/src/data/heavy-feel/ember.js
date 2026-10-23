// how the Ember Shade moves through a heavy: its sprite leans back `lean` pixels over `leanTicks` as it winds
// up (drawn only, so its reach is the same) and it lunges as it strikes (a move with a lunge of its
// own keeps it); `moves` tunes one move by id
export const EMBER_HEAVY_FEEL = {
  lean: 3,
  leanTicks: 6,
  lunge: 1.6,
  afterimageEvery: 2,
  afterimageLife: 12,
  moves: {},
};
