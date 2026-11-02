// the palisade that closes a forest road is a PixelLab sprite in assets/sprites/props/, drawn at
// the fighters' density; it hangs from its left end like the brick wall of the desert roads, its
// feet sunk a little into the road so it looks planted. A road's way in is the last road's wall
// broken open, standing at the start with its left edge on the road's edge; a road's closing wall
// stands whole on screen at the end of the road, by its `width`, known before its image loads.
// A broken wall's `doorway` is where the hero goes in and comes out, in the sprite's own pixels:
// the hero stands at its `middle`, behind the wall, and shows only through the wall's see-through
// gaps and, on a door, through its dark `inside` [left, top, right, bottom], which is painted
const DOORWAYS = {
  palisadeBroken: { middle: 41 },
  canyonBarricadeBroken: { middle: 70 },
  foundryGateBroken: { middle: 58, inside: [26, 20, 86, 118] },
  templeDoorBroken: { middle: 50, inside: [36, 42, 75, 118] },
  wardenGateBroken: { middle: 96, inside: [52, 48, 146, 186] },
  templeGateBroken: { middle: 54 },
};

const SPRITES = {
  palisade: { file: 'palisade.png', width: 82, feetX: 16, feetY: 110 },
  palisadeBroken: { file: 'palisadeBroken.png', width: 82, feetX: 16, feetY: 110 },
  canyonBarricade: { file: 'canyonBarricade.png', width: 128, feetX: 56, feetY: 108 },
  canyonBarricadeBroken: { file: 'canyonBarricadeBroken.png', width: 128, feetX: 20, feetY: 108 },
  foundryGate: { file: 'foundry-gate.png', width: 112, feetX: 88, feetY: 121 },
  foundryGateBroken: { file: 'foundry-gate-broken.png', width: 112, feetX: 20, feetY: 121 },
  templeDoor: { file: 'temple-door.png', width: 112, feetX: 84, feetY: 143 },
  templeDoorBroken: { file: 'temple-door-broken.png', width: 112, feetX: 16, feetY: 139 },
  wardenGate: { file: 'warden-gate.png', width: 196, feetX: 176, feetY: 202 },
  wardenGateBroken: { file: 'warden-gate-broken.png', width: 196, feetX: 20, feetY: 202 },
  templeGate: { file: 'temple-gate.png', width: 82, feetX: 70, feetY: 110 },
  templeGateBroken: { file: 'temple-gate-broken.png', width: 82, feetX: 16, feetY: 110 },
};

export const PROP_SPRITES = Object.fromEntries(
  Object.entries(SPRITES).map(([kind, sprite]) => [kind, { ...sprite, doorway: DOORWAYS[kind] }]),
);
