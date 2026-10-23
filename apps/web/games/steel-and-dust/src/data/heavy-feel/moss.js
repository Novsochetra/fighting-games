// how the Moss Shade moves through a heavy: a patient, even draw back over most of the wind-up (drawn
// only, so its reach is the same), then a firm step into the strike (a move that moves on its own
// keeps its own way); `moves` tunes one move by id, and `swing` names the arc its leaves follow
export const MOSS_HEAVY_FEEL = {
  lean: 4,
  leanTicks: 8,
  lunge: 2,
  afterimageEvery: 2,
  afterimageLife: 14,
  moves: {
    K1: { lunge: 2.6 },
    LLK: { lunge: 1.2, swing: 'rise' },
    UK: { lunge: 0.9, swing: 'rise' },
    AK: { swing: 'fall' },
    ADK: { swing: 'dive' },
  },
};
