// how the Firefly Shade moves through a heavy: its sprite leans back `lean` pixels over `leanTicks` as it winds
// up (drawn only, so its reach is the same) and it lunges as it strikes (a move with a lunge of its
// own keeps it); `moves` tunes one move by id. Light on its feet: a quick, shallow draw-back and a
// skip forward into the blow, but a launcher stays under the raider it lifts
export const FIREFLY_HEAVY_FEEL = {
  lean: 3,
  leanTicks: 3,
  lunge: 2.2,
  afterimageEvery: 2,
  afterimageLife: 10,
  moves: {
    K1: { lunge: 2.6 },
    UK: { lunge: 0.8 },
    LLK: { lunge: 1.2 },
  },
};
