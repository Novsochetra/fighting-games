// how the Blue Shade moves through a heavy: an iai draw, so it coils back fast and then holds still
// (`lean` pixels reached in `leanTicks`, drawn only, so its reach is the same) before one decisive
// dash as it strikes (a move with a lunge of its own keeps it); `moves` tunes one move by id
export const BLUE_HEAVY_FEEL = {
  lean: 5,
  leanTicks: 4,
  lunge: 2.6,
  afterimageEvery: 2,
  afterimageLife: 10,
  moves: {
    K1: { lunge: 3 },
    // the launchers rise rather than rush, and Tempest's wave does the travelling
    LLK: { lunge: 2 },
    UK: { lunge: 1.2 },
    K3: { lunge: 1.4 },
  },
};
