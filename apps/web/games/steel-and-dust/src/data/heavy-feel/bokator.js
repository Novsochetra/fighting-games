// how the Bokator moves through a heavy: its sprite leans back `lean` pixels over `leanTicks` as it winds
// up (drawn only, so its reach is the same) and it lunges as it strikes (a move with a lunge of its
// own keeps it); `moves` tunes one move by id. He coils deep over most of the wind-up, then plants
// and drives the whole body through; a launcher stays under the raider it lifts
export const BOKATOR_HEAVY_FEEL = {
  lean: 4,
  leanTicks: 7,
  lunge: 2.2,
  afterimageEvery: 2,
  afterimageLife: 10,
  moves: {
    K1: { lunge: 2.6 },
    LLK: { lunge: 1.6 },
    UK: { lunge: 1.1 },
  },
};
