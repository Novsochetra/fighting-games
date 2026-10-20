// the palisade that closes a forest road is a PixelLab sprite in assets/sprites/props/, drawn at
// the fighters' density; it hangs from its left end like the brick wall of the desert roads, its
// feet sunk a little into the road so it looks planted. A road's way in is the last road's wall
// broken open, standing at the start with its left edge on the road's edge; a road's closing wall
// stands whole on screen at the end of the road
export const PROP_SPRITES = {
  palisade: { file: 'palisade.png', feetX: 16, feetY: 110 },
  palisadeBroken: { file: 'palisadeBroken.png', feetX: 16, feetY: 110 },
  canyonBarricade: { file: 'canyonBarricade.png', feetX: 56, feetY: 108 },
  canyonBarricadeBroken: { file: 'canyonBarricadeBroken.png', feetX: 20, feetY: 108 },
  foundryGate: { file: 'foundry-gate.png', feetX: 88, feetY: 121 },
  foundryGateBroken: { file: 'foundry-gate-broken.png', feetX: 20, feetY: 121 },
};
