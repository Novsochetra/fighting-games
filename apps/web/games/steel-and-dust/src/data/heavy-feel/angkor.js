// how the Angkor Warrior moves through a heavy: he draws back slowly and deep (drawn only, so his
// reach is the same) and plants one firm, short step as he strikes, never a dash; the Tempest is
// thrown from where he stands and the launcher rises more than it travels. His afterimages are
// spaced and sandstone, like the poses carved along the Bayon's walls
export const ANGKOR_HEAVY_FEEL = {
  lean: 4,
  leanTicks: 7,
  lunge: 1.1,
  afterimageEvery: 3,
  afterimageLife: 14,
  moves: {
    K1: { lunge: 1.4 },
    K3: { lunge: 0.7 },
    UK: { lunge: 0.5 },
    LLK: { lunge: 0.6 },
    C2: { lunge: 0.9 },
  },
};
