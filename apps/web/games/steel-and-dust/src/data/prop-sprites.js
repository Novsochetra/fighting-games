// the palisade that closes a forest road is a PixelLab sprite in assets/sprites/props/, drawn at
// the fighters' density; it hangs from its left end like the brick wall of the desert roads, its
// feet sunk a little into the road so it looks planted. The foundry gate closes the Iron Works
// standing whole on screen, and its blown-open twin is the way into the next road, so it stands
// at the start with its left edge on the road's edge
export const PROP_SPRITES = {
  palisade: { file: 'palisade.png', feetX: 16, feetY: 110 },
  foundryGate: { file: 'foundry-gate.png', feetX: 88, feetY: 121 },
  foundryGateBroken: { file: 'foundry-gate-broken.png', feetX: 20, feetY: 121 },
};
