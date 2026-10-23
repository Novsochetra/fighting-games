// how the Antler Spirit Shade moves through a heavy: its sprite leans back `lean` pixels over `leanTicks` as it winds
// up (drawn only, so its reach is the same) and it lunges as it strikes (a move with a lunge of its
// own keeps it); `moves` tunes one move by id. It is a charging stag: it lowers its head slowly and
// far, then throws its whole weight in, and its echoes hang behind it like the stampede's
export const ANTLER_HEAVY_FEEL = {
  lean: 4,
  leanTicks: 9,
  lunge: 2.4,
  afterimageEvery: 3,
  afterimageLife: 15,
  moves: {
    K1: { lunge: 2.8 },
    K3: { lunge: 2.6 },
    UK: { lunge: 1.2 },
    LLK: { lunge: 1.4 },
  },
};
